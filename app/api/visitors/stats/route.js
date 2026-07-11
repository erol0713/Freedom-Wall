import { NextResponse } from 'next/server';
import connectDB from '../../../utils/db';
import Visitor from '../../../models/Visitor';

export const dynamic = 'force-dynamic';

/**
 * GET /api/visitors/stats
 * Returns aggregated analytics for the admin dashboard.
 */
export async function GET() {
  try {
    await connectDB();

    // Mark stale visitors offline
    const staleThreshold = new Date(Date.now() - 60 * 1000);
    await Visitor.updateMany(
      { isOnline: true, lastHeartbeat: { $lt: staleThreshold } },
      { $set: { isOnline: false } }
    );

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    // Run all aggregations in parallel
    const [
      totalVisitors,
      onlineNow,
      todayVisitors,
      referrerStats,
      browserStats,
      deviceStats,
      countryStats,
      dailyVisits,
      avgStats,
    ] = await Promise.all([
      // Total unique visitors
      Visitor.countDocuments(),

      // Currently online
      Visitor.countDocuments({ isOnline: true }),

      // Visitors today (visited today)
      Visitor.countDocuments({ lastVisit: { $gte: todayStart } }),

      // Top referrer sources
      Visitor.aggregate([
        { $group: { _id: '$referrerSource', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      // Top browsers
      Visitor.aggregate([
        { $group: { _id: '$browser', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      // Device split
      Visitor.aggregate([
        { $group: { _id: '$device', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // Top countries
      Visitor.aggregate([
        { $match: { country: { $ne: null } } },
        { $group: { _id: { country: '$country', code: '$countryCode' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      // Daily visits (last 7 days)
      (() => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          d.setHours(0, 0, 0, 0);
          days.push(d);
        }
        return Visitor.aggregate([
          {
            $match: {
              lastVisit: { $gte: days[0] },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$lastVisit' },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]).then(results => {
          // Fill in missing days with 0
          return days.map(d => {
            const dateStr = d.toISOString().split('T')[0];
            const found = results.find(r => r._id === dateStr);
            return {
              date: dateStr,
              label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
              count: found ? found.count : 0,
            };
          });
        });
      })(),

      // Average pages per visit and avg visit count
      Visitor.aggregate([
        {
          $group: {
            _id: null,
            avgVisitCount: { $avg: '$visitCount' },
            avgPages: { $avg: { $size: { $ifNull: ['$pages', []] } } },
          },
        },
      ]),
    ]);

    return NextResponse.json({
      totalVisitors,
      onlineNow,
      todayVisitors,
      avgPagesPerVisit: avgStats[0]?.avgPages?.toFixed(1) || '0',
      avgVisitCount: avgStats[0]?.avgVisitCount?.toFixed(1) || '0',
      referrerSources: referrerStats.map(r => ({ source: r._id || 'unknown', count: r.count })),
      browsers: browserStats.map(b => ({ name: b._id || 'Unknown', count: b.count })),
      devices: deviceStats.map(d => ({ type: d._id || 'unknown', count: d.count })),
      countries: countryStats.map(c => ({
        country: c._id?.country || 'Unknown',
        code: c._id?.code || 'XX',
        count: c.count,
      })),
      dailyVisits,
    });
  } catch (error) {
    console.error('Error fetching visitor stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}

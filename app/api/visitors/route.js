import { NextResponse } from 'next/server';
import connectDB from '../../utils/db';
import Visitor from '../../models/Visitor';

export const dynamic = 'force-dynamic';

/**
 * GET /api/visitors
 * Returns visitors for the admin dashboard.
 * 
 * Query params:
 *   ?status=online — only currently online visitors
 *   ?sort=lastVisit|visitCount|firstVisit (default: lastVisit)
 *   ?order=desc|asc (default: desc)
 *   ?limit=50&page=1 — pagination
 *   ?search=keyword — search by IP, browser, country, city, OS
 */
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const sort = searchParams.get('sort') || 'lastVisit';
    const order = searchParams.get('order') === 'asc' ? 1 : -1;
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const search = searchParams.get('search');
    const skip = (page - 1) * limit;

    // First, mark stale visitors as offline
    const staleThreshold = new Date(Date.now() - 60 * 1000);
    await Visitor.updateMany(
      { isOnline: true, lastHeartbeat: { $lt: staleThreshold } },
      { $set: { isOnline: false } }
    );

    // Build filter
    const filter = {};

    if (status === 'online') {
      filter.isOnline = true;
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { ipAddress: regex },
        { browser: regex },
        { os: regex },
        { country: regex },
        { city: regex },
        { referrerSource: regex },
        { fingerprintId: regex },
        { device: regex },
        { language: regex },
        { timezone: regex },
      ];
    }

    // Build sort object
    const sortObj = {};
    sortObj[sort] = order;

    const [visitors, total] = await Promise.all([
      Visitor.find(filter)
        .select('-sessions -pages -userAgent')
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      Visitor.countDocuments(filter),
    ]);

    const hasMore = skip + visitors.length < total;

    return NextResponse.json({
      visitors: visitors.map(v => ({
        ...v,
        _id: v._id.toString(),
      })),
      total,
      hasMore,
      page,
    });
  } catch (error) {
    console.error('Error fetching visitors:', error);
    return NextResponse.json({ error: 'Failed to fetch visitors' }, { status: 500 });
  }
}

/**
 * GET visitor detail by ID
 */
export async function POST(request) {
  try {
    await connectDB();
    const { visitorId } = await request.json();
    
    if (!visitorId) {
      return NextResponse.json({ error: 'Missing visitorId' }, { status: 400 });
    }

    const visitor = await Visitor.findById(visitorId).lean();
    if (!visitor) {
      return NextResponse.json({ error: 'Visitor not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...visitor,
      _id: visitor._id.toString(),
    });
  } catch (error) {
    console.error('Error fetching visitor detail:', error);
    return NextResponse.json({ error: 'Failed to fetch visitor' }, { status: 500 });
  }
}

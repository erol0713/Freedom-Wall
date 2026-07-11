import { NextResponse } from 'next/server';
import connectDB from '../../../utils/db';
import Visitor from '../../../models/Visitor';

export const dynamic = 'force-dynamic';

/**
 * POST /api/visitors/heartbeat
 * Updates the visitor's online status and last heartbeat timestamp.
 * Called every 30 seconds by the client.
 */
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { fingerprintId } = body;

    if (!fingerprintId) {
      return NextResponse.json({ error: 'Missing fingerprintId' }, { status: 400 });
    }

    const now = new Date();

    const result = await Visitor.findOneAndUpdate(
      { fingerprintId },
      {
        $set: {
          isOnline: true,
          lastHeartbeat: now,
          lastVisit: now,
        },
      },
      { new: true }
    );

    if (!result) {
      return NextResponse.json({ error: 'Visitor not found' }, { status: 404 });
    }

    // Also mark stale visitors as offline (heartbeat > 60s ago)
    const staleThreshold = new Date(now.getTime() - 60 * 1000);
    await Visitor.updateMany(
      {
        isOnline: true,
        lastHeartbeat: { $lt: staleThreshold },
        fingerprintId: { $ne: fingerprintId },
      },
      { $set: { isOnline: false } }
    );

    return NextResponse.json({ status: 'alive' });
  } catch (error) {
    console.error('Heartbeat error:', error);
    return NextResponse.json({ error: 'Heartbeat failed' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import connectDB from '../../../utils/db';
import Visitor from '../../../models/Visitor';
import { parseUserAgent, detectReferrerSource } from '../../../utils/ua-parser';

export const dynamic = 'force-dynamic';

/**
 * POST /api/visitors/track
 * Receives tracking data from the client-side VisitorTracker.
 * Upserts by fingerprintId — creates on first visit, updates on return.
 */
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      fingerprintId,
      screenRes,
      language,
      timezone,
      referrer,
      currentPath,
      currentTitle,
      fbpCookie,
      fbcCookie,
    } = body;

    if (!fingerprintId) {
      return NextResponse.json({ error: 'Missing fingerprintId' }, { status: 400 });
    }

    // Extract IP from headers
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ipAddress = forwarded ? forwarded.split(',')[0].trim() : realIp || 'unknown';

    // Parse User-Agent
    const ua = request.headers.get('user-agent') || '';
    const { browser, browserVersion, os, device } = parseUserAgent(ua);

    // Detect referrer source
    const referrerSource = detectReferrerSource(referrer);

    // IP Geolocation (free, no key needed)
    let geo = { country: null, countryCode: null, city: null, region: null };
    try {
      if (ipAddress && ipAddress !== 'unknown' && ipAddress !== '127.0.0.1' && ipAddress !== '::1') {
        const geoRes = await fetch(`http://ip-api.com/json/${ipAddress}?fields=status,country,countryCode,regionName,city`, {
          signal: AbortSignal.timeout(3000),
        });
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.status === 'success') {
            geo = {
              country: geoData.country,
              countryCode: geoData.countryCode,
              city: geoData.city,
              region: geoData.regionName,
            };
          }
        }
      }
    } catch {
      // Geo lookup failed — continue without it
    }

    const now = new Date();
    const pageEntry = {
      path: currentPath || '/',
      title: currentTitle || '',
      timestamp: now,
    };

    // Check if visitor already exists
    const existingVisitor = await Visitor.findOne({ fingerprintId });

    if (existingVisitor) {
      // Returning visitor — update
      existingVisitor.lastVisit = now;
      existingVisitor.visitCount += 1;
      existingVisitor.isOnline = true;
      existingVisitor.lastHeartbeat = now;
      existingVisitor.pages.push(pageEntry);

      // Update cookies if provided
      if (fbpCookie) existingVisitor.fbpCookie = fbpCookie;
      if (fbcCookie) existingVisitor.fbcCookie = fbcCookie;

      // Update geo if we got new data
      if (geo.country) {
        existingVisitor.country = geo.country;
        existingVisitor.countryCode = geo.countryCode;
        existingVisitor.city = geo.city;
        existingVisitor.region = geo.region;
      }

      // Update device info
      existingVisitor.ipAddress = ipAddress;
      existingVisitor.userAgent = ua;
      existingVisitor.browser = browser;
      existingVisitor.browserVersion = browserVersion;
      existingVisitor.os = os;
      existingVisitor.device = device;
      if (screenRes) existingVisitor.screenRes = screenRes;
      if (language) existingVisitor.language = language;
      if (timezone) existingVisitor.timezone = timezone;
      if (referrer) existingVisitor.referrer = referrer;
      if (referrerSource !== 'direct') existingVisitor.referrerSource = referrerSource;

      // Create a new session
      existingVisitor.sessions.push({
        startTime: now,
        pages: [pageEntry],
      });

      // Keep sessions manageable (last 50)
      if (existingVisitor.sessions.length > 50) {
        existingVisitor.sessions = existingVisitor.sessions.slice(-50);
      }

      // Keep pages manageable (last 500)
      if (existingVisitor.pages.length > 500) {
        existingVisitor.pages = existingVisitor.pages.slice(-500);
      }

      await existingVisitor.save();

      return NextResponse.json({
        status: 'updated',
        visitorId: existingVisitor._id.toString(),
        visitCount: existingVisitor.visitCount,
      });
    } else {
      // New visitor — create
      const visitor = await Visitor.create({
        fingerprintId,
        fbpCookie: fbpCookie || null,
        fbcCookie: fbcCookie || null,
        ipAddress,
        country: geo.country,
        countryCode: geo.countryCode,
        city: geo.city,
        region: geo.region,
        userAgent: ua,
        browser,
        browserVersion,
        os,
        device,
        screenRes: screenRes || null,
        language: language || null,
        timezone: timezone || null,
        referrer: referrer || null,
        referrerSource,
        firstVisit: now,
        lastVisit: now,
        visitCount: 1,
        pages: [pageEntry],
        sessions: [{
          startTime: now,
          pages: [pageEntry],
        }],
        isOnline: true,
        lastHeartbeat: now,
      });

      return NextResponse.json({
        status: 'created',
        visitorId: visitor._id.toString(),
        visitCount: 1,
      }, { status: 201 });
    }
  } catch (error) {
    console.error('Visitor tracking error:', error);
    return NextResponse.json({ error: 'Tracking failed' }, { status: 500 });
  }
}

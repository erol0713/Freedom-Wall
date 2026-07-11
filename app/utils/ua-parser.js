/**
 * Lightweight User-Agent Parser
 * Extracts browser, OS, and device type from UA strings.
 * No external dependencies — pure regex matching.
 */

export function parseUserAgent(ua) {
  if (!ua) return { browser: 'Unknown', browserVersion: '', os: 'Unknown', device: 'desktop' };

  // --- Browser Detection ---
  let browser = 'Unknown';
  let browserVersion = '';

  const browserPatterns = [
    // Order matters — check specific browsers before generic ones
    { name: 'Samsung Internet', regex: /SamsungBrowser\/(\d+[\.\d]*)/ },
    { name: 'Opera', regex: /(?:OPR|Opera)\/(\d+[\.\d]*)/ },
    { name: 'Edge', regex: /Edg(?:e|A|iOS)?\/(\d+[\.\d]*)/ },
    { name: 'Firefox', regex: /Firefox\/(\d+[\.\d]*)/ },
    { name: 'Chrome', regex: /(?:Chrome|CriOS)\/(\d+[\.\d]*)/ },
    { name: 'Safari', regex: /Version\/(\d+[\.\d]*).*Safari/ },
    { name: 'IE', regex: /(?:MSIE |Trident.*rv:)(\d+[\.\d]*)/ },
  ];

  for (const { name, regex } of browserPatterns) {
    const match = ua.match(regex);
    if (match) {
      browser = name;
      browserVersion = match[1] || '';
      break;
    }
  }

  // --- OS Detection ---
  let os = 'Unknown';

  if (/Windows NT 10/.test(ua)) os = 'Windows 10/11';
  else if (/Windows NT 6\.3/.test(ua)) os = 'Windows 8.1';
  else if (/Windows NT 6\.2/.test(ua)) os = 'Windows 8';
  else if (/Windows NT 6\.1/.test(ua)) os = 'Windows 7';
  else if (/Windows/.test(ua)) os = 'Windows';
  else if (/Mac OS X (\d+[_\.]\d+)/.test(ua)) {
    const ver = ua.match(/Mac OS X (\d+[_\.]\d+)/)[1].replace(/_/g, '.');
    os = `macOS ${ver}`;
  } else if (/Mac OS X/.test(ua)) os = 'macOS';
  else if (/CrOS/.test(ua)) os = 'Chrome OS';
  else if (/Android (\d+[\.\d]*)/.test(ua)) {
    const ver = ua.match(/Android (\d+[\.\d]*)/)[1];
    os = `Android ${ver}`;
  } else if (/Android/.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/.test(ua)) {
    const match = ua.match(/OS (\d+[_\.]\d+)/);
    os = match ? `iOS ${match[1].replace(/_/g, '.')}` : 'iOS';
  } else if (/Linux/.test(ua)) os = 'Linux';

  // --- Device Detection ---
  let device = 'desktop';

  if (/iPad|tablet|PlayBook/i.test(ua) || 
      (/Android/.test(ua) && !/Mobile/.test(ua))) {
    device = 'tablet';
  } else if (/Mobile|iPhone|iPod|Android.*Mobile|BlackBerry|IEMobile|Opera Mini|Opera Mobi/i.test(ua)) {
    device = 'mobile';
  }

  return { browser, browserVersion, os, device };
}

/**
 * Detect referrer source from URL string.
 */
export function detectReferrerSource(referrer) {
  if (!referrer) return 'direct';
  
  const url = referrer.toLowerCase();
  
  if (url.includes('facebook.com') || url.includes('fb.com') || url.includes('fbcdn.net') || url.includes('l.facebook.com')) {
    return 'facebook';
  }
  if (url.includes('google.') || url.includes('googleapis.com')) {
    return 'google';
  }
  if (url.includes('twitter.com') || url.includes('t.co') || url.includes('x.com')) {
    return 'twitter';
  }
  if (url.includes('instagram.com')) {
    return 'instagram';
  }
  if (url.includes('tiktok.com')) {
    return 'tiktok';
  }
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  }
  if (url.includes('reddit.com')) {
    return 'reddit';
  }
  if (url.includes('linkedin.com')) {
    return 'linkedin';
  }

  return 'other';
}

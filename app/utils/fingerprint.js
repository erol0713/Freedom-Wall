/**
 * Browser Fingerprint Generator
 * Creates a unique hash from browser characteristics.
 * Pure JS — no external dependencies.
 */

async function hashString(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function getCanvasFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    
    // Draw text with specific styling
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('FreedomWall,👋', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('FreedomWall,👋', 4, 17);
    
    // Draw shapes
    ctx.beginPath();
    ctx.arc(50, 50, 50, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
    
    return canvas.toDataURL();
  } catch {
    return 'canvas-not-supported';
  }
}

function getWebGLFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return 'webgl-not-supported';
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'unknown';
    const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unknown';
    
    return `${vendor}~${renderer}`;
  } catch {
    return 'webgl-error';
  }
}

function getScreenInfo() {
  return {
    width: screen.width,
    height: screen.height,
    colorDepth: screen.colorDepth,
    pixelRatio: window.devicePixelRatio || 1,
  };
}

function getTimezoneInfo() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return new Date().getTimezoneOffset().toString();
  }
}

/**
 * Generate a unique browser fingerprint.
 * Returns { fingerprintId, screenRes, language, timezone }
 */
export async function generateFingerprint() {
  const components = [];
  
  // Canvas fingerprint
  components.push(getCanvasFingerprint());
  
  // WebGL fingerprint
  components.push(getWebGLFingerprint());
  
  // Screen info
  const screenInfo = getScreenInfo();
  components.push(`${screenInfo.width}x${screenInfo.height}x${screenInfo.colorDepth}x${screenInfo.pixelRatio}`);
  
  // Timezone
  const timezone = getTimezoneInfo();
  components.push(timezone);
  
  // Language
  const language = navigator.language || navigator.userLanguage || 'unknown';
  components.push(language);
  
  // Platform
  components.push(navigator.platform || 'unknown');
  
  // Hardware concurrency
  components.push((navigator.hardwareConcurrency || 'unknown').toString());
  
  // Touch support
  components.push(('ontouchstart' in window).toString());
  
  // Max touch points
  components.push((navigator.maxTouchPoints || 0).toString());
  
  // Color gamut
  const colorGamut = window.matchMedia('(color-gamut: rec2020)').matches ? 'rec2020'
    : window.matchMedia('(color-gamut: p3)').matches ? 'p3'
    : 'srgb';
  components.push(colorGamut);
  
  // HDR support
  components.push(window.matchMedia('(dynamic-range: high)').matches ? 'hdr' : 'sdr');
  
  // Reduced motion preference
  components.push(window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduced' : 'normal');
  
  // Dark mode preference
  components.push(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  const raw = components.join('|||');
  const fingerprintId = await hashString(raw);
  
  return {
    fingerprintId,
    screenRes: `${screenInfo.width}x${screenInfo.height}`,
    language,
    timezone,
  };
}

/**
 * Read first-party cookies by name.
 */
export function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

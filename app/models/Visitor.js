import mongoose from 'mongoose';

const PageVisitSchema = new mongoose.Schema({
  path: { type: String, required: true },
  title: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const SessionSchema = new mongoose.Schema({
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date, default: null },
  pages: { type: [PageVisitSchema], default: [] },
}, { _id: true });

const VisitorSchema = new mongoose.Schema({
  fingerprintId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  // Facebook cookie data (first-party, readable if Meta Pixel is installed)
  fbpCookie: { type: String, default: null },   // _fbp browser ID
  fbcCookie: { type: String, default: null },   // _fbc click ID

  // Network info
  ipAddress: { type: String, default: null },

  // Geolocation (from IP)
  country: { type: String, default: null },
  countryCode: { type: String, default: null },
  city: { type: String, default: null },
  region: { type: String, default: null },

  // Browser / Device
  userAgent: { type: String, default: null },
  browser: { type: String, default: null },
  browserVersion: { type: String, default: null },
  os: { type: String, default: null },
  device: { type: String, enum: ['desktop', 'mobile', 'tablet'], default: 'desktop' },
  screenRes: { type: String, default: null },
  language: { type: String, default: null },
  timezone: { type: String, default: null },

  // Referrer
  referrer: { type: String, default: null },
  referrerSource: {
    type: String,
    enum: ['facebook', 'google', 'twitter', 'instagram', 'tiktok', 'youtube', 'reddit', 'linkedin', 'direct', 'other'],
    default: 'direct',
  },

  // Visit tracking
  firstVisit: { type: Date, default: Date.now },
  lastVisit: { type: Date, default: Date.now },
  visitCount: { type: Number, default: 1 },
  pages: { type: [PageVisitSchema], default: [] },
  sessions: { type: [SessionSchema], default: [] },

  // Online status
  isOnline: { type: Boolean, default: false },
  lastHeartbeat: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

// Indexes for common queries
VisitorSchema.index({ lastVisit: -1 });
VisitorSchema.index({ isOnline: 1 });
VisitorSchema.index({ referrerSource: 1 });
VisitorSchema.index({ country: 1 });
VisitorSchema.index({ device: 1 });
VisitorSchema.index({ firstVisit: -1 });

export default mongoose.models.Visitor || mongoose.model('Visitor', VisitorSchema);

import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Content is required'],
    maxlength: [2000, 'Content cannot exceed 2000 characters'],
    trim: true,
  },
  contentType: {
    type: String,
    enum: ['confession', 'rant', 'thought', 'message'],
    default: 'thought',
  },
  mood: {
    type: String,
    default: '💭',
  },
  isAnonymous: {
    type: Boolean,
    default: true,
  },
  userHandle: {
    type: String,
    default: null,
    trim: true,
    maxlength: [50, 'Handle cannot exceed 50 characters'],
  },
  toAlias: {
    type: String,
    default: null,
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  fromAlias: {
    type: String,
    default: null,
    trim: true,
    maxlength: [100, 'Alias cannot exceed 100 characters'],
  },
  songId: {
    type: String,
    default: null,
  },
  songName: {
    type: String,
    default: null,
  },
  songArtist: {
    type: String,
    default: null,
  },
  songCover: {
    type: String,
    default: null,
  },
  songPreviewUrl: {
    type: String,
    default: null,
  },
  likes: {
    type: Number,
    default: 0,
  },
  likedBy: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

PostSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

PostSchema.index({ createdAt: -1 });
PostSchema.index({ mood: 1, createdAt: -1 });

export default mongoose.models.Post || mongoose.model('Post', PostSchema);

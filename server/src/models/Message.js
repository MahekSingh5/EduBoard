import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    messageType: {
      type: String,
      enum: ['text', 'system'],
      default: 'text',
    },
  },
  { timestamps: true }
);

// Auto-delete old messages after 24 hours (optional)
messageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

export default mongoose.model('Message', messageSchema);

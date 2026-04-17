import mongoose from 'mongoose';

const boardSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
      unique: true,
    },
    strokes: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          auto: true,
        },
        drawnBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        points: [
          {
            x: Number,
            y: Number,
          },
        ],
        color: String,
        brushSize: Number,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    text: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          auto: true,
        },
        content: String,
        x: Number,
        y: Number,
        fontSize: Number,
        color: String,
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    shapes: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          auto: true,
        },
        type: {
          type: String,
          enum: ['rectangle', 'circle', 'line', 'arrow'],
        },
        startX: Number,
        startY: Number,
        endX: Number,
        endY: Number,
        color: String,
        lineWidth: Number,
        drawnBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    backgroundColor: {
      type: String,
      default: '#ffffff',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Board', boardSchema);

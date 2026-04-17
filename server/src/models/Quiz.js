import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['multiple-choice', 'true-false', 'poll'],
      default: 'multiple-choice',
    },
    questions: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          auto: true,
        },
        question: {
          type: String,
          required: true,
        },
        options: [
          {
            _id: {
              type: mongoose.Schema.Types.ObjectId,
              auto: true,
            },
            text: String,
            isCorrect: Boolean,
          },
        ],
        timeLimit: {
          type: Number,
          default: 30, // seconds
        },
      },
    ],
    responses: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        answers: [
          {
            questionId: mongoose.Schema.Types.ObjectId,
            selectedOptionId: mongoose.Schema.Types.ObjectId,
            answeredAt: Date,
          },
        ],
        score: Number,
      },
    ],
    isActive: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Quiz', quizSchema);

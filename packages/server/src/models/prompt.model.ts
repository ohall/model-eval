import mongoose from 'mongoose';
import { Prompt } from '@model-eval/shared';

const promptSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for faster queries based on userId
promptSchema.index({ userId: 1 });

export const PromptModel = mongoose.model<Prompt & mongoose.Document>('Prompt', promptSchema);

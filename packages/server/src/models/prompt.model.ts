import mongoose from 'mongoose';
import { Prompt } from '../../shared/src/index';

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
  },
  {
    timestamps: true,
  }
);

export const PromptModel = mongoose.model<Prompt & mongoose.Document>('Prompt', promptSchema);

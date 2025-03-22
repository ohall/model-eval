import mongoose from 'mongoose';
import { EvaluationResult, Provider } from '@model-eval/shared';

const metricSchema = new mongoose.Schema(
  {
    latencyMs: {
      type: Number,
      required: true,
    },
    promptTokens: {
      type: Number,
      required: true,
    },
    completionTokens: {
      type: Number,
      required: true,
    },
    totalTokens: {
      type: Number,
      required: true,
    },
    costUsd: {
      type: Number,
    },
    modelConfidence: {
      type: Number,
    },
  },
  { _id: false }
);

const evaluationSchema = new mongoose.Schema(
  {
    promptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prompt',
      required: true,
    },
    provider: {
      type: String,
      enum: Object.values(Provider),
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    response: {
      type: String,
      required: true,
    },
    metrics: metricSchema,
  },
  {
    timestamps: true,
  }
);

evaluationSchema.virtual('prompt', {
  ref: 'Prompt',
  localField: 'promptId',
  foreignField: '_id',
  justOne: true,
});

export const EvaluationModel = mongoose.model<EvaluationResult & mongoose.Document>(
  'Evaluation',
  evaluationSchema
);

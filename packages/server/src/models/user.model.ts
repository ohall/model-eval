import mongoose, { Document, Schema } from 'mongoose';
import { User } from 'shared/index';

// Omit 'id' from User to avoid conflict with Document's '_id'
export interface UserDocument extends Omit<User, 'id'>, Document {
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
    },
    picture: {
      type: String,
    },
    providerId: {
      type: String,
    },
    provider: {
      type: String,
      enum: ['google'],
      required: true,
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

export const UserModel = mongoose.model<UserDocument>('User', UserSchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'ANALYST' | 'AUDITOR' | 'MANAGER' | 'READONLY';
  department?: string;
  permissions: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  mfaEnabled: boolean;
  mfaSecret?: string;
  lastLogin?: Date;
  loginHistory: Array<{
    timestamp: Date;
    ip: string;
    device: string;
    status: 'SUCCESS' | 'FAILURE';
  }>;
  createdAt: Date;
  updatedAt: Date;
  avatar?: string;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, unique: true, required: true, lowercase: true, index: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: {
      type: String,
      enum: ['ADMIN', 'ANALYST', 'AUDITOR', 'MANAGER', 'READONLY'],
      default: 'ANALYST',
    },
    department: String,
    permissions: [String],
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
      default: 'ACTIVE',
      index: true,
    },
    mfaEnabled: { type: Boolean, default: false },
    mfaSecret: String,
    lastLogin: Date,
    loginHistory: [
      {
        timestamp: Date,
        ip: String,
        device: String,
        status: String,
      },
    ],
    avatar: String,
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);

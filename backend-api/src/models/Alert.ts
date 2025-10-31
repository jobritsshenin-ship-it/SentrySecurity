import mongoose, { Schema, Document } from 'mongoose';

export interface IAlert extends Document {
  alertId: string;
  transactionId: Schema.Types.ObjectId;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  alertType: string;
  status: 'NEW' | 'IN_REVIEW' | 'RESOLVED' | 'FALSE_POSITIVE';
  riskScore: number;
  riskExplanation: string;
  riskFactors: Array<{
    factor: string;
    confidence: number;
    details: string;
  }>;
  assignedTo?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  resolution?: string;
  notes: Array<{
    analystId: Schema.Types.ObjectId;
    content: string;
    createdAt: Date;
  }>;
  actionHistory: Array<{
    action: string;
    actor: Schema.Types.ObjectId;
    timestamp: Date;
    details: string;
  }>;
  caseId?: Schema.Types.ObjectId;
}

const alertSchema = new Schema<IAlert>(
  {
    alertId: { type: String, unique: true, required: true, index: true },
    transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction', required: true, index: true },
    severity: {
      type: String,
      enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
      required: true,
      index: true,
    },
    alertType: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['NEW', 'IN_REVIEW', 'RESOLVED', 'FALSE_POSITIVE'],
      default: 'NEW',
      index: true,
    },
    riskScore: { type: Number, min: 0, max: 1, required: true },
    riskExplanation: String,
    riskFactors: [
      {
        factor: String,
        confidence: Number,
        details: String,
      },
    ],
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    resolution: String,
    notes: [
      {
        analystId: { type: Schema.Types.ObjectId, ref: 'User' },
        content: String,
        createdAt: Date,
      },
    ],
    actionHistory: [
      {
        action: String,
        actor: { type: Schema.Types.ObjectId, ref: 'User' },
        timestamp: Date,
        details: String,
      },
    ],
    caseId: { type: Schema.Types.ObjectId, ref: 'Case' },
  },
  { timestamps: true }
);

export const Alert = mongoose.model<IAlert>('Alert', alertSchema);

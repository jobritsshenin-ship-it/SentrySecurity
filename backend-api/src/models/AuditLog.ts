import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  timestamp: Date;
  userId: Schema.Types.ObjectId;
  action: string;
  resource: string;
  resourceId?: Schema.Types.ObjectId;
  details: string;
  ip: string;
  status: 'SUCCESS' | 'FAILURE';
  errorMessage?: string;
  retentionExpiry: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    timestamp: { type: Date, default: Date.now, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, required: true, index: true },
    resource: { type: String, required: true, index: true },
    resourceId: { type: Schema.Types.ObjectId },
    details: String,
    ip: String,
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILURE'],
      required: true,
    },
    errorMessage: String,
    retentionExpiry: {
      type: Date,
      index: { expireAfterSeconds: 0 },
    },
  },
  { timestamps: false }
);

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);

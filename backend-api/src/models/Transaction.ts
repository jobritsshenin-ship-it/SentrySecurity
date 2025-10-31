import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  transactionId: string;
  customerId: string;
  amount: number;
  currency: string;
  merchantId: string;
  merchantName: string;
  merchantCategory: string;
  timestamp: Date;
  status: 'COMPLETED' | 'FLAGGED' | 'BLOCKED';
  riskScore: number;
  riskFactors: string[];
  riskExplanation?: string;
  geolocation?: {
    country: string;
    city: string;
    ip: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  deviceInfo?: {
    deviceId: string;
    deviceType: string;
    osType: string;
    browserType: string;
  };
  cardInfo?: {
    cardId: string;
    cardType: string;
    maskedCard: string;
    issuedCountry: string;
  };
  createdAt: Date;
  flags: Array<{
    flaggedBy: Schema.Types.ObjectId;
    reason: string;
    flaggedAt: Date;
  }>;
  notes: Array<{
    analystId: Schema.Types.ObjectId;
    content: string;
    createdAt: Date;
  }>;
  assignedTo?: Schema.Types.ObjectId;
}

const transactionSchema = new Schema<ITransaction>(
  {
    transactionId: { type: String, unique: true, required: true, index: true },
    customerId: { type: String, required: true, index: true },
    amount: { type: Number, required: true, index: true },
    currency: { type: String, default: 'USD' },
    merchantId: { type: String, required: true, index: true },
    merchantName: { type: String, required: true },
    merchantCategory: String,
    timestamp: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ['COMPLETED', 'FLAGGED', 'BLOCKED'],
      default: 'COMPLETED',
      index: true,
    },
    riskScore: { type: Number, min: 0, max: 1, index: true },
    riskFactors: [String],
    riskExplanation: String,
    geolocation: {
      country: String,
      city: String,
      ip: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    deviceInfo: {
      deviceId: String,
      deviceType: String,
      osType: String,
      browserType: String,
    },
    cardInfo: {
      cardId: String,
      cardType: String,
      maskedCard: String,
      issuedCountry: String,
    },
    flags: [
      {
        flaggedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        reason: String,
        flaggedAt: Date,
      },
    ],
    notes: [
      {
        analystId: { type: Schema.Types.ObjectId, ref: 'User' },
        content: String,
        createdAt: Date,
      },
    ],
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);

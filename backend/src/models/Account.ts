import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IAccount extends Document {
  userId: mongoose.Types.ObjectId;
  accountNumber: string;
  accountType: 'checking' | 'savings' | 'credit';
  balance: number;
  currency: string;
  status: 'active' | 'inactive' | 'frozen';
  overdraftLimit?: number;
  interestRate?: number;
  createdAt: Date;
  updatedAt: Date;
}

const AccountSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  accountNumber: {
    type: String,
    unique: true,
    required: true,
    default: () => `ACC${Date.now()}${Math.floor(Math.random() * 1000)}`
  },
  accountType: {
    type: String,
    enum: ['checking', 'savings', 'credit'],
    required: true
  },
  balance: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'frozen'],
    default: 'active'
  },
  overdraftLimit: {
    type: Number,
    default: 0
  },
  interestRate: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

AccountSchema.index({ userId: 1 });
AccountSchema.index({ accountNumber: 1 });

export default mongoose.model<IAccount>('Account', AccountSchema);
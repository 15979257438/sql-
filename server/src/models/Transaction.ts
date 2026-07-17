import mongoose, { Schema, Document } from 'mongoose';

export type TransactionType = 'recharge' | 'pay' | 'refund' | 'withdraw';

export interface ITransaction extends Document {
  userId: string;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  orderId?: string;
  description?: string;
  createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>({
  userId: { type: String, required: true, index: true },
  type: { type: String, required: true },
  amount: { type: Number, required: true },
  balanceAfter: { type: Number, required: true },
  orderId: { type: String },
  description: { type: String },
}, { timestamps: true });

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);

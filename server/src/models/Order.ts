import mongoose, { Schema, Document } from 'mongoose';

export type OrderStatus = 'pending' | 'accepted' | 'shipped' | 'received' | 'completed' | 'cancelled';

export interface IOrder extends Document {
  productId: string;
  buyerId: string;
  sellerId: string;
  status: OrderStatus;
  price: number;
  message?: string;
  cancelReason?: string;
  cancelledBy?: string;
  paidAt?: Date;
  payMethod?: 'balance' | 'wechat';
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>({
  productId: { type: String, required: true },
  buyerId: { type: String, required: true },
  sellerId: { type: String, required: true },
  status: { type: String, default: 'pending', index: true },
  price: { type: Number, required: true },
  message: { type: String },
  cancelReason: { type: String },
  cancelledBy: { type: String },
  paidAt: { type: Date },
  payMethod: { type: String },
}, { timestamps: true });

export default mongoose.model<IOrder>('Order', OrderSchema);

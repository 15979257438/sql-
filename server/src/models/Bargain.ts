import mongoose, { Schema, Document } from 'mongoose';

export type BargainStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

export interface IBargain extends Document {
  productId: string;
  buyerId: string;
  sellerId: string;
  originalPrice: number;
  currentPrice: number;
  targetPrice: number;
  status: BargainStatus;
  offers: Array<{
    userId: string;
    price: number;
    message?: string;
    createdAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const BargainSchema = new Schema<IBargain>({
  productId: { type: String, required: true },
  buyerId: { type: String, required: true },
  sellerId: { type: String, required: true },
  originalPrice: { type: Number, required: true },
  currentPrice: { type: Number, required: true },
  targetPrice: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  offers: [{
    userId: { type: String, required: true },
    price: { type: Number, required: true },
    message: { type: String },
    createdAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

export default mongoose.model<IBargain>('Bargain', BargainSchema);

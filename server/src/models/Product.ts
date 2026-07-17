import mongoose, { Schema, Document } from 'mongoose';

export type Category = 'textbook' | 'digital' | 'clothing' | 'beauty' | 'home' | 'sports' | 'other';
export type Condition = 'new' | 'like_new' | 'used';
export type TradeMethod = 'pickup' | 'delivery' | 'both';
export type ProductStatus = 'published' | 'sold' | 'offline';

export interface IProduct extends Document {
  sellerId: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: Category;
  condition: Condition;
  images: string[];
  tradeMethod: TradeMethod;
  location?: string;
  status: ProductStatus;
  views: number;
  favorites: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  sellerId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  category: { type: String, required: true, index: true },
  condition: { type: String, required: true },
  images: [{ type: String }],
  tradeMethod: { type: String, required: true },
  location: { type: String },
  status: { type: String, default: 'published', index: true },
  views: { type: Number, default: 0 },
  favorites: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model<IProduct>('Product', ProductSchema);

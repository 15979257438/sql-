import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  productId: string;
  buyerId: string;
  sellerId: string;
  lastMessage?: string;
  lastMessageAt?: Date;
  unreadBuyer: number;
  unreadSeller: number;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>({
  productId: { type: String, required: true },
  buyerId: { type: String, required: true },
  sellerId: { type: String, required: true },
  lastMessage: { type: String },
  lastMessageAt: { type: Date },
  unreadBuyer: { type: Number, default: 0 },
  unreadSeller: { type: Number, default: 0 },
}, { timestamps: true });

// 同一个商品、同一对买家卖家只能有一个会话
ConversationSchema.index({ productId: 1, buyerId: 1, sellerId: 1 }, { unique: true });

export default mongoose.model<IConversation>('Conversation', ConversationSchema);

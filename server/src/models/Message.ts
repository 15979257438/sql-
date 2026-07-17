import mongoose, { Schema, Document } from 'mongoose';

export type MessageType = 'text' | 'image' | 'bargain' | 'system';

export interface IMessage extends Document {
  conversationId: string;
  senderId: string;
  type: MessageType;
  content: string;
  imageUrl?: string;
  bargainId?: string;
  read: boolean;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  conversationId: { type: String, required: true, index: true },
  senderId: { type: String, required: true },
  type: { type: String, default: 'text' },
  content: { type: String, required: true },
  imageUrl: { type: String },
  bargainId: { type: String },
  read: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<IMessage>('Message', MessageSchema);

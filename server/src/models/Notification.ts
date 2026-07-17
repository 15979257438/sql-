import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: string;
  title: string;
  content: string;
  type: string;
  read: boolean;
  relatedId?: string;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, default: 'system' },
  read: { type: Boolean, default: false },
  relatedId: { type: String },
}, { timestamps: true });

export default mongoose.model<INotification>('Notification', NotificationSchema);

import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { Conversation, Message } from '../models';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export function setupSocket(io: SocketIOServer) {
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token as string;
    if (!token) return next(new Error('未登录'));
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      socket.userId = decoded.userId;
      next();
    } catch {
      next(new Error('登录已过期'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId;
    if (!userId) return socket.disconnect();

    socket.join(`user_${userId}`);

    socket.on('join_conversation', (conversationId: string) => {
      socket.join(`conv_${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(`conv_${conversationId}`);
    });

    socket.on('send_message', async (data: { conversationId: string; type?: string; content: string; imageUrl?: string }) => {
      try {
        const conversation = await Conversation.findOne({
          _id: data.conversationId,
          $or: [{ buyerId: userId }, { sellerId: userId }],
        });
        if (!conversation) return;

        const message = await Message.create({
          conversationId: conversation._id,
          senderId: new mongoose.Types.ObjectId(userId),
          type: data.type || 'text',
          content: data.content,
          imageUrl: data.imageUrl,
        });

        conversation.lastMessage = data.type === 'image' ? '[图片]' : data.content;
        conversation.lastMessageAt = new Date();
        const isBuyer = conversation.buyerId.toString() === userId;
        if (isBuyer) conversation.unreadSeller += 1;
        else conversation.unreadBuyer += 1;
        await conversation.save();

        await message.populate('senderId', 'nickname avatar');

        // 推送给当前会话所有在线成员
        io.to(`conv_${conversation._id}`).emit('message', { conversationId: conversation._id, message });

        // 推送给对方用户的私有房间
        const targetId = isBuyer ? conversation.sellerId.toString() : conversation.buyerId.toString();
        io.to(`user_${targetId}`).emit('conversation_updated', conversation);
      } catch (err) {
        console.error('Socket send_message error:', err);
      }
    });

    socket.on('mark_read', async (conversationId: string) => {
      try {
        const conversation = await Conversation.findOne({
          _id: conversationId,
          $or: [{ buyerId: userId }, { sellerId: userId }],
        });
        if (!conversation) return;

        const isBuyer = conversation.buyerId.toString() === userId;
        if (isBuyer) conversation.unreadBuyer = 0;
        else conversation.unreadSeller = 0;
        await conversation.save();

        await Message.updateMany(
          { conversationId: conversation._id, senderId: { $ne: userId }, read: false },
          { read: true }
        );

        io.to(`user_${userId}`).emit('conversation_updated', conversation);
      } catch (err) {
        console.error('Socket mark_read error:', err);
      }
    });

    socket.on('disconnect', () => {
      socket.leave(`user_${userId}`);
    });
  });
}

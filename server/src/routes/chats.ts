import { Router } from 'express';
import mongoose from 'mongoose';
import { Conversation, Message, Product, User } from '../models';
import { success, fail } from '../utils/response';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// 获取我的会话列表
router.get('/conversations', authMiddleware, async (req: AuthRequest, res) => {
  const conversations = await Conversation.find({
    $or: [{ buyerId: req.userId }, { sellerId: req.userId }],
  })
    .sort({ lastMessageAt: -1 })
    .populate('productId', 'title price images status')
    .populate('buyerId', 'nickname avatar')
    .populate('sellerId', 'nickname avatar');
  success(res, conversations);
});

// 获取或创建会话
router.post('/conversations', authMiddleware, async (req: AuthRequest, res) => {
  const { productId } = req.body;
  const product = await Product.findById(productId);
  if (!product) return fail(res, '商品不存在');

  const sellerId = product.sellerId.toString();
  const buyerId = req.userId as string;
  if (sellerId === buyerId) return fail(res, '不能和自己聊天');

  let conversation = await Conversation.findOne({ productId, buyerId, sellerId });
  if (!conversation) {
    conversation = await Conversation.create({ productId, buyerId, sellerId });
  }
  await conversation.populate('productId', 'title price images status');
  await conversation.populate('buyerId', 'nickname avatar');
  await conversation.populate('sellerId', 'nickname avatar');
  success(res, conversation);
});

// 获取会话消息
router.get('/conversations/:id/messages', authMiddleware, async (req: AuthRequest, res) => {
  const conversation = await Conversation.findOne({
    _id: req.params.id,
    $or: [{ buyerId: req.userId }, { sellerId: req.userId }],
  });
  if (!conversation) return fail(res, '会话不存在', 404, 404);

  const messages = await Message.find({ conversationId: conversation._id })
    .sort({ createdAt: 1 })
    .populate('senderId', 'nickname avatar');
  success(res, messages);
});

// 发送消息（HTTP fallback，实时消息走 Socket.IO）
router.post('/conversations/:id/messages', authMiddleware, async (req: AuthRequest, res) => {
  const { type = 'text', content, imageUrl } = req.body;
  const conversation = await Conversation.findOne({
    _id: req.params.id,
    $or: [{ buyerId: req.userId }, { sellerId: req.userId }],
  });
  if (!conversation) return fail(res, '会话不存在', 404, 404);

  const message = await Message.create({
    conversationId: conversation._id,
    senderId: req.userId,
    type,
    content,
    imageUrl,
  });

  conversation.lastMessage = type === 'image' ? '[图片]' : content;
  conversation.lastMessageAt = new Date();
  const isBuyer = conversation.buyerId.toString() === req.userId;
  if (isBuyer) conversation.unreadSeller += 1;
  else conversation.unreadBuyer += 1;
  await conversation.save();

  await message.populate('senderId', 'nickname avatar');

  // 通过 Socket.IO 推送给在线用户
  const io = req.app.get('io');
  if (io) {
    const targetId = isBuyer ? conversation.sellerId.toString() : conversation.buyerId.toString();
    io.to(`user_${targetId}`).emit('message', { conversationId: conversation._id, message });
    io.to(`user_${targetId}`).emit('conversation_updated', conversation);
  }

  success(res, message);
});

// 标记已读
router.post('/conversations/:id/read', authMiddleware, async (req: AuthRequest, res) => {
  const conversation = await Conversation.findOne({
    _id: req.params.id,
    $or: [{ buyerId: req.userId }, { sellerId: req.userId }],
  });
  if (!conversation) return fail(res, '会话不存在', 404, 404);

  const isBuyer = conversation.buyerId.toString() === req.userId;
  if (isBuyer) conversation.unreadBuyer = 0;
  else conversation.unreadSeller = 0;
  await conversation.save();

  await Message.updateMany(
    { conversationId: conversation._id, senderId: { $ne: req.userId }, read: false },
    { read: true }
  );

  success(res, null);
});

export default router;

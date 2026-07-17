import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import productRoutes from './products';
import orderRoutes from './orders';
import walletRoutes from './wallet';
import chatRoutes from './chats';
import bargainRoutes from './bargains';
import notificationRoutes from './notifications';
import uploadRoutes from './upload';
import payRoutes from './pay';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/wallet', walletRoutes);
router.use('/chats', chatRoutes);
router.use('/bargains', bargainRoutes);
router.use('/notifications', notificationRoutes);
router.use('/upload', uploadRoutes);
router.use('/pay', payRoutes);

export default router;

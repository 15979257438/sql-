import { storage, delay } from './storage';
import { generateId } from '@/utils/id';
import type { Review } from '@/types';

export const reviewService = {
  async create(data: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
    await delay(200);
    const reviews = storage.get<Review[]>('reviews') || [];
    const now = new Date().toISOString();
    const review: Review = {
      ...data,
      id: generateId(),
      createdAt: now,
    };
    reviews.unshift(review);
    storage.set('reviews', reviews);

    // Recalculate seller rating
    this.recalculateRating(data.targetId);

    return review;
  },

  async getByTarget(targetId: string): Promise<Review[]> {
    await delay(100);
    const reviews = storage.get<Review[]>('reviews') || [];
    return reviews
      .filter(r => r.targetId === targetId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getByProduct(productId: string): Promise<Review[]> {
    await delay(100);
    const reviews = storage.get<Review[]>('reviews') || [];
    return reviews
      .filter(r => r.productId === productId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async hasReviewed(orderId: string, reviewerId: string): Promise<boolean> {
    await delay(50);
    const reviews = storage.get<Review[]>('reviews') || [];
    return reviews.some(r => r.orderId === orderId && r.reviewerId === reviewerId);
  },

  recalculateRating(targetId: string): void {
    const reviews = storage.get<Review[]>('reviews') || [];
    const targetReviews = reviews.filter(r => r.targetId === targetId);
    if (targetReviews.length === 0) return;

    const avg = targetReviews.reduce((sum, r) => sum + r.rating, 0) / targetReviews.length;

    const users = storage.get<any[]>('users') || [];
    const idx = users.findIndex(u => u.id === targetId);
    if (idx >= 0) {
      users[idx] = { ...users[idx], rating: Number(avg.toFixed(1)) };
      storage.set('users', users);
    }
  },
};

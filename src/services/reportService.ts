import { storage, delay } from './storage';
import { generateId } from '@/utils/id';
import type { Report, TargetType } from '@/types';

export interface CreateReportData {
  reporterId: string;
  targetType: TargetType;
  targetId: string;
  reason: string;
  description?: string;
}

export const reportService = {
  async create(data: CreateReportData): Promise<Report> {
    await delay(200);
    const reports = storage.get<Report[]>('reports') || [];
    const now = new Date().toISOString();
    const report: Report = {
      ...data,
      id: generateId(),
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };
    reports.unshift(report);
    storage.set('reports', reports);
    return report;
  },

  async listByReporter(reporterId: string): Promise<Report[]> {
    await delay(150);
    const reports = storage.get<Report[]>('reports') || [];
    return reports
      .filter(r => r.reporterId === reporterId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getById(id: string): Promise<Report | null> {
    await delay(150);
    const reports = storage.get<Report[]>('reports') || [];
    return reports.find(r => r.id === id) || null;
  },
};

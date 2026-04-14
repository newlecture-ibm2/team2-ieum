import type { DashboardData } from '@/types/admin-dashboard';
import adminApi from '@/lib/adminApi';

/**
 * 대시보드 통합 데이터 조회
 * GET /api/admin/dashboard → DashboardData
 */
export async function fetchDashboardData(): Promise<DashboardData> {
  const { data } = await adminApi.get<{ data: DashboardData }>('/dashboard');
  return data.data;
}

/**
 * 대시보드 차트 추이만 비동기 조회
 * GET /api/admin/dashboard/trend?startDate=...&endDate=...
 */
export async function fetchDashboardTrend(startDate?: string, endDate?: string): Promise<DashboardData['trend']> {
  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const { data } = await adminApi.get<{ data: DashboardData['trend'] }>('/dashboard/trend', { params });
  return data.data;
}

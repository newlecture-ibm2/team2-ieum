/* ── 대시보드 데이터 타입 ── */

/** KPI = Action: 지금 처리해야 할 것 */
export interface DashboardKpiData {
  ongoingPublicFestivals: number;
  ongoingCustomFestivals: number;
  pendingReports: number;
  pendingInquiries: number;
}

export interface DashboardTrendItem {
  date: string;
  reports: number;
  inquiries: number;
}

export interface DashboardRecentItem {
  id: number;
  type: 'REPORT' | 'INQUIRY';
  title: string;
  status: string;
  createdAt: string;
}

/** Operation = Result: 처리 결과 요약 */
export interface DashboardOperationSummary {
  resolvedReports: number;
  answeredInquiries: number;
  endedFestivals: number;
  hiddenFestivals: number;
  lastUpdated: string;
}

export interface DashboardData {
  kpi: DashboardKpiData;
  trend: DashboardTrendItem[];
  recentReports: DashboardRecentItem[];
  recentInquiries: DashboardRecentItem[];
  operation: DashboardOperationSummary;
}

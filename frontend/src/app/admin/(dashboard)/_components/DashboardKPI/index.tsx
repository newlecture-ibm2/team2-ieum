import Link from 'next/link';
import type { DashboardKpiData } from '@/types/admin-dashboard';
import s from '../DashboardPage/DashboardPage.module.css';
import { REPORT_STATUS } from '@/constants/statusLabels';

interface Props {
  kpi: DashboardKpiData;
}

const KPI_ITEMS = [
  {
    key: 'ongoingPublicFestivals',
    label: '진행중 공공축제',
    icon: '🌐',
    sub: '현재 진행 중',
    color: 'kpiCardBlue',
    href: '/admin/festivals',
  },
  {
    key: 'ongoingCustomFestivals',
    label: '진행중 등록축제',
    icon: '🎪',
    sub: '직접 등록 축제',
    color: 'kpiCardGray',
    href: '/admin/managedFestivals',
  },
  {
    key: 'pendingReports',
    label: '대기중 신고',
    icon: '🚨',
    sub: '즉시 처리 필요',
    color: 'kpiCardRed',
    href: `/admin/reports?status=${REPORT_STATUS.PENDING}`,
  },
  {
    key: 'pendingInquiries',
    label: '답변 대기 문의',
    icon: '💬',
    sub: '미답변 문의',
    color: 'kpiCardAmber',
    href: `/admin/inquiries?status=${REPORT_STATUS.PENDING}`,
  },
] as const;

export default function DashboardKPI({ kpi }: Props) {
  return (
    <div className={s.kpiGrid}>
      {KPI_ITEMS.map((item) => {
        const value = kpi[item.key];
        const isUrgent = (item.key === 'pendingReports' || item.key === 'pendingInquiries') && value > 0;

        return (
          <Link
            key={item.key}
            href={item.href}
            className={`${s.kpiCard} ${s[item.color]} ${isUrgent ? s.kpiUrgent : ''}`}
          >
            <div className={s.kpiCardHeader}>
              <span className={s.kpiLabel}>{item.label}</span>
              <span className={s.kpiIcon}>{item.icon}</span>
            </div>
            <div className={s.kpiValue}>
              {value}
              {isUrgent && <span className={s.kpiUrgentDot} />}
            </div>
            <div className={s.kpiSub}>{item.sub}</div>
          </Link>
        );
      })}
    </div>
  );
}

import type { DashboardOperationSummary } from '@/types/admin-dashboard';
import s from '../DashboardPage/DashboardPage.module.css';

interface Props {
  operation: DashboardOperationSummary;
}

const OP_ITEMS = [
  { key: 'resolvedReports',   icon: '✅', label: '처리 완료 신고' },
  { key: 'answeredInquiries', icon: '✉️', label: '답변 완료 문의' },
  { key: 'endedFestivals',    icon: '⏹️', label: '종료된 축제' },
  { key: 'hiddenFestivals',   icon: '🙈', label: '숨김 축제' },
] as const;

export default function DashboardOpSummary({ operation }: Props) {
  return (
    <div className={s.chartCard} style={{ marginBottom: 0 }}>
      <div className={s.chartTitle}>처리 결과 요약</div>
      <div className={s.chartSubtitle}>누적 처리 현황</div>
      <div className={s.opSummary}>
        {OP_ITEMS.map((item) => (
          <div key={item.key} className={s.opItem}>
            <div className={s.opIcon}>{item.icon}</div>
            <div>
              <div className={s.opLabel}>{item.label}</div>
              <div className={s.opValue}>{operation[item.key]}건</div>
            </div>
          </div>
        ))}
      </div>
      <div className={s.opTimestamp}>마지막 갱신: {operation.lastUpdated}</div>
    </div>
  );
}

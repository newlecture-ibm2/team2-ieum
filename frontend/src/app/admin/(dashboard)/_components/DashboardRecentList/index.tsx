import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { DashboardRecentItem } from '@/types/admin-dashboard';
import common from '@/app/admin/_styles/admin-common.module.css';
import s from '../DashboardPage/DashboardPage.module.css';

const TYPE_LABEL: Record<string, string> = {
  REPORT:  '신고',
  INQUIRY: '문의',
};

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  PENDING:  { label: '대기중',   className: 'badgePending' },
  RESOLVED: { label: '처리완료', className: 'badgeOngoing' },
  ANSWERED: { label: '답변완료', className: 'badgeOngoing' },
};

interface Props {
  type: 'REPORT' | 'INQUIRY';
  title: string;
  items: DashboardRecentItem[];
}

export default function DashboardRecentList({ type, title, items }: Props) {
  const isReport = type === 'REPORT';
  const targetUrl = isReport ? '/admin/reports' : '/admin/inquiries';

  return (
    <div className={s.chartCard} style={{ marginBottom: 0 }}>
      {/* ── 헤더 타이틀 및 전체보기 바로가기 ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div className={s.chartTitle} style={{ marginBottom: 0 }}>{title}</div>
        <Link 
          href={targetUrl} 
          style={{ 
            display: 'flex', alignItems: 'center', fontSize: '12px', 
            color: '#64748b', textDecoration: 'none', fontWeight: 500
          }}
        >
          더보기 <ChevronRight size={14} style={{ marginLeft: '2px', opacity: 0.7 }} />
        </Link>
      </div>
      
      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: '14px' }}>
          최근 내역이 없습니다.
        </div>
      ) : (
        <table className={s.miniTable}>
          <thead>
            <tr>
              {/* 신고일 경우 컬럼 다름 */}
              {isReport && <th>유형</th>}
              <th>{isReport ? '내용' : '제목 또는 내용'}</th>
              <th style={{ textAlign: 'center' }}>상태</th>
              <th style={{ textAlign: 'center' }}>날짜</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const badge = STATUS_LABEL[item.status] || STATUS_LABEL.PENDING;
              
              // 완료 상태는 너무 튀지 않게 투명도 조절 (UX 가이드)
              const isResolved = item.status === 'RESOLVED' || item.status === 'ANSWERED';
              
              return (
                <tr key={`${item.type}-${item.id}`}>
                  {isReport && (
                    <td style={{ fontWeight: 600, whiteSpace: 'nowrap', opacity: isResolved ? 0.7 : 1 }}>
                      {TYPE_LABEL[item.type] || item.type}
                    </td>
                  )}
                  <td style={{
                    maxWidth: isReport ? 120 : 180,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    opacity: isResolved ? 0.7 : 1
                  }}>
                    {item.title}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span 
                      className={`${common.statusBadge} ${common[badge.className] || ''}`}
                      style={{ opacity: isResolved ? 0.8 : 1 }}
                    >
                      {badge.label}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8' }}>
                    {item.createdAt}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import Pagination from '@/_component/common/Pagination';
import { useToast } from '@/_component/common/Toast';
import { useMyPageActivity } from '../_hooks/useMyPageActivity';
import type { MyReport } from '@/types/mypage';
import styles from '../mypage.module.css';

// 🛡️ 매핑 및 라우팅 설정 (컴포넌트 외부로 분리하여 유지보수성 향상)
const ROUTES = {
  COMMUNITY: '/community',
  FESTIVAL: '/festivals',
};

const TARGET_MAP: Record<string, string> = {
  'REVIEW': '축제 리뷰',
  'POST': '커뮤니티 게시글',
  'COMMENT': '댓글',
};

const REASON_MAP: Record<string, string> = {
  'SPAM': '스팸/홍보',
  'ABUSE': '욕설/비하',
  'INAPPROPRIATE': '부적절한 내용',
  'FALSE_INFO': '잘못된 정보',
  'OTHER': '기타',
  'AD': '광고성 컨텐츠'
};

export default function ReportList() {
  const router = useRouter();
  const { toast } = useToast();
  
  const { 
    items: reports, 
    currentPage, 
    totalPages, 
    totalElements, 
    isLoading 
  } = useMyPageActivity('reports');

  const [expandedId, setExpandedId] = useState<number | string | null>(null);

  /**
   * 🛡️ 안전하게 표시용 제목을 생성하는 함수 (파싱 로직 개선)
   */
  const getDisplayTitle = (report: MyReport) => {
    // 1. 백엔드에서 전용 필드가 있다면 우선적으로 사용
    const targetLabel = TARGET_MAP[report.targetType || ''] || '';
    const reasonLabel = REASON_MAP[report.reason || ''] || '';
    
    if (targetLabel && reasonLabel) return `${targetLabel} - ${reasonLabel}`;
    if (report.title) return report.title;
    
    return '신고 내역';
  };

  /**
   * 🔗 원문으로 이동하는 로직 (이벤트 핸들러 추출)
   */
  const handleNavigateToOrigin = (e: React.MouseEvent, report: MyReport) => {
    e.stopPropagation(); 
    
    // 이미 삭제된 게시물인 경우
    if (report.action === 'DELETE') {
      toast('이미 삭제된 게시물은 원문을 확인할 수 없습니다.', 'error');
      return;
    }

    const targetType = report.targetType;
    const targetId = report.targetParentId || report.targetId;

    if (!targetId) {
      toast('원문 정보를 찾을 수 없습니다.', 'error');
      return;
    }

    switch(targetType) {
      case 'REVIEW':
        router.push(`${ROUTES.FESTIVAL}/${targetId}`);
        break;
      case 'POST':
      case 'COMMENT':
        router.push(`${ROUTES.COMMUNITY}/${targetId}`);
        break;
      default:
        toast('원문을 확인할 수 없는 유형입니다.', 'error');
    }
  };

  const toggleExpand = (id: number | string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getStatusStyle = (status: MyReport['status']) => {
    switch (status) {
      case 'PENDING': return styles.statusPending;
      case 'RESOLVED': return styles.statusResolved;
      case 'REJECTED': return styles.statusRejected;
      default: return '';
    }
  };

  const getStatusLabel = (status: MyReport['status']) => {
    switch (status) {
      case 'PENDING': return '접수 대기';
      case 'RESOLVED': return '처리 완료';
      case 'REJECTED': return '반려';
      default: return status;
    }
  };

  if (isLoading) return <div className={styles.loading}>불러오는 중...</div>;

  return (
    <div className={styles.listContainer}>
      <div className={styles.listHeader} style={{ marginBottom: '16px', fontSize: '0.9rem', color: '#64748b' }}>
        총 <strong>{totalElements}</strong>개의 신고 내역이 있습니다.
      </div>
      {reports.length === 0 ? (
        <div className={styles.emptyState}>
          <ShieldAlert size={48} />
          <p>접수된 신고 내역이 없습니다.</p>
        </div>
      ) : (
        reports.map((item) => {
          const report = item as MyReport;
          const isExpanded = expandedId === report.id;

          return (
            <div 
              key={report.id} 
              className={`${styles.dataCard} ${isExpanded ? styles.cardActive : ''}`}
              onClick={() => toggleExpand(report.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className={styles.cardHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`${styles.statusBadge} ${getStatusStyle(report.status)}`}>
                    {getStatusLabel(report.status)}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>#{report.id}</span>
                </div>
                <span className={styles.cardDate}>{report.createdAt}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h4 className={styles.cardTitle}>{getDisplayTitle(report)}</h4>
                <button 
                  className={styles.btnOrigin} 
                  onClick={(e) => handleNavigateToOrigin(e, report)}
                >
                  <ExternalLink size={12} style={{ marginRight: 4 }} /> 원문 보기
                </button>
              </div>
  
              <div className={styles.reportDetailBox}>
                {/* 1. 신고 대상 원문 (가장 중요) */}
                <div className={styles.detailSection}>
                  <div className={styles.detailLabel}>[신고 대상 원문]</div>
                  <div className={styles.detailContent}>
                    {report.targetContent || '원문 내용을 불러올 수 없습니다.'}
                  </div>
                </div>

                {/* 2. 신고자 상세 사유 (작성한 경우만) */}
                {report.content && (
                  <div className={styles.detailSection} style={{ marginTop: '12px', borderTop: '1px dashed #e2e8f0', paddingTop: '12px' }}>
                    <div className={styles.detailLabel}>[신고 상세 사유]</div>
                    <div className={styles.detailContent} style={{ color: '#64748b', fontSize: '0.85rem' }}>
                      {report.content}
                    </div>
                  </div>
                )}
              </div>
  
              {isExpanded && report.adminNote && (
                <div className={styles.adminResponse}>
                  <strong>관리자 답변:</strong>
                  {report.adminNote}
                </div>
              )}
  
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px', color: '#cbd5e1' }}>
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>
          );
        })
      )}

      <div style={{ marginTop: '24px' }}>
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </div>
    </div>
  );
}

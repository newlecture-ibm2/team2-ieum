"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import Pagination from '@/_component/common/Pagination';
import { useToast } from '@/_component/common/Toast';
import { useMyPageActivity } from '../_hooks/useMyPageActivity';
import type { MyReport } from '@/types/mypage';
import styles from '../mypage.module.css';

export default function ReportList() {
  const router = useRouter();
  const { toast } = useToast();
  
  // 🚀 공통 훅 사용
  const { 
    items: reports, 
    currentPage, 
    totalPages, 
    totalElements, 
    isLoading 
  } = useMyPageActivity('reports');

  const [expandedId, setExpandedId] = useState<number | string | null>(null);

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
          return (
            <div 
              key={report.id} 
              className={`${styles.dataCard} ${expandedId === report.id ? styles.cardActive : ''}`}
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
              
              <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h4 className={styles.cardTitle}>{report.title}</h4>
                <button 
                  className={styles.btnAction} 
                  style={{ fontSize: '0.7rem', border: '1px solid var(--color-primary-200)', color: 'var(--color-primary-600)', background: '#f5f3ff' }}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    // 백엔드에서 전송된 title(ex: "REVIEW - 부적절한...")에서 타입을 추출하여 경로 결정
                    const isReview = report.title?.startsWith('REVIEW');
                    const isPostOrComment = report.title?.startsWith('POST') || report.title?.startsWith('COMMENT');

                    if (isReview && report.action !== 'DELETE') {
                      router.push(`/festivals/${report.targetId}`);
                    } else if (isPostOrComment) {
                      router.push(`/community/${report.targetId}`);
                    } else {
                      toast('처리되었거나 확인할 수 없는 게시물입니다.', 'info');
                    }
                  }}
                >
                  <ExternalLink size={12} style={{ marginRight: 4 }} /> 원문 보기
                </button>
              </div>
  
              <p className={styles.cardBody} style={{ margin: expandedId === report.id ? '12px 0' : '0', overflow: 'hidden', textOverflow: 'ellipsis', display: expandedId === report.id ? 'block' : '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
                {report.content}
              </p>
  
              {expandedId === report.id && report.adminNote && (
                <div className={styles.adminResponse}>
                  <strong>관리자 답변:</strong>
                  {report.adminNote}
                </div>
              )}
  
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px', color: '#cbd5e1' }}>
                {expandedId === report.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
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

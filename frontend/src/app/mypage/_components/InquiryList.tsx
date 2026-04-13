"use client";

import React, { useState } from 'react';
import { HelpCircle, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import Pagination from '@/_component/common/Pagination';
import styles from '../mypage.module.css';
import InquiryModal from './InquiryModal';
import { useMyPageActivity } from '../_hooks/useMyPageActivity';
import { formatDate } from '@/lib/utils';
import type { MyInquiry } from '@/types/mypage';
import { INQUIRY_STATUS } from '@/constants/statusLabels';

export default function InquiryList() {
  // 🚀 공통 훅 사용
  const { 
    items: inquiries, 
    currentPage, 
    totalPages, 
    totalElements, 
    isLoading,
    refetch 
  } = useMyPageActivity('inquiries');

  const [expandedId, setExpandedId] = useState<number | string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleExpand = (id: number | string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleNewInquiry = () => {
    setIsModalOpen(true);
  };

  if (isLoading && inquiries.length === 0) return <div className={styles.loading}>불러오는 중...</div>;

  return (
    <div className={styles.listSection}>
      {/* 헤더: 타이틀과 신규 문의 버튼 */}
      <div className={styles.contentHeader}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-gray-900)' }}>내 문의 내역</h3>
        <button className={styles.btnNew} onClick={handleNewInquiry}>
          <Plus size={18} /> 1:1 문의하기
        </button>
      </div>

      {/* 문의 등록 모달 */}
      <InquiryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={refetch}
      />

      <div className={styles.listContainer}>
        <div className={styles.listSummary}>
          총 <strong>{totalElements}</strong>개의 문의 내역이 있습니다.
        </div>
        {inquiries.length === 0 ? (
          <div className={styles.emptyState}>
            <HelpCircle size={48} />
            <p>문의하신 내역이 없습니다.</p>
          </div>
        ) : (
          inquiries.map((item) => {
            const inquiry = item as MyInquiry;
            return (
              <div 
                key={inquiry.id} 
                className={`${styles.dataCard} ${expandedId === inquiry.id ? styles.cardActive : ''}`}
                onClick={() => toggleExpand(inquiry.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.cardHeader}>
                  <span className={`${styles.statusBadge} ${inquiry.status === INQUIRY_STATUS.ANSWERED ? styles.statusAnswered : styles.statusPending}`}>
                    {inquiry.status === INQUIRY_STATUS.ANSWERED ? '답변 완료' : '접수 대기'}
                  </span>
                  <span className={styles.cardMeta}>{formatDate(inquiry.createdAt)}</span>
                </div>
  
                <h4 className={styles.cardTitle}>{inquiry.title}</h4>
                
                <p className={`${styles.cardBody} ${expandedId === inquiry.id ? styles.cardBodyExpanded : styles.cardBodyCollapsed}`}>
                  {inquiry.content}
                </p>
  
                {expandedId === inquiry.id && inquiry.answer && (
                  <div className={styles.adminResponse}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <strong>관리자 답변</strong>
                      <span className={styles.cardMeta}>{formatDate(inquiry.answeredAt || '')}</span>
                    </div>
                    <div style={{ color: '#475569', lineHeight: '1.6' }}>
                      {inquiry.answer}
                    </div>
                  </div>
                )}
  
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px', color: '#cbd5e1' }}>
                  {expandedId === inquiry.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div style={{ marginTop: '24px' }}>
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </div>
    </div>
  );
}

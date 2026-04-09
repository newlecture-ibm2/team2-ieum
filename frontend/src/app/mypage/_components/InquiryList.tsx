"use client";

import React, { useState, useEffect } from 'react';
import { HelpCircle, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import styles from '../mypage.module.css';

import InquiryModal from './InquiryModal';

interface Inquiry {
  id: string;
  title: string;
  content: string;
  status: 'PENDING' | 'ANSWERED';
  createdAt: string;
  answer?: string;
  answeredAt?: string;
}

export default function InquiryList() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 날짜 포맷팅 함수 (YYYY-MM-DD HH:mm)
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch (e) {
      return dateStr;
    }
  };

  const fetchInquiries = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/users/me/inquiries');
      const data = await res.json();
      
      if (data.success && data.data) {
        setInquiries(data.data.inquiries || []);
      }
    } catch (error) {
      console.error('Failed to fetch inquiries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const toggleExpand = (id: string) => {
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
        onSuccess={fetchInquiries}
      />

      <div className={styles.listContainer}>
        {inquiries.length === 0 ? (
          <div className={styles.emptyState}>
            <HelpCircle size={48} />
            <p>문의하신 내역이 없습니다.</p>
          </div>
        ) : (
          inquiries.map((item) => (
            <div 
              key={item.id} 
              className={styles.dataCard}
              onClick={() => toggleExpand(item.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className={styles.cardHeader}>
                <span className={`${styles.statusBadge} ${item.status === 'ANSWERED' ? styles.statusAnswered : styles.statusPending}`}>
                  {item.status === 'ANSWERED' ? '답변 완료' : '접수 대기'}
                </span>
                <span className={styles.cardDate}>{formatDate(item.createdAt)}</span>
              </div>

              <h4 className={styles.cardTitle} style={{ margin: '8px 0' }}>{item.title}</h4>
              
              <p className={styles.cardBody} style={{ 
                margin: expandedId === item.id ? '12px 0' : '0', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                display: expandedId === item.id ? 'block' : '-webkit-box', 
                WebkitLineClamp: 1, 
                WebkitBoxOrient: 'vertical' 
              }}>
                {item.content}
              </p>

              {expandedId === item.id && item.answer && (
                <div className={styles.adminResponse}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong>관리자 답변</strong>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{formatDate(item.answeredAt || '')}</span>
                  </div>
                  <div style={{ color: '#475569', lineHeight: '1.6' }}>
                    {item.answer}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px', color: '#cbd5e1' }}>
                {expandedId === item.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

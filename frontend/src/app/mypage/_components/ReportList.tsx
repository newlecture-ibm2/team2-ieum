"use client";

import React, { useState, useEffect } from 'react';
import { ShieldAlert, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import styles from '../mypage.module.css';

interface Report {
  id: string;
  targetType: string;
  reason: string;
  description: string;
  status: 'PENDING' | 'RESOLVED' | 'REJECTED';
  action?: string;
  adminNote?: string;
  createdAt: string;
  targetId: string;
}

export default function ReportList() {
  const [reports, setReports] = useState<Report[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 설계서상 API: GET /api/users/me/reports
    const fetchReports = async () => {
      try {
        const res = await fetch('/api/reports/me');
        const data = await res.json();
        
        if (data.success && data.data) {
          setReports(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch reports:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getStatusStyle = (status: Report['status']) => {
    switch (status) {
      case 'PENDING': return styles.statusPending;
      case 'RESOLVED': return styles.statusResolved;
      case 'REJECTED': return styles.statusRejected;
      default: return '';
    }
  };

  const getStatusLabel = (status: Report['status']) => {
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
      {reports.length === 0 ? (
        <div className={styles.emptyState}>
          <ShieldAlert size={48} />
          <p>접수된 신고 내역이 없습니다.</p>
        </div>
      ) : (
        reports.map((report) => (
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
              <h4 className={styles.cardTitle}>{report.targetType} - {report.reason}</h4>
              <button 
                className={styles.btnAction} 
                style={{ fontSize: '0.7rem', border: '1px solid var(--color-primary-200)', color: 'var(--color-primary-600)', background: '#f5f3ff' }}
                onClick={(e) => { e.stopPropagation(); alert('원글로 이동합니다.'); }}
              >
                <ExternalLink size={12} style={{ marginRight: 4 }} /> 원글 보기
              </button>
            </div>

            <p className={styles.cardBody} style={{ margin: expandedId === report.id ? '12px 0' : '0', overflow: 'hidden', textOverflow: 'ellipsis', display: expandedId === report.id ? 'block' : '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
              {report.description}
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
        ))
      )}
    </div>
  );
}

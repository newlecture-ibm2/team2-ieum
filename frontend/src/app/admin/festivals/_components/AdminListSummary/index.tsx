import React from 'react';

interface AdminListSummaryProps {
  totalCount: number;
  label?: string;
}

export default function AdminListSummary({ totalCount, label = "전체" }: AdminListSummaryProps) {
  return (
    <div style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 500, color: '#4B5563', display: 'flex', alignItems: 'center' }}>
      <span style={{ marginRight: '6px' }}>📋</span>
      <span>{label}</span>
      <strong style={{ color: '#6366F1', margin: '0 4px' }}>{totalCount.toLocaleString()}</strong>
      <span>건 검색됨</span>
    </div>
  );
}

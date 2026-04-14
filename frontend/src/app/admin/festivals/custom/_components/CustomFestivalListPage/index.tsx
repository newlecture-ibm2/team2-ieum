'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { CustomFestivalItem, CustomFestivalListResult, ApiResponse } from '@/types/admin-festival';
import adminApi from '@/lib/adminApi';
import styles from './CustomFestivalListPage.module.css';

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  return dateStr.replace(/-/g, '.');
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'ONGOING': return '진행중';
    case 'UPCOMING': return '진행예정';
    case 'ENDED': return '종료';
    default: return status;
  }
}

export default function CustomFestivalListPage() {
  const [festivals, setFestivals] = useState<CustomFestivalItem[]>([]);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    title: '', region: '', startDate: '', endDate: '', category: '', content: '', isVisible: true
  });
  const [file, setFile] = useState<File | null>(null);

  const formRef = useRef<HTMLDivElement>(null);

  const fetchFestivals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.get<ApiResponse<CustomFestivalListResult>>('/festivals/custom', {
        params: {
          page: currentPage,
          size: 10,
          keyword: keyword || undefined,
          status: statusFilter || undefined,
        },
      });
      if (res.data.success && res.data.data) {
        setFestivals(res.data.data.festivals);
        setTotalPages(Math.ceil(res.data.data.totalElements / 10) || 1);
      }
    } catch (error) {
      console.error('Failed to fetch custom festivals:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, keyword, statusFilter]);

  useEffect(() => {
    fetchFestivals();
  }, [fetchFestivals]);

  const resetForm = () => {
    setEditingId(null);
    setFormData({ title: '', region: '', startDate: '', endDate: '', category: '', content: '', isVisible: true });
    setFile(null);
    setShowForm(false);
  };

  const handleOpenCreateForm = () => {
    resetForm();
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleOpenEditForm = (fst: CustomFestivalItem) => {
    setEditingId(fst.festivalId);
    setFormData({
      title: fst.title,
      region: fst.region,
      startDate: fst.startDate,
      endDate: fst.endDate,
      category: fst.category,
      content: fst.content || '',
      isVisible: fst.isVisible
    });
    setFile(null);
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('자체 기획 축제를 완전히 삭제하시겠습니까?')) return;
    try {
      const res = await adminApi.delete(`/festivals/custom/${id}`);
      if (res.data.success) {
        alert('삭제되었습니다.');
        fetchFestivals();
      }
    } catch (err) {
      alert('삭제에 실패했습니다.');
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.startDate || !formData.endDate || !formData.region) {
      return alert('필수 값(축제명, 지역, 날짜)을 입력해주세요.');
    }
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('region', formData.region);
      data.append('startDate', formData.startDate);
      data.append('endDate', formData.endDate);
      data.append('category', formData.category);
      data.append('content', formData.content);
      data.append('isVisible', String(formData.isVisible));
      if (file) {
        data.append('img', file);
      }

      const isEdit = !!editingId;
      const url = isEdit ? `/festivals/custom/${editingId}` : '/festivals/custom';
      
      let res;
      if (isEdit) {
        res = await adminApi.put(url, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        res = await adminApi.post(url, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }

      if (res.data.success) {
        alert(isEdit ? '수정되었습니다.' : '등록되었습니다.');
        resetForm();
        fetchFestivals();
      }
    } catch (err) {
      alert('저장에 실패했습니다.');
    }
  };

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>🎪 자체 기획 축제 관리</h1>
          <p className={styles.pageSubtitle}>직접 기획한 축제를 등록하고 관리합니다.</p>
        </div>
        <button onClick={handleOpenCreateForm} className={styles.addButton}>+ 축제 등록</button>
      </header>

      <section className={styles.filterBar}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="축제명 또는 지역 검색..."
          value={keyword}
          onChange={handleKeywordChange}
        />
        <div className={styles.statusButtonGroup}>
          <button 
            type="button" 
            className={`${styles.statusBtn} ${styles.statusBtnAll} ${statusFilter === '' ? styles.active : ''}`}
            onClick={() => { setStatusFilter(''); setCurrentPage(1); }}
          >전체</button>
          <button 
            type="button" 
            className={`${styles.statusBtn} ${styles.statusBtnOngoing} ${statusFilter === 'ongoing' ? styles.active : ''}`}
            onClick={() => { setStatusFilter('ongoing'); setCurrentPage(1); }}
          >진행중</button>
          <button 
            type="button" 
            className={`${styles.statusBtn} ${styles.statusBtnUpcoming} ${statusFilter === 'upcoming' ? styles.active : ''}`}
            onClick={() => { setStatusFilter('upcoming'); setCurrentPage(1); }}
          >진행예정</button>
          <button 
            type="button" 
            className={`${styles.statusBtn} ${styles.statusBtnEnded} ${statusFilter === 'ended' ? styles.active : ''}`}
            onClick={() => { setStatusFilter('ended'); setCurrentPage(1); }}
          >종료</button>
        </div>
      </section>

      <section className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: '22%' }}>축제명</th>
              <th style={{ width: '12%' }}>지역</th>
              <th style={{ width: '24%' }}>날짜</th>
              <th style={{ width: '12%' }}>카테고리</th>
              <th style={{ width: '10%' }}>상태</th>
              <th style={{ width: '20%', textAlign: 'center' }}>관리 (노출/동작)</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className={styles.emptyRow}>로딩 중...</td></tr>
            ) : festivals.length === 0 ? (
              <tr><td colSpan={6} className={styles.emptyRow}>조회된 자체 기획 축제가 없습니다.</td></tr>
            ) : (
              festivals.map((f) => (
                <tr key={f.festivalId} style={{ opacity: f.isVisible ? 1 : 0.5 }}>
                  <td className={styles.titleCell} onClick={() => handleOpenEditForm(f)}>{f.title}</td>
                  <td>{f.region}</td>
                  <td>{formatDate(f.startDate)} - {formatDate(f.endDate)}</td>
                  <td>{f.category || '일반'}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`${styles.badge} ${styles['badge-' + f.status]}`}>
                      {getStatusLabel(f.status)}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                      <div 
                        className={styles.toggleWrapper} 
                        onClick={() => {}}
                        style={{ cursor: 'default' }}
                      >
                        <span className={`${styles.toggleLabel} ${f.isVisible ? styles.public : styles.private}`}>
                          {f.isVisible ? '공개' : '숨김'}
                        </span>
                        <div className={`${styles.toggleTrack} ${f.isVisible ? styles.on : ''}`}>
                          <div className={`${styles.toggleThumb} ${f.isVisible ? styles.on : ''}`} />
                        </div>
                      </div>
                      <div className={styles.actionButtons}>
                        <button className={styles.actionBtn} onClick={() => handleOpenEditForm(f)} title="수정">✏️</button>
                        <button className={styles.actionBtn} onClick={() => handleDelete(f.festivalId)} title="삭제">🗑️</button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className={styles.pagination}>
          <button className={styles.pageBtn} disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}>← 이전</button>
          <span className={styles.pageInfo}>{currentPage} / {totalPages} 페이지</span>
          <button className={styles.pageBtn} disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>다음 →</button>
        </div>
      </section>

      {showForm && (
        <section ref={formRef} className={styles.formCard}>
          <div className={styles.formTitle}>📝 자체 기획 축제 {editingId ? '수정' : '등록'}</div>
          
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>축제명</label>
              <input type="text" className={styles.formInput} value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="축제 이름 입력" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>지역</label>
              <input type="text" className={styles.formInput} value={formData.region} onChange={e => setFormData({ ...formData, region: e.target.value })} placeholder="개최 지역 (예: 서울, 제주)" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>시작일</label>
              <input type="date" className={styles.formInput} value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>종료일</label>
              <input type="date" className={styles.formInput} value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>카테고리</label>
              <input type="text" className={styles.formInput} value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} placeholder="테마 카테고리 (예: 전시, 공연)" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>대표 이미지</label>
              <input type="file" className={styles.formInput} accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
            </div>
            <div className={`${styles.formGroup} ${styles.formFullWidth}`}>
              <label className={styles.formLabel}>상세 내용</label>
              <textarea className={styles.formTextarea} value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} placeholder="축제 상세 설명을 입력하세요" />
            </div>
            {editingId && (
              <div className={`${styles.formGroup} ${styles.formFullWidth}`}>
                <label className={styles.formLabel}>노출 여부</label>
                <select className={styles.formSelect} value={formData.isVisible ? 'true' : 'false'} onChange={e => setFormData({ ...formData, isVisible: e.target.value === 'true' })}>
                  <option value="true">공개</option>
                  <option value="false">숨김</option>
                </select>
              </div>
            )}
          </div>
          
          <div className={styles.formActions}>
            <button className={styles.cancelBtn} onClick={resetForm}>취소</button>
            <button className={styles.submitBtn} onClick={handleSubmit}>{editingId ? '수정 완료' : '등록 완료'}</button>
          </div>
        </section>
      )}
    </div>
  );
}

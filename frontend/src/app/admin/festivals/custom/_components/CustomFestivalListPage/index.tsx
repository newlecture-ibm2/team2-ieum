'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { CustomFestivalItem, CustomFestivalListResult, ApiResponse, RegionOptionDto } from '@/types/admin-festival';
import adminApi from '@/lib/adminApi';
import styles from './CustomFestivalListPage.module.css';

function formatDateRange(startDateStr: string, endDateStr: string): string {
  if (!startDateStr || !endDateStr) return '';
  const start = startDateStr.replace(/-/g, '.');
  const end = endDateStr.replace(/-/g, '.');
  if (start.substring(0, 4) === end.substring(0, 4)) {
    return `${start} ~ ${end.substring(5)}`;
  }
  return `${start} ~ ${end}`;
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [festivals, setFestivals] = useState<CustomFestivalItem[]>([]);
  const [statusCounts, setStatusCounts] = useState({ total: 0, ongoing: 0, upcoming: 0, ended: 0 });
  const [regionOptions, setRegionOptions] = useState<RegionOptionDto[]>([]);
  
  // URL에서 초기값 읽기
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  const initialKeyword = searchParams.get('keyword') || '';
  const initialStatus = searchParams.get('status') || '';

  const [keyword, setKeyword] = useState(initialKeyword);
  const [searchTerm, setSearchTerm] = useState(initialKeyword);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // URL 동기화 (상태가 변할 때 URL을 업데이트)
  useEffect(() => {
    const params = new URLSearchParams();
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (keyword) params.set('keyword', keyword);
    if (statusFilter) params.set('status', statusFilter);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [currentPage, keyword, statusFilter, pathname, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (keyword !== searchTerm) {
        setKeyword(searchTerm);
        setCurrentPage(1);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, keyword]);

  // Form State
  const getToday = () => new Date().toISOString().split('T')[0];

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    title: '', areaCode: '', startDate: getToday(), endDate: getToday(), category: '', content: '', isVisible: true
  });
  const [file, setFile] = useState<File | null>(null);

  // 모달 띄워졌을 때 배경 스크롤 방지
  useEffect(() => {
    if (showForm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showForm]);


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
        if (res.data.data.statusCounts) {
          setStatusCounts(res.data.data.statusCounts);
        }
        setTotalPages(Math.ceil(res.data.data.totalElements / 10) || 1);
      }
    } catch (error) {
      console.error('Failed to fetch custom festivals:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, keyword, statusFilter]);

  const fetchRegionOptions = useCallback(async () => {
    try {
      const res = await adminApi.get<ApiResponse<RegionOptionDto[]>>('/festivals/regions/options');
      if (res.data.success && res.data.data) {
        setRegionOptions(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch region options:', error);
    }
  }, []);

  useEffect(() => {
    fetchFestivals();
  }, [fetchFestivals]);

  useEffect(() => {
    fetchRegionOptions();
  }, [fetchRegionOptions]);

  const resetForm = () => {
    setEditingId(null);
    const today = getToday();
    setFormData({ title: '', areaCode: '', startDate: today, endDate: today, category: '', content: '', isVisible: true });
    setFile(null);
    setShowForm(false);
  };

  const handleOpenCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const handleOpenEditForm = (fst: CustomFestivalItem) => {
    setEditingId(fst.festivalId);
    setFormData({
      title: fst.title || '',
      areaCode: fst.areaCode || '',
      startDate: fst.startDate || '',
      endDate: fst.endDate || '',
      category: fst.category || '',
      content: fst.content || '',
      isVisible: fst.isVisible
    });
    setFile(null);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.startDate || !formData.endDate || !formData.areaCode) {
      return alert('필수 값(축제명, 지역, 날짜)을 입력해주세요.');
    }
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('areaCode', formData.areaCode);
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
    setSearchTerm(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setKeyword(searchTerm);
      setCurrentPage(1);
    }
  };

  const handleToggleVisibility = async (festivalId: number, currentVisible: boolean) => {
    if (!confirm(`해당 자체 기획 축제를 ${currentVisible ? '숨김' : '공개'} 처리하시겠습니까?`)) return;
    try {
      const res = await adminApi.patch(`/festivals/${festivalId}/visibility`, {
        isVisible: !currentVisible,
      });
      if (res.data.success) {
        setFestivals(prev =>
          prev.map(f => (f.festivalId === festivalId ? { ...f, isVisible: !currentVisible } : f))
        );
      } else {
        alert(res.data.error?.message || '상태 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to update visibility:', error);
      alert('오류가 발생했습니다.');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>🎪 자체 기획 축제 관리</h1>
          <p className={styles.pageSubtitle}>직접 기획한 축제를 등록하고 관리합니다.</p>
        </div>
      </header>

      <section className={styles.kpiContainer}>
        <div className={styles.kpiHeader}>
          <div>
            <div className={styles.kpiTitle}>축제 현황 및 관리</div>
            <div className={styles.kpiSubtitle}>자체적으로 등록한 축제들의 상태 통계입니다.</div>
          </div>
          <button onClick={handleOpenCreateForm} className={styles.addButton}>
            <span>+</span>
            <span>축제 등록</span>
          </button>
        </div>
        <div className={styles.statGrid}>
        <div 
          className={`${styles.statCard} ${styles.statTotal} ${styles.kpiCardInteractive} ${statusFilter === '' ? styles.statActive : ''}`}
          onClick={() => { setStatusFilter(''); setCurrentPage(1); }}
        >
          <div className={styles.statLabel}>전체 축제</div>
          <div className={styles.statValue}>{statusCounts.total}</div>
        </div>
        <div 
          className={`${styles.statCard} ${styles.statOngoing} ${styles.kpiCardInteractive} ${statusFilter === 'ONGOING' ? styles.statActive : ''}`}
          onClick={() => { setStatusFilter('ONGOING'); setCurrentPage(1); }}
        >
          <div className={styles.statLabel}>진행중</div>
          <div className={`${styles.statValue} ${styles.textGreen}`}>{statusCounts.ongoing}</div>
        </div>
        <div 
          className={`${styles.statCard} ${styles.statUpcoming} ${styles.kpiCardInteractive} ${statusFilter === 'UPCOMING' ? styles.statActive : ''}`}
          onClick={() => { setStatusFilter('UPCOMING'); setCurrentPage(1); }}
        >
          <div className={styles.statLabel}>진행예정</div>
          <div className={`${styles.statValue} ${styles.textPurple}`}>{statusCounts.upcoming}</div>
        </div>
        <div 
          className={`${styles.statCard} ${styles.statEnded} ${styles.kpiCardInteractive} ${statusFilter === 'ENDED' ? styles.statActive : ''}`}
          onClick={() => { setStatusFilter('ENDED'); setCurrentPage(1); }}
        >
          <div className={styles.statLabel}>종료</div>
          <div className={`${styles.statValue} ${styles.textGray}`}>{statusCounts.ended}</div>
        </div>
        </div>
      </section>

      <section className={styles.filterBar}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="축제명 또는 지역으로 검색하세요"
          value={searchTerm}
          onChange={handleKeywordChange}
          onKeyDown={handleKeyDown}
        />
      </section>

      <section className={styles.tableCard}>
        <table className={styles.table}>
          <colgroup>
            <col className={styles.festivalNameCol} />
            <col className={styles.regionCol} />
            <col className={styles.dateCol} />
            <col className={styles.statusCol} />
            <col className={styles.actionCol} />
          </colgroup>
          <thead>
            <tr className={styles.tableHeaderRow}>
              <th className={`${styles.tableHeaderCell} ${styles.textLeft}`}>축제명</th>
              <th className={`${styles.tableHeaderCell} ${styles.textLeft}`}>지역</th>
              <th className={`${styles.tableHeaderCell} ${styles.textCenter}`}>날짜</th>
              <th className={`${styles.tableHeaderCell} ${styles.textCenter}`}>상태</th>
              <th className={`${styles.tableHeaderCell} ${styles.textRight}`}>관리 (노출/동작)</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className={styles.emptyRow}>로딩 중...</td></tr>
            ) : festivals.length === 0 ? (
              <tr><td colSpan={5} className={styles.emptyRow}>조회된 자체 기획 축제가 없습니다.</td></tr>
            ) : (
              festivals.map((f) => (
                <tr 
                  key={f.festivalId} 
                  className={`${styles.tableRow} ${styles.tableRowHover} ${!f.isVisible ? styles.hiddenRow : ''}`}
                >
                  <td className={`${styles.tableCell} ${styles.textLeft} ${styles.festivalNameCell}`}>
                    <div className={styles.festivalNameText} onClick={() => handleOpenEditForm(f)} style={{ cursor: 'pointer' }} title="클릭하여 수정">
                      {f.title}
                    </div>
                  </td>
                  <td className={`${styles.tableCell} ${styles.textLeft}`}>{f.areaLabel || f.areaCode}</td>
                  <td className={`${styles.tableCell} ${styles.textCenter}`}>
                    {formatDateRange(f.startDate, f.endDate)}
                  </td>
                  <td className={`${styles.tableCell} ${styles.textCenter}`}>
                    <span className={`${styles.statusBadge} ${f.status === 'ONGOING' ? styles.statusOngoing : f.status === 'UPCOMING' ? styles.statusUpcoming : styles.statusEnded}`}>
                      {getStatusLabel(f.status)}
                    </span>
                  </td>
                  <td className={`${styles.tableCell} ${styles.textRight}`}>
                    <div className={styles.actionGroup}>
                      <div 
                        className={styles.toggleWrapper}
                        onClick={() => handleToggleVisibility(f.festivalId, f.isVisible)}
                        title="클릭하여 노출 상태 변경"
                      >
                        <span className={`${styles.visibilityLabel} ${f.isVisible ? styles.public : styles.private}`}>
                          {f.isVisible ? '공개' : '숨김'}
                        </span>
                        <div className={`${styles.toggleTrack} ${f.isVisible ? styles.on : ''}`}>
                          <div className={`${styles.toggleThumb} ${f.isVisible ? styles.on : ''}`} />
                        </div>
                      </div>
                      <button className={styles.editButton} onClick={() => handleOpenEditForm(f)} title="수정">✏️</button>
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
        <div className={styles.modalOverlay} onClick={resetForm}>
          <div 
            className={styles.modalContent} 
            onClick={(e) => e.stopPropagation()} /* 오버레이 클릭 시에만 닫히도록 */
          >
            <div className={styles.modalHeader}>
              <div className={styles.formTitle}>📝 자체 기획 축제 {editingId ? '수정' : '등록'}</div>
              <button className={styles.closeBtn} onClick={resetForm}>✕</button>
            </div>
            
            <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>축제명</label>
              <input type="text" className={styles.formInput} value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="축제 이름 입력" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>개최 지역 / 유형</label>
              <select 
                className={styles.formSelect} 
                value={formData.areaCode} 
                onChange={e => setFormData({ ...formData, areaCode: e.target.value })}
              >
                <option value="" disabled>지역을 선택하세요</option>
                
                <optgroup label="표준 지역 (공공 API)">
                  {regionOptions.filter(o => o.type === 'STANDARD').map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </optgroup>
                
                <optgroup label="자체 예외 지역">
                  {regionOptions.filter(o => o.type === 'CUSTOM').map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </optgroup>
              </select>
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
              <select className={`${styles.formSelect} ${styles.selectDisabled}`} value="" disabled onChange={() => {}}>
                <option value="">공공 API 기준 정리 후 제공 예정</option>
              </select>
              <span className={styles.helperText}>추후 옵션 활성화 예정</span>
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
          </div>
        </div>
      )}
    </div>
  );
}

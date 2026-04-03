'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import type { CustomFestivalItem, CustomFestivalListResult, ApiResponse, RegionOptionDto, CategoryOptionDto } from '@/types/admin-festival';
import adminApi from '@/lib/adminApi';
import styles from './CustomFestivalListPage.module.css';

function formatDateRange(startDateStr: string, endDateStr: string): string {
  if (!startDateStr || !endDateStr) return '';
  const start = startDateStr.replace(/-/g, '.');
  const end = endDateStr.replace(/-/g, '.');
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
  const [categoryOptions, setCategoryOptions] = useState<CategoryOptionDto[]>([]);
  
  // URL에서 초기값 읽기
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  const initialKeyword = searchParams.get('keyword') || '';
  const initialStatus = searchParams.get('status') || '';

  const [keyword, setKeyword] = useState(initialKeyword);
  const [searchTerm, setSearchTerm] = useState(initialKeyword);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [excludeHidden, setExcludeHidden] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // URL 동기화 (상태가 변할 때 URL을 업데이트)
  useEffect(() => {
    const params = new URLSearchParams();
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (keyword) params.set('keyword', keyword);
    if (statusFilter) params.set('status', statusFilter);
    if (excludeHidden) params.set('excludeHidden', String(excludeHidden));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [currentPage, keyword, statusFilter, excludeHidden, pathname, router]);

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
    title: '', areaCode: '', startDate: getToday(), endDate: getToday(), category: '', content: '', isVisible: true,
    eventPlace: '', address: '', detailAddress: '', useFee: '', startTime: '09:00', endTime: '18:00', isAllDay: false, tel: '', homepage: '', sigunguCode: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [extraFiles, setExtraFiles] = useState<File[]>([]);
  const [mainPreview, setMainPreview] = useState<string | null>(null);
  const [extraPreviews, setExtraPreviews] = useState<string[]>([]);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [sigunguOptions, setSigunguOptions] = useState<RegionOptionDto[]>([]);
  const [isFree, setIsFree] = useState(false);

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
          excludeHidden: excludeHidden || undefined,
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
  }, [currentPage, keyword, statusFilter, excludeHidden]);

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

  const fetchCategoryOptions = useCallback(async () => {
    try {
      const res = await adminApi.get<ApiResponse<CategoryOptionDto[]>>('/festivals/categories/options');
      if (res.data.success && res.data.data) {
        setCategoryOptions(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch category options:', error);
    }
  }, []);

  const fetchSigungus = async (areaCode: string) => {
    if (!areaCode) return;
    const isStandard = regionOptions.some(r => r.value === areaCode && r.type === 'STANDARD');
    if (isStandard) {
      try {
        const res = await adminApi.get<ApiResponse<RegionOptionDto[]>>(`/festivals/regions/${areaCode}/sigungus`);
        if (res.data.success && res.data.data) {
          setSigunguOptions(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch sigungu options:', error);
      }
    } else {
      setSigunguOptions([]);
    }
  };

  const handleAreaCodeChange = (newAreaCode: string) => {
    setFormData(prev => ({ ...prev, areaCode: newAreaCode, sigunguCode: '' }));
    setErrors(prev => ({ ...prev, areaCode: undefined }));
    fetchSigungus(newAreaCode);
  };

  const openPostcode = () => {
    const loadAndOpen = () => {
      new (window as any).daum.Postcode({
        oncomplete: function(data: any) {
          const fullAddress = data.roadAddress || data.jibunAddress;
          setFormData(prev => ({ ...prev, address: fullAddress }));
        }
      }).open();
    };

    if (typeof window !== 'undefined' && (window as any).daum && (window as any).daum.Postcode) {
      loadAndOpen();
    } else {
      const script = document.createElement('script');
      script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
      script.onload = () => {
        (window as any).daum.postcode.load(() => {
          loadAndOpen();
        });
      };
      document.head.appendChild(script);
    }
  };

  useEffect(() => {
    fetchFestivals();
  }, [fetchFestivals]);

  useEffect(() => {
    fetchRegionOptions();
    fetchCategoryOptions();
  }, [fetchRegionOptions, fetchCategoryOptions]);

  const resetForm = () => {
    setEditingId(null);
    const today = getToday();
    setFormData({ 
      title: '', areaCode: '', startDate: today, endDate: today, category: '', content: '', isVisible: true,
      eventPlace: '', address: '', detailAddress: '', useFee: '', startTime: '09:00', endTime: '18:00', isAllDay: false, tel: '', homepage: '', sigunguCode: ''
    });
    setFile(null);
    setExtraFiles([]);
    setMainPreview(null);
    setExtraPreviews([]);
    setErrors({});
    setShowForm(false);
  };

  const handleOpenCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const handleOpenEditForm = (fst: CustomFestivalItem) => {
    setEditingId(fst.festivalId);
    const parsedPlayTime = (fst as any).playTime || '';
    const isAllDay = parsedPlayTime === '종일';

    setFormData({
      title: fst.title || '',
      areaCode: fst.areaCode || '',
      startDate: fst.startDate || '',
      endDate: fst.endDate || '',
      category: fst.category || '',
      content: fst.content || '',
      isVisible: fst.isVisible,
      // @ts-ignore
      eventPlace: (fst as any).eventPlace || '',
      address: (fst as any).address || '',
      detailAddress: '',
      useFee: String((fst as any).useFee || ''),
      isAllDay: isAllDay,
      startTime: isAllDay ? '' : parsedPlayTime.split(' ~ ')[0] || '',
      endTime: isAllDay ? '' : parsedPlayTime.split(' ~ ')[1] || '',
      tel: (fst as any).tel || '',
      homepage: (fst as any).homepage || '',
      sigunguCode: (fst as any).sigunguCode || ''
    });
    setFile(null);
    setMainPreview(fst.imgUrl || null);
    setExtraPreviews(fst.extraImages ? fst.extraImages.split(',') : []);
    
    // reset extraFiles when opening form since it's only meant for newly uploaded files
    setExtraFiles([]);
    setErrors({});
    
    // Check if free
    if ((fst as any).useFee === '무료') {
      setIsFree(true);
    } else {
      setIsFree(false);
    }

    setShowForm(true);
    
    // Fetch sigungu if area code is standard
    if (fst.areaCode) {
      setTimeout(() => fetchSigungus(fst.areaCode), 0); // Allow regionOptions to be accessible or if it's dependent on state
    }
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string | undefined> = {};
    if (!formData.title.trim()) newErrors.title = '축제명을 입력해주세요.';
    else if (formData.title.length > 100) newErrors.title = '축제명은 100자 이내로 입력하세요.';
    
    if (!formData.areaCode) newErrors.areaCode = '개최 지역을 선택해주세요.';
    if (!formData.startDate) newErrors.startDate = '시작일을 선택해주세요.';
    if (!formData.endDate) newErrors.endDate = '종료일을 선택해주세요.';
    if (!formData.category) newErrors.category = '카테고리를 선택해주세요.';
    
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = '종료일은 시작일 이후여야 합니다.';
    }
    if (formData.startTime && formData.endTime && formData.startTime > formData.endTime) {
      newErrors.endTime = '종료 시간은 시작 시간 이후여야 합니다.';
    }
    if (formData.tel && !/^[\d-]+$/.test(formData.tel)) {
      newErrors.tel = '올바른 전화번호 형식이 아닙니다. (숫자와 하이픈만)';
    }
    if (formData.homepage && !/^https?:\/\/.+/.test(formData.homepage)) {
      newErrors.homepage = 'http:// 또는 https:// 로 시작하는 주소여야 합니다.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; // Stop submission
    }

    if (formData.eventPlace && formData.eventPlace.length > 100) {
      alert('행사장명은 100자 이내로 입력하세요.');
      return;
    }
    
    if (formData.content && formData.content.length > 2000) {
      alert('상세 내용은 2000자 이내로 입력하세요.');
      return;
    }
    
    if (!isFree && formData.useFee && /[^0-9,]/.test(formData.useFee)) {
      alert('이용 요금은 숫자만 입력할 수 있습니다.');
      return;
    }

    if (!file && !mainPreview) {
      alert('대표 이미지는 필수 등록 항목입니다.');
      return;
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
      
      const fullAddress = [formData.address, formData.detailAddress].filter(Boolean).join(' ');
      
      if (formData.eventPlace) data.append('eventPlace', formData.eventPlace);
      if (fullAddress) data.append('address', fullAddress);
      
      const finalFee = isFree ? '무료' : formData.useFee;
      if (finalFee) data.append('useFee', finalFee);
      
      const builtPlayTime = formData.isAllDay ? '종일' : [formData.startTime, formData.endTime].filter(Boolean).join(' ~ ');
      if (builtPlayTime) data.append('playTime', builtPlayTime);
      if (formData.tel) data.append('tel', formData.tel);
      if (formData.homepage) data.append('homepage', formData.homepage);
      if (formData.sigunguCode) data.append('sigunguCode', formData.sigunguCode);
      if (file) {
        data.append('img', file);
      }
      if (extraFiles && extraFiles.length > 0) {
        extraFiles.forEach(f => {
          data.append('extraImgs', f);
        });
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

  const handleSyncButton = async () => {
    if (!confirm('지역 마스터 데이터 및 자체 기획 축제 상태 동기화를 진행하시겠습니까?')) return;
    try {
      const res = await adminApi.post('/festivals/custom/sync');
      if (res.data.success) {
        alert('동기화가 신속하게 완료되었습니다.');
        fetchFestivals();
        fetchRegionOptions();
      } else {
        alert('동기화 실패: ' + res.data.error?.message);
      }
    } catch (error) {
      console.error('Failed to sync locally', error);
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
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleSyncButton} className={styles.filterBtn} style={{ background: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1' }}>
              <span>🔄</span>
              <span style={{ marginLeft: '4px' }}>동기화 실행</span>
            </button>
            <button onClick={handleOpenCreateForm} className={styles.addButton}>
              <span>+</span>
              <span>축제 등록</span>
            </button>
          </div>
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
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className={`${styles.filterBtn} ${!excludeHidden ? styles.activeFilter : ''}`} 
            onClick={() => { setExcludeHidden(false); setCurrentPage(1); }}
          >전체 보기</button>
          <button 
            className={`${styles.filterBtn} ${excludeHidden ? styles.activeFilter : ''}`} 
            onClick={() => { setExcludeHidden(true); setCurrentPage(1); }}
          >숨김 제외</button>
        </div>
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
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <div className={styles.formTitle}>📝 자체 기획 축제 {editingId ? '수정' : '등록'}</div>
              <button className={styles.closeBtn} onClick={resetForm}>✕</button>
            </div>
            
            <div className={styles.formGrid} style={{ overflowY: 'auto' }}>
                {/* --- 좌측 컬럼 --- */}
                <div className={styles.layoutLeft}>
                  
                  {/* 기본 정보 */}
                  <div className={styles.formSection}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}><span className={styles.requiredStar}>*</span> 축제명</label>
                      <input type="text" maxLength={100} className={`${styles.formInput} ${errors.title ? styles.errorInput : ''}`} value={formData.title} onChange={e => { setFormData({ ...formData, title: e.target.value }); setErrors(prev => ({ ...prev, title: undefined })); }} placeholder="축제 이름 입력" />
                      {errors.title && <span className={styles.errorText}>⚠ {errors.title}</span>}
                    </div>
                    <div className={styles.formRowAligned}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}><span className={styles.requiredStar}>*</span> 개최 지역</label>
                        <select 
                          className={`${styles.formSelect} ${errors.areaCode ? styles.errorInput : ''}`} 
                          value={formData.areaCode} 
                          onChange={e => handleAreaCodeChange(e.target.value)}
                        >
                          <option value="" disabled>지역 선택</option>
                          <optgroup label="표준 (공공 API)">
                            {regionOptions.filter(o => o.type === 'STANDARD').map(o => (
                              <option key={o.value} value={o.value} disabled={o.active === false} style={o.active === false ? { color: '#999' } : {}}>
                                {o.label} {o.active === false ? '(비활성)' : ''}
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="자체 예외 지역">
                            {regionOptions.filter(o => o.type === 'CUSTOM').map(o => (
                              <option key={o.value} value={o.value} disabled={o.active === false} style={o.active === false ? { color: '#999' } : {}}>
                                {o.label} {o.active === false ? '(비활성)' : ''}
                              </option>
                            ))}
                          </optgroup>
                        </select>
                        {errors.areaCode && <span className={styles.errorText}>⚠ {errors.areaCode}</span>}
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>시군구</label>
                        <select 
                          className={`${styles.formSelect} ${errors.sigunguCode ? styles.errorInput : ''} ${sigunguOptions.length === 0 ? styles.disabledField : ''}`} 
                          value={formData.sigunguCode} 
                          onChange={e => setFormData({ ...formData, sigunguCode: e.target.value })}
                          disabled={sigunguOptions.length === 0}
                        >
                          <option value="">{sigunguOptions.length === 0 ? '선택 불필요' : '시군구 선택'}</option>
                          {sigunguOptions.map(opt => (
                            <option key={opt.value} value={opt.value} disabled={opt.active === false} style={opt.active === false ? { color: '#999' } : {}}>
                              {opt.label} {opt.active === false ? '(비활성)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}><span className={styles.requiredStar}>*</span> 카테고리</label>
                      <select 
                        className={`${styles.formSelect} ${errors.category ? styles.errorInput : ''}`} 
                        value={formData.category} 
                        onChange={e => { setFormData({ ...formData, category: e.target.value }); setErrors(prev => ({ ...prev, category: undefined })); }}
                      >
                        <option value="" disabled>분류 선택</option>
                        <optgroup label="표준 분류">
                          {categoryOptions.filter(o => o.type === 'STANDARD').map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </optgroup>
                        <optgroup label="특수 분류">
                          {categoryOptions.filter(o => o.type === 'CUSTOM').map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </optgroup>
                      </select>
                      {errors.category && <span className={styles.errorText}>⚠ {errors.category}</span>}
                    </div>
                  </div>

                  {/* 일정 & 운영 */}
                  <div className={styles.formSection}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}><span className={styles.requiredStar}>*</span> 축제 기간</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                          <input type="date" className={`${styles.formInput} ${errors.startDate ? styles.errorInput : ''}`} value={formData.startDate} onChange={e => { setFormData({ ...formData, startDate: e.target.value }); setErrors(prev => ({ ...prev, startDate: undefined, endDate: undefined })); }} onClick={e => (e.currentTarget as any).showPicker && (e.currentTarget as any).showPicker()} onKeyDown={e => e.preventDefault()} />
                          <span style={{ color: '#94a3b8' }}>~</span>
                          <input type="date" className={`${styles.formInput} ${errors.endDate ? styles.errorInput : ''}`} value={formData.endDate} onChange={e => { setFormData({ ...formData, endDate: e.target.value }); setErrors(prev => ({ ...prev, endDate: undefined })); }} onClick={e => (e.currentTarget as any).showPicker && (e.currentTarget as any).showPicker()} onKeyDown={e => e.preventDefault()} />
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', marginLeft: '8px', flex: 'none', visibility: 'hidden', pointerEvents: 'none' }}>
                          <input type="checkbox" /> 종일
                        </label>
                      </div>
                      {(errors.startDate || errors.endDate) && <span className={styles.errorText}>⚠ {errors.startDate || errors.endDate}</span>}
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>운영 시간</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, opacity: formData.isAllDay ? 0.5 : 1, pointerEvents: formData.isAllDay ? 'none' : 'auto' }}>
                          <input type="time" disabled={formData.isAllDay} className={`${styles.formInput} ${errors.endTime ? styles.errorInput : ''}`} value={formData.startTime} onChange={e => { setFormData({ ...formData, startTime: e.target.value }); setErrors(prev => ({ ...prev, endTime: undefined })); }} onClick={e => (e.currentTarget as any).showPicker && (e.currentTarget as any).showPicker()} onKeyDown={e => e.preventDefault()} />
                          <span style={{ color: '#94a3b8' }}>~</span>
                          <input type="time" disabled={formData.isAllDay} className={`${styles.formInput} ${errors.endTime ? styles.errorInput : ''}`} value={formData.endTime} onChange={e => { setFormData({ ...formData, endTime: e.target.value }); setErrors(prev => ({ ...prev, endTime: undefined })); }} onClick={e => (e.currentTarget as any).showPicker && (e.currentTarget as any).showPicker()} onKeyDown={e => e.preventDefault()} />
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer', userSelect: 'none', marginLeft: '8px', flex: 'none' }}>
                          <input type="checkbox" checked={formData.isAllDay || false} onChange={e => {
                            const checked = e.target.checked;
                            if (checked) {
                              setFormData({ ...formData, isAllDay: true, startTime: '', endTime: '' });
                              setErrors(prev => ({ ...prev, endTime: undefined }));
                            } else {
                              setFormData({ ...formData, isAllDay: false, startTime: '09:00', endTime: '18:00' });
                            }
                          }} /> 종일
                        </label>
                      </div>
                      {errors.endTime && <span className={styles.errorText}>⚠ {errors.endTime}</span>}
                    </div>
                  </div>

                  {/* 장소 & 연락 */}
                  <div className={styles.formSection}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>행사장명</label>
                      <input type="text" maxLength={100} className={styles.formInput} value={formData.eventPlace} onChange={e => setFormData({ ...formData, eventPlace: e.target.value })} placeholder="예: 킨텍스 1전시장" />
                    </div>
                    <div className={styles.formGroup} style={{ alignItems: 'flex-start' }}>
                      <label className={styles.formLabel} style={{ marginTop: '8px' }}>주소</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input 
                            type="text" 
                            className={`${styles.formInput} ${styles.disabledField}`} 
                            style={{ flex: 1 }}
                            value={formData.address} 
                            readOnly
                            placeholder="기본 주소 (검색)" 
                          />
                          <button 
                            type="button" 
                            onClick={openPostcode}
                            className={styles.searchBtn}
                          >
                            찾기
                          </button>
                        </div>
                        <input 
                          type="text" 
                          maxLength={100}
                          className={styles.formInput} 
                          style={{ width: '100%' }}
                          value={formData.detailAddress} 
                          onChange={e => setFormData({ ...formData, detailAddress: e.target.value })} 
                          placeholder="상세 주소 입력" 
                        />
                      </div>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>이용 요금</label>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input 
                            type="text" 
                            maxLength={20}
                            className={`${styles.formInput} ${isFree ? styles.disabledField : ''}`} 
                            value={formData.useFee ? Number(formData.useFee.replace(/,/g, '')).toLocaleString() : ''} 
                            onChange={e => setFormData({ ...formData, useFee: e.target.value.replace(/[^0-9]/g, '') })} 
                            placeholder={isFree ? "무료 행사" : "예: 10,000"} 
                            style={{ width: '160px', flex: 'none' }} 
                            disabled={isFree}
                          />
                          <span style={{ color: '#475569', fontSize: '13px', fontWeight: 500 }}>원</span>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer', userSelect: 'none', marginLeft: '8px' }}>
                          <input type="checkbox" checked={isFree} onChange={e => { setIsFree(e.target.checked); if (e.target.checked) setFormData({ ...formData, useFee: '' }); }} /> 무료
                        </label>
                      </div>
                    </div>
                    <div className={styles.formRowAligned}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>문의 연락처</label>
                        <input type="tel" maxLength={13} className={`${styles.formInput} ${errors.tel ? styles.errorInput : ''}`} value={formData.tel} onChange={e => { setFormData({ ...formData, tel: e.target.value }); setErrors(prev => ({ ...prev, tel: undefined })); }} placeholder="예: 02-1234-5678" />
                        {errors.tel && <span className={styles.errorText}>⚠ {errors.tel}</span>}
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>공식 홈페이지</label>
                        <input type="url" maxLength={255} className={`${styles.formInput} ${errors.homepage ? styles.errorInput : ''}`} value={formData.homepage} onChange={e => { setFormData({ ...formData, homepage: e.target.value }); setErrors(prev => ({ ...prev, homepage: undefined })); }} placeholder="http://..." />
                        {errors.homepage && <span className={styles.errorText}>⚠ {errors.homepage}</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* --- 우측 컬럼 --- */}
                <div className={styles.layoutRight}>
                  {/* 콘텐츠 */}
                  <div className={styles.formSection} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    
                    <div className={styles.formGroupColumn}>
                      <label className={styles.formLabelColumn}><span className={styles.requiredStar}>*</span> 대표 이미지</label>
                      <label 
                        className={styles.imageUploadBox}
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => {
                          e.preventDefault();
                          const f = e.dataTransfer.files?.[0];
                          if (f) { setFile(f); setMainPreview(URL.createObjectURL(f)); }
                        }}
                      >
                        <input type="file" style={{ display: 'none' }} accept="image/*" onChange={e => {
                          const f = e.target.files?.[0] || null;
                          setFile(f);
                          if (f) setMainPreview(URL.createObjectURL(f));
                          else setMainPreview(null);
                        }} />
                        {mainPreview ? (
                          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', padding: '16px', gap: '16px', boxSizing: 'border-box' }}>
                            <img 
                              src={mainPreview.startsWith('http') || mainPreview.startsWith('blob:') ? mainPreview : `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}${mainPreview.startsWith('/') ? '' : '/'}${mainPreview}`} 
                              alt="대표 이미지" 
                              style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEnlargedImage(mainPreview.startsWith('http') || mainPreview.startsWith('blob:') ? mainPreview : `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}${mainPreview.startsWith('/') ? '' : '/'}${mainPreview}`); }} 
                            />
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                              <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: 600 }}>대표 이미지 등록됨</span>
                              <span style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>클릭하여 변경 (또는 드래그앤드롭)</span>
                            </div>
                            <div style={{ padding: '8px 14px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', color: '#475569', fontWeight: 600, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                              이미지 변경
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className={styles.uploadIcon}>
                              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                            </div>
                            <div style={{ color: '#64748b', fontSize: '13px', marginTop: '8px' }}>클릭 또는 드래그하여 등록</div>
                          </>
                        )}
                      </label>
                    </div>

                    <div className={styles.formGroupColumn} style={{ flexGrow: 0, marginTop: '8px' }}>
                      <label className={styles.formLabelColumn}>갤러리 이미지 (최대 7장)</label>
                      <div className={styles.imagePreviewGrid}>
                        {extraPreviews.map((p, i) => (
                          <div key={i} className={styles.galleryPreviewItem}>
                            <img 
                              src={p.startsWith('http') || p.startsWith('blob:') ? p : `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}${p.startsWith('/') ? '' : '/'}${p}`} 
                              alt={`갤러리 ${i+1}`} 
                              className={styles.galleryImg} 
                              onClick={() => setEnlargedImage(p.startsWith('http') || p.startsWith('blob:') ? p : `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}${p.startsWith('/') ? '' : '/'}${p}`)}
                            />
                            <button
                              type="button"
                              className={styles.removeBtn}
                              onClick={() => {
                                const idxToRemove = i;
                                setExtraPreviews(prev => prev.filter((_, idx) => idx !== idxToRemove));
                                const existingCount = extraPreviews.length - extraFiles.length;
                                if (idxToRemove >= existingCount) {
                                    const fileIdxToRemove = idxToRemove - existingCount;
                                    setExtraFiles(prev => prev.filter((_, idx) => idx !== fileIdxToRemove));
                                }
                              }}
                            >✕</button>
                          </div>
                        ))}
                        {extraPreviews.length < 7 && (
                          <label 
                            className={styles.imageUploadBoxMini}
                            onDragOver={e => e.preventDefault()}
                            onDrop={e => {
                              e.preventDefault();
                              const newFiles = Array.from(e.dataTransfer.files || []);
                              if (extraFiles.length + newFiles.length > 7) {
                                alert('갤러리 이미지는 총 7장까지만 등록 가능합니다.');
                                return;
                              }
                              setExtraFiles(prev => [...prev, ...newFiles]);
                              setExtraPreviews(prev => [...prev, ...newFiles.map(f => URL.createObjectURL(f))]);
                            }}
                          >
                            <input type="file" multiple style={{ display: 'none' }} accept="image/*" onChange={e => {
                              const newFiles = Array.from(e.target.files || []);
                              if (extraFiles.length + newFiles.length > 7) {
                                alert('갤러리 이미지는 총 7장까지만 등록 가능합니다.');
                                e.target.value = '';
                                return;
                              }
                              setExtraFiles(prev => [...prev, ...newFiles]);
                              setExtraPreviews(prev => [...prev, ...newFiles.map(f => URL.createObjectURL(f))]);
                              e.target.value = '';
                            }} />
                            <svg width="20" height="20" fill="none" stroke="#94a3b8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                          </label>
                        )}
                      </div>
                    </div>

                    <div className={styles.formGroupColumn} style={{ flex: 1, marginTop: '8px' }}>
                      <label className={styles.formLabelColumn}>상세 내용</label>
                      <textarea className={styles.contentArea} value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} placeholder="축제 상세 설명을 입력하세요." />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* --- 하단 설정 & 액션 --- */}
              <div className={styles.formBottomBar}>
                <div className={styles.settingsSection}>
                  <label className={styles.formLabel} style={{ margin: 0, paddingRight: '12px' }}>노출 여부</label>
                  <label className={styles.toggleWrapperSettings}>
                    <input type="checkbox" checked={formData.isVisible} onChange={e => setFormData({ ...formData, isVisible: e.target.checked })} style={{ display: 'none' }} />
                    <div className={`${styles.toggleSlot} ${formData.isVisible ? styles.activeSlot : ''}`}>
                      <div className={styles.toggleKnob} />
                    </div>
                    <span className={formData.isVisible ? styles.blueText : styles.grayText} style={{ marginLeft: '12px', fontWeight: 600, fontSize: '14px' }}>{formData.isVisible ? '공개' : '비공개'}</span>
                  </label>
                </div>

                <div className={styles.actionBar}>
                  <button className={styles.cancelBtn} onClick={resetForm}>취소</button>
                  <button className={styles.submitBtn} onClick={handleSubmit}>{editingId ? '수정 완료' : '등록 완료'}</button>
                </div>
              </div>
            </div>
          </div>
      )}
      {enlargedImage && (
        <div className={styles.imageViewerOverlay} onClick={() => setEnlargedImage(null)}>
          <div className={styles.imageViewerContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.imageViewerCloseBtn} onClick={() => setEnlargedImage(null)}>✕</button>
            <img src={enlargedImage} alt="크게 보기" className={styles.imageViewerImg} />
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useCallback, useEffect } from 'react';
import { useAdminList } from '@/app/admin/festivals/useAdminList';
import adminApi from '@/lib/adminApi';
import type { AdminNoticeItem, AdminNoticeListResponse } from '@/types/admin-notice';
import { useToast } from '@/_component/common/Toast';

export function useAdminNoticeList() {
  const list = useAdminList({ extraFilterKeys: ['searchType'] });
  const {
    currentPage, setCurrentPage, totalPages, setTotalPages,
    totalElements, setTotalElements,
    extraFilters, setExtraFilter,
    loading, setLoading,
    keyword, searchTerm, setSearchTerm, submitSearch
  } = list;

  const { toast } = useToast();

  const [notices, setNotices] = useState<AdminNoticeItem[]>([]);
  const [allCount, setAllCount] = useState(0);
  const [pinnedCount, setPinnedCount] = useState(0);
  const [popupCount, setPopupCount] = useState(0);
  const [pushedCount, setPushedCount] = useState(0);
  const [filterType, setFilterType] = useState<'all' | 'pinned' | 'popup' | 'pushed' | 'ACTIVE' | 'INACTIVE' | 'RESERVED' | 'ENDED'>('all');
  const [localSearchType, setLocalSearchType] = useState(extraFilters.searchType || 'ALL');

  /* ── 모달 상태 ── */
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [editTarget, setEditTarget] = useState<AdminNoticeItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminNoticeItem | null>(null);
  const [detailTarget, setDetailTarget] = useState<AdminNoticeItem | null>(null);

  /* ── 검색 리셋/실행 ── */
  const onSearchSubmit = () => {
    setExtraFilter('searchType', localSearchType);
    submitSearch();
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearchSubmit();
    }
  };

  const handleFilterChange = (type: typeof filterType) => {
    setFilterType(type);
    setCurrentPage(1);
  };

  /* ── KPI 카운트 로드 (전체 데이터 기준) ── */
  const fetchKpiCounts = useCallback(async () => {
    try {
      const [allRes, pinnedRes, popupRes, pushedRes] = await Promise.all([
        adminApi.get<{ data: AdminNoticeListResponse }>('/notices', { params: { page: 1, size: 1 } }),
        adminApi.get<{ data: AdminNoticeListResponse }>('/notices', { params: { page: 1, size: 1, isPinned: true } }),
        adminApi.get<{ data: AdminNoticeListResponse }>('/notices', { params: { page: 1, size: 1, isPopup: true } }),
        adminApi.get<{ data: AdminNoticeListResponse }>('/notices', { params: { page: 1, size: 1, isPushed: true } }),
      ]);
      setAllCount(allRes.data.data.totalElements);
      setPinnedCount(pinnedRes.data.data.totalElements);
      setPopupCount(popupRes.data.data.totalElements);
      setPushedCount(pushedRes.data.data.totalElements);
    } catch (err) {
      console.error('KPI 카운트 조회 실패:', err);
    }
  }, []);

  /* ── 데이터 로드 ── */
  const fetchNotices = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number | boolean> = {
        page: currentPage,
        size: 10,
      };
      if (keyword) params.keyword = keyword;
      if (extraFilters.searchType && extraFilters.searchType !== 'ALL') params.searchType = extraFilters.searchType;

      if (filterType === 'pinned') params.isPinned = true;
      else if (filterType === 'popup') params.isPopup = true;
      else if (filterType === 'pushed') params.isPushed = true;
      else if (filterType !== 'all') params.status = filterType;

      const { data } = await adminApi.get<{ data: AdminNoticeListResponse }>('/notices', { params });
      const result = data.data;

      setNotices(result.content);
      setTotalPages(result.totalPages || 1);
      setTotalElements(result.totalElements);
    } catch (err) {
      console.error('공지사항 목록 조회 실패:', err);
      setNotices([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, keyword, extraFilters.searchType, filterType, setLoading, setTotalPages, setTotalElements]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  /* KPI 카운트는 최초 마운트 시 + 데이터 변경(작성/수정/삭제) 시 갱신 */
  useEffect(() => {
    fetchKpiCounts();
  }, [fetchKpiCounts]);

  /* ── 삭제 처리 ── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.delete(`/notices/${deleteTarget.id}`);
      toast('공지사항이 삭제되었습니다.', 'success');
      setDeleteTarget(null);
      fetchNotices();
      fetchKpiCounts();
    } catch (err) {
      console.error('공지사항 삭제 실패:', err);
      toast('삭제 중 오류가 발생했습니다.', 'error');
    }
  };

  return {
    // 리스트 & 상태
    notices,
    loading,
    totalElements,
    currentPage,
    totalPages,
    setCurrentPage,
    
    // 메트릭 카운트
    allCount, pinnedCount, popupCount, pushedCount,
    
    // 필터링 & 검색
    filterType,
    handleFilterChange,
    localSearchType,
    setLocalSearchType,
    searchTerm,
    setSearchTerm,
    onSearchSubmit,
    handleSearchKeyDown,

    // 모달 관리
    formMode, setFormMode,
    editTarget, setEditTarget,
    deleteTarget, setDeleteTarget,
    detailTarget, setDetailTarget,
    
    // 액션
    fetchNotices,
    fetchKpiCounts,
    handleDelete
  };
}

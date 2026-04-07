import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { Notice, NoticePage } from '@/types/notice';

export function useNoticeList() {
  const searchParams = useSearchParams();

  const [notices, setNotices] = useState<Notice[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  const currentPage = Number(searchParams.get('page') || '1');
  const currentKeyword = searchParams.get('keyword') || '';
  const currentSearchType = searchParams.get('searchType') || 'all';
  const currentSort = searchParams.get('sort') || 'latest';

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', String(currentPage));
      params.append('size', '10');
      if (currentKeyword) {
        params.append('keyword', currentKeyword);
        params.append('searchType', currentSearchType);
      }

      const res = await api.get(`/api/notices?${params.toString()}`);
      if (res.data?.success) {
        const pageData: NoticePage = res.data.data;
        setNotices(pageData.content);
        setTotalPages(pageData.totalPages);
        setTotalElements(pageData.totalElements);
      }
    } catch (error) {
      console.error('공지사항 목록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentKeyword, currentSearchType]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  return {
    notices, totalPages, totalElements, loading,
    currentPage, currentSort
  };
}

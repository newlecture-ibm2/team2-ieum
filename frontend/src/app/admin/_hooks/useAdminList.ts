/**
 * 관리자 목록 페이지 공통 hook
 *
 * URL searchParams 동기화, 페이징, 필터, 검색어, 로딩 상태를 한데 관리.
 * report / notice / inquiry 등 admin 목록 페이지에서 동일하게 사용 가능.
 *
 * 사용법:
 *   const list = useAdminList({ defaultSize: 10 });
 *   // list.currentPage, list.keyword, list.statusFilter, ...
 *   // list.setStatusFilter('ongoing');  → URL 동기화 + page=1 자동 리셋
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface UseAdminListOptions {
  /** 추가 URL 파라미터 키 목록 (예: ['categoryCode', 'areaCode', 'excludeHidden']) */
  extraFilterKeys?: string[];
}

interface UseAdminListReturn {
  // 페이징
  currentPage: number;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  totalPages: number;
  setTotalPages: (pages: number) => void;
  totalElements: number;
  setTotalElements: (count: number) => void;

  // 검색
  searchTerm: string;        // 입력 중인 값
  setSearchTerm: (v: string) => void;
  keyword: string;           // 확정된 검색어
  submitSearch: () => void;  // 검색 실행 (Enter/버튼)
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;

  // 상태 필터
  statusFilter: string;
  setStatusFilterAndReset: (status: string) => void;

  // 추가 필터
  extraFilters: Record<string, string>;
  setExtraFilter: (key: string, value: string) => void;

  // 로딩
  loading: boolean;
  setLoading: (v: boolean) => void;
}

export function useAdminList(options: UseAdminListOptions = {}): UseAdminListReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { extraFilterKeys = [] } = options;

  // URL에서 초기값 읽기
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  const initialKeyword = searchParams.get('keyword') || '';
  const initialStatus = searchParams.get('status') || '';
  const initialExtraFilters: Record<string, string> = {};
  extraFilterKeys.forEach(key => {
    initialExtraFilters[key] = searchParams.get(key) || '';
  });

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [keyword, setKeyword] = useState(initialKeyword);
  const [searchTerm, setSearchTerm] = useState(initialKeyword);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [extraFilters, setExtraFilters] = useState<Record<string, string>>(initialExtraFilters);
  const [loading, setLoading] = useState(true);

  const [totalElements, setTotalElements] = useState(0);

  // URL 동기화
  useEffect(() => {
    const params = new URLSearchParams();
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (keyword) params.set('keyword', keyword);
    if (statusFilter) params.set('status', statusFilter);
    Object.entries(extraFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [currentPage, keyword, statusFilter, extraFilters, pathname, router]);

  const submitSearch = useCallback(() => {
    setKeyword(searchTerm);
    setCurrentPage(1);
  }, [searchTerm]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { setKeyword(searchTerm); setCurrentPage(1); }
  }, [searchTerm]);

  const setStatusFilterAndReset = useCallback((status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  }, []);

  const setExtraFilter = useCallback((key: string, value: string) => {
    setExtraFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  return {
    currentPage, setCurrentPage, totalPages, setTotalPages, totalElements, setTotalElements,
    searchTerm, setSearchTerm, keyword, submitSearch, handleKeyDown,
    statusFilter, setStatusFilterAndReset,
    extraFilters, setExtraFilter,
    loading, setLoading,
  };
}

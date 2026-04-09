'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/_component/common/Toast';
import { ActivityType, MyActivity } from '@/types/mypage';

interface UseMyPageActivityReturn {
  items: MyActivity[];
  setItems: React.Dispatch<React.SetStateAction<MyActivity[]>>;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

/**
 * 마이페이지 활동 내역(게시글, 리뷰, 댓글 등) 데이터 조회 및 관리를 위한 커스텀 훅
 * @param type 활동 유형 (posts, reviews, comments, inquiries, reports)
 * @param size 한 페이지당 불러올 아이템 개수 (기본값: 6)
 */
export function useMyPageActivity(type: ActivityType, size = 6): UseMyPageActivityReturn {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  // URL에서 현재 페이지 읽기 (1-based)
  const currentPage = Number(searchParams.get('page')) || 1;

  const [items, setItems] = useState<MyActivity[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * 데이터 조회 함수
   */
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      // 백엔드는 0-based 페이지를 사용하므로 currentPage - 1
      const res = await fetch(
        `/api/users/me/activities?type=${type}&page=${currentPage - 1}&size=${size}`,
        { cache: 'no-store' }
      );
      const data = await res.json();

      if (data.success && data.data) {
        setItems(data.data.activities || []);
        setTotalPages(data.data.totalPages || 1);
        setTotalElements(Number(data.data.totalElements) || 0);
      } else if (!data.success) {
        toast(data.message || '데이터를 불러오는데 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error(`Failed to fetch my ${type}:`, error);
      toast('서버와의 통신 도중 오류가 발생했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [type, currentPage, size, toast]);

  // 페이지나 타입이 변할 때마다 데이터 다시 불러오기
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    items,
    setItems,
    currentPage,
    totalPages,
    totalElements,
    isLoading,
    refetch: fetchData
  };
}

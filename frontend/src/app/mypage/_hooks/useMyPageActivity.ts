'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/_component/common/Toast';
import api from '@/lib/api';
import { ActivityType, MyActivity, ApiResponse } from '@/types/mypage';

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
 * 🚀 마이페이지 활동 내역 데이터 조회용 커스텀 훅 (표준화 버전)
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
   * 데이터 조회 함수 (api 유틸리티 적용)
   */
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const res = await api.get<ApiResponse<{
        activities: MyActivity[];
        totalPages: number;
        totalElements: number;
      }>>(`/api/mypage/activities`, {
        params: {
          type,
          page: currentPage - 1,
          size
        }
      });

      const result = res.data;

      if (result.success && result.data) {
        setItems(result.data.activities || []);
        setTotalPages(result.data.totalPages || 1);
        setTotalElements(Number(result.data.totalElements) || 0);
      } else {
        toast(result.message || '데이터를 불러오는데 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error(`Failed to fetch my ${type}:`, error);
      // 에러 처리는 api interceptor에서 공통 처리되지만, 로컬 알림이 필요한 경우 추가 가능
    } finally {
      setIsLoading(false);
    }
  }, [type, currentPage, size, toast]);

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

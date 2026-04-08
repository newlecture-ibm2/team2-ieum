/**
 * 축제 지역/카테고리 옵션 조회 hook
 * 공공축제, 축제등록 두 페이지에서 공용
 */

'use client';

import { useState, useEffect } from 'react';
import type { ApiResponse, RegionOptionDto, CategoryOptionDto } from '@/types/admin-festival';
import adminApi from '@/lib/adminApi';

interface UseFestivalOptionsReturn {
  regionOptions: RegionOptionDto[];
  categoryOptions: CategoryOptionDto[];
  refreshRegionOptions: () => Promise<void>;
}

export function useFestivalOptions(): UseFestivalOptionsReturn {
  const [regionOptions, setRegionOptions] = useState<RegionOptionDto[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOptionDto[]>([]);

  const fetchRegions = async () => {
    try {
      const res = await adminApi.get<ApiResponse<RegionOptionDto[]>>('/festivals/regions/options');
      if (res.data.success && res.data.data) setRegionOptions(res.data.data);
    } catch { /* 옵션 조회 실패는 무시 */ }
  };

  const fetchCategories = async () => {
    try {
      const res = await adminApi.get<ApiResponse<CategoryOptionDto[]>>('/festivals/categories/options');
      if (res.data.success && res.data.data) {
        // 코드(value) 기준으로 정렬하여 부모-자식 카테고리가 인접하게 위치하도록 함
        const sorted = res.data.data.sort((a, b) => a.value.localeCompare(b.value));
        
        // 시각적 계층화 (들여쓰기 및 말머리 기호)
        const formatted = sorted.map(o => {
          if (o.type === 'STANDARD') {
            const parts = o.label.split(' > ');
            if (parts.length === 1) {
              return { ...o, label: `[${parts[0]}] 전체` };
            } else {
              // 유니코드 공백(\u00A0)을 사용해 모던한 들여쓰기(-) 처리
              return { ...o, label: `\u00A0\u00A0\u00A0\u00A0- ${parts[1]}` };
            }
          }
          return o;
        });
        
        setCategoryOptions(formatted);
      }
    } catch { /* 옵션 조회 실패는 무시 */ }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRegions();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategories();
  }, []);

  return {
    regionOptions,
    categoryOptions,
    refreshRegionOptions: fetchRegions,
  };
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

export interface Post {
  id: number;
  category: string;
  title: string;
  content: string;
  areaCode: string;
  festivalId?: string;
  festivalName?: string;
  authorId: number;
  authorName: string;
  viewCount: number;
  likeCount?: number;
  commentCount?: number;
  createdAt: string;
  updatedAt: string;
  thumbnailId?: number;
}

interface UsePostsOptions {
  category?: string;
  areaCode?: string;
  keyword?: string;
  sort?: string;
  page?: number;    // 1-indexed (URL 기준)
  size?: number;
}

export function usePosts(options: UsePostsOptions = {}) {
  const { category, areaCode, keyword, sort = 'latest', page = 1, size = 10 } = options;
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (areaCode) params.set('areaCode', areaCode);
      if (keyword) params.set('keyword', keyword);
      params.set('sort', sort);
      params.set('page', (page - 1).toString()); // 백엔드는 0-indexed
      params.set('size', size.toString());

      const res = await api.get(`/api/community/posts?${params.toString()}`);

      if (res.data && res.data.success && res.data.data) {
        const newPosts: Post[] = res.data.data.content || [];
        
        // 썸네일(첫 번째 첨부파일) 정보 추가 병렬 조회
        const postsWithThumbnails = await Promise.all(
          newPosts.map(async (p) => {
            try {
              const attachRes = await api.get(`/api/attachments?targetType=POST&targetId=${p.id}`);
              if (attachRes.data?.data && attachRes.data.data.length > 0) {
                return { ...p, thumbnailId: attachRes.data.data[0].id };
              }
            } catch (ignored) {}
            return p;
          })
        );

        setPosts(postsWithThumbnails);
        setTotalPages(res.data.data.totalPages || 1);
      }
    } catch (err) {
      setError('게시글을 불러오는 데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [category, areaCode, keyword, sort, page, size]);

  // 필터/검색/페이지 변경 시 데이터 재조회
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, loading, error, totalPages };
}

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/api';

export interface Post {
  id: number;
  category: string;
  title: string;
  content: string;
  areaCode: string;
  authorId: number;
  authorName: string;
  viewCount: number;
  likeCount?: number;
  commentCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface UsePostsOptions {
  category?: string;
  areaCode?: string;
  keyword?: string;
  sort?: string;
  size?: number;
}

export function usePosts(options: UsePostsOptions = {}) {
  const { category, areaCode, keyword, sort = 'latest', size = 10 } = options;
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const fetchPosts = useCallback(async (pageNum: number, reset = false) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (areaCode) params.set('areaCode', areaCode);
      if (keyword) params.set('keyword', keyword);
      params.set('sort', sort);
      params.set('page', pageNum.toString());
      params.set('size', size.toString());

      const res = await api.get(`/api/community/posts?${params.toString()}`);

      if (res.data && res.data.success && res.data.data) {
        const newPosts: Post[] = res.data.data.content || [];
        setPosts(prev => reset ? newPosts : [...prev, ...newPosts]);
        setHasMore(!res.data.data.last);
        setPage(pageNum);
      }
    } catch (err) {
      setError('게시글을 불러오는 데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [category, areaCode, keyword, sort, size]);

  // 필터/검색 조건 변경 시 리셋
  useEffect(() => {
    setPosts([]);
    setPage(0);
    setHasMore(true);
    fetchPosts(0, true);
  }, [fetchPosts]);

  // 무한 스크롤용 ref 콜백
  const lastPostRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchPosts(page + 1);
      }
    });

    if (node) observerRef.current.observe(node);
  }, [loading, hasMore, page, fetchPosts]);

  return { posts, loading, error, hasMore, lastPostRef };
}

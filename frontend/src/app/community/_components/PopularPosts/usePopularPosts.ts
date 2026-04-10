'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import type { Post } from '../PostCard/usePosts';

export function usePopularPosts() {
  const [popularPosts, setPopularPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPopular = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/community/posts?sort=popular&size=3&page=0');

      if (res.data && res.data.success && res.data.data) {
        setPopularPosts(res.data.data.content || []);
      }
    } catch (err) {
      console.error('인기 게시글 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPopular();
  }, [fetchPopular]);

  return { popularPosts, loading };
}

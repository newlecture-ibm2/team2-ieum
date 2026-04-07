import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

export interface PostDetail {
  id: number;
  category: string;
  title: string;
  content: string;
  areaCode: string;
  authorId: number;
  authorName: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: number;
  postId: number;
  userId: number;
  userName: string;
  parentId: number | null;
  content: string;
  createdAt: string;
  children?: Comment[];
}

export function usePostDetail(postId: string) {
  const [post, setPost] = useState<PostDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDetail = useCallback(async () => {
    if (!postId) return;
    try {
      setLoading(true);
      const [postRes, commentRes] = await Promise.all([
        api.get(`/api/community/posts/${postId}`),
        api.get(`/api/community/posts/${postId}/comments`)
      ]);

      if (postRes.data.success) {
        setPost(postRes.data.data);
      } else {
        setError('게시글을 불러올 수 없습니다.');
      }

      if (commentRes.data.success) {
        setComments(commentRes.data.data);
      }
    } catch (err) {
      console.error(err);
      setError('게시글 로드 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return { post, comments, loading, error, fetchDetail };
}

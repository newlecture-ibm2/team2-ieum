import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/api';

export interface PostDetail {
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
  likeCount: number;
  isLiked: boolean;
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
  status: string;
  createdAt: string;
  children?: Comment[];
}

export interface Attachment {
  id: number;
  fileName?: string;
  fileSize?: number;
  [key: string]: unknown;
}

export function usePostDetail(postId: string, enabled: boolean = true) {
  const [post, setPost] = useState<PostDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDetail = useCallback(async (silent = false, fetchType: 'all' | 'comments' = 'all') => {
    if (!postId) return;
    try {
      if (!silent) setLoading(true);

      if (fetchType === 'all') {
        const [postRes, commentRes, attachRes] = await Promise.all([
          api.get(`/api/community/posts/${postId}`),
          api.get(`/api/community/posts/${postId}/comments`),
          api.get(`/api/attachments?targetType=POST&targetId=${postId}`).catch(() => ({ data: { data: [] } }))
        ]);

        if (postRes.data.success) {
          setPost(postRes.data.data);
        } else {
          setError('게시글을 불러올 수 없습니다.');
        }

        if (commentRes.data.success) {
          setComments(commentRes.data.data);
        }

        setAttachments(attachRes.data?.data || []);
      } else if (fetchType === 'comments') {
        // 댓글 관련 작업 시 댓글 API만 호출하여 이미지 재렌더링 방지
        const commentRes = await api.get(`/api/community/posts/${postId}/comments`);
        if (commentRes.data.success) {
          setComments(commentRes.data.data);
        }
      }
    } catch (err) {
      console.error(err);
      setError('게시글 로드 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const initialized = useRef(false);

  useEffect(() => {
    if (enabled && !initialized.current) {
      initialized.current = true;
      fetchDetail();
    }
  }, [enabled, fetchDetail]);

  return { post, setPost, comments, loading, error, fetchDetail, attachments };
}

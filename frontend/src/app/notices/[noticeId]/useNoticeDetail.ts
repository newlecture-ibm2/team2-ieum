import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Notice } from '@/types/notice';

export interface NavNotice {
  id: number;
  title: string;
}

export interface Attachment {
  id: number;
  fileName: string;
  filePath: string;
  fileSize: number;
  contentType: string;
}

export function useNoticeDetail(noticeId: string) {
  const [notice, setNotice] = useState<Notice | null>(null);
  const [prevNotice, setPrevNotice] = useState<NavNotice | null>(null);
  const [nextNotice, setNextNotice] = useState<NavNotice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await api.get(`/api/notices/${noticeId}`);
        if (res.data?.success) {
          const data = res.data.data;
          setNotice(data.notice || data);
          setPrevNotice(data.prevNotice || null);
          setNextNotice(data.nextNotice || null);
        }
      } catch (err) {
        console.error('공지사항 상세 조회 실패:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    const fetchAttachments = async () => {
      try {
        const res = await api.get('/api/attachments', {
          params: { targetType: 'NOTICE', targetId: noticeId },
        });
        if (res.data?.data) setAttachments(res.data.data);
      } catch (err) {
        console.error('첨부파일 조회 실패:', err);
      }
    };

    if (noticeId) {
      fetchDetail();
      fetchAttachments();
    }
  }, [noticeId]);

  return {
    notice,
    prevNotice,
    nextNotice,
    attachments,
    loading,
    error,
  };
}

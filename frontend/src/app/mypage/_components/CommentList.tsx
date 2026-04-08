"use client";

import React, { useState, useEffect } from 'react';
import { MessageSquare, ExternalLink, Trash2 } from 'lucide-react';
import styles from '../mypage.module.css';

interface Comment {
  id: string;
  postTitle: string;
  content: string;
  createdAt: string;
  postId: string;
}

export default function CommentList() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 설계서상 API: GET /api/users/me/comments
    const fetchComments = async () => {
      try {
        const res = await fetch('/api/users/me/activities/?type=comments');
        const data = await res.json();
        
        if (data.success && data.data) {
          setComments(data.data.activities || []);
        }
      } catch (error) {
        console.error('Failed to fetch comments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('정말 댓글을 삭제하시겠습니까?')) {
      setComments(comments.filter(c => c.id !== id));
    }
  };

  if (isLoading) return <div className={styles.loading}>불러오는 중...</div>;

  return (
    <div className={styles.listContainer}>
      {comments.length === 0 ? (
        <div className={styles.emptyState}>
          <MessageSquare size={48} />
          <p>작성한 댓글이 없습니다. 커뮤니티에서 소통을 시작해보세요!</p>
        </div>
      ) : (
        comments.map((comment) => (
          <div key={comment.id} className={styles.dataCard}>
            <div className={styles.cardHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-primary-500)', fontWeight: 700 }}>원문: {comment.postTitle}</span>
              </div>
              <span className={styles.cardDate}>{comment.createdAt}</span>
            </div>
            
            <p className={styles.cardBody} style={{ marginBottom: '16px' }}>
              {comment.content}
            </p>

            <div className={styles.cardActions}>
              <button 
                className={styles.btnAction}
                style={{ border: '1px solid #e2e8f0', background: '#fff' }}
                onClick={() => alert('해당 게시글로 이동합니다.')}
              >
                <ExternalLink size={14} style={{ marginRight: 4 }} /> 원문 보기
              </button>
              <button 
                className={`${styles.btnAction} ${styles.btnDelete}`}
                onClick={() => handleDelete(comment.id)}
              >
                <Trash2 size={14} style={{ marginRight: 4 }} /> 삭제
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

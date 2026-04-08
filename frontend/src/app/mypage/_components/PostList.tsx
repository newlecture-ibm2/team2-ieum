"use client";

import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, FileText } from 'lucide-react';
import styles from '../mypage.module.css';

interface Post {
  id: number;
  title: string;
  content: string;
  category: string;
  createdAt: string;
}

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 설계서상 API: GET /api/users/me/posts
    const fetchPosts = async () => {
      try {
        const res = await fetch(`/api/users/me/activities/?type=posts&_t=${Date.now()}`, { cache: 'no-store' });
        const data = await res.json();
        
        if (data.success && data.data) {
          setPosts(data.data.activities || []);
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleDelete = (id: number) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      setPosts(posts.filter(p => p.id !== id));
    }
  };

  if (isLoading) return <div className={styles.loading}>불러오는 중...</div>;

  return (
    <div className={styles.listSection}>
      <div className={styles.listHeader} style={{ marginBottom: '16px', fontSize: '0.9rem', color: '#64748b' }}>
        총 <strong>{posts.length}</strong>개의 게시물을 작성했습니다.
      </div>

      <div className={styles.listContainer}>
        {posts.length === 0 ? (
          <div className={styles.emptyState}>
            <FileText size={48} />
            <p>아직 작성한 게시글이 없어요. 첫 글을 작성해보세요!</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className={styles.dataCard}>
              <div className={styles.cardHeader}>
                <h4 className={styles.cardTitle}>{post.title}</h4>
                <span className={styles.cardDate}>{post.createdAt}</span>
              </div>
              <p className={styles.cardBody}>{post.content}</p>
              <div className={styles.cardActions}>
                <button className={`${styles.btnAction} ${styles.btnEdit}`}>
                  <Edit2 size={14} style={{ marginRight: 4 }} /> 수정
                </button>
                <button 
                  className={`${styles.btnAction} ${styles.btnDelete}`}
                  onClick={() => handleDelete(post.id)}
                >
                  <Trash2 size={14} style={{ marginRight: 4 }} /> 삭제
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

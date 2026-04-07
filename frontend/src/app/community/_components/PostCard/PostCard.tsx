'use client';

import styles from './PostCard.module.css';
import { Heart, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import type { Post } from './usePosts';

interface PostCardProps {
  post: Post;
}

const CATEGORY_MAP: Record<string, { label: string; className: string }> = {
  qna: { label: 'Q&A', className: 'catQna' },
  tip: { label: '축제꿀팁', className: 'catTip' },
  review: { label: '먹거리 리뷰', className: 'catFood' },
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;
  return new Date(dateStr).toLocaleDateString('ko-KR');
}

export default function PostCard({ post }: PostCardProps) {
  const cat = CATEGORY_MAP[post.category?.toLowerCase()] || { label: post.category, className: '' };

  return (
    <Link href={`/community/${post.id}`} className={styles.item}>
      <div className={styles.info}>
        <span className={`${styles.category} ${styles[cat.className] || ''}`}>
          {cat.label}
        </span>
        <div className={styles.title}>{post.title}</div>
        <div className={styles.desc}>{post.content}</div>
        <div className={styles.meta}>
          <span>{timeAgo(post.createdAt)}</span>
          <span>·</span>
          <span>{post.authorName}</span>
          <div className={styles.metaRight}>
            <div className={styles.metaItem}>
              <Heart size={13} />
              {post.likeCount ?? 0}
            </div>
            <div className={styles.metaItem}>
              <MessageCircle size={13} />
              {post.commentCount ?? 0}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

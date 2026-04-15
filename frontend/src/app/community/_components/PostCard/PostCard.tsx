'use client';

import styles from './PostCard.module.css';
import { Heart, MessageCircle, Eye } from 'lucide-react';
import Link from 'next/link';
import type { Post } from './usePosts';

interface PostCardProps {
  post: Post;
  keyword?: string;
}

// Highlight matching keyword in text
function HighlightText({ text, keyword }: { text: string; keyword?: string }) {
  if (!keyword || !keyword.trim()) return <>{text}</>;
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === keyword.toLowerCase() ? (
          <mark key={i} className={styles.highlight}>{part}</mark>
        ) : (
          part
        )
      )}
    </>
  );
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

export default function PostCard({ post, keyword }: PostCardProps) {
  const cat = CATEGORY_MAP[post.category?.toLowerCase()] || { label: post.category, className: '' };

  let thumbnailUrl = null;
  if (post.thumbnailId) {
    thumbnailUrl = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/attachments/${post.thumbnailId}/download`;
  } else if (post.content && post.content.includes('<img')) {
    const match = post.content.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match) {
      thumbnailUrl = match[1];
    }
  }

  const plainTextContent = (post.content || '')
    .replace(/<[^>]*>?/gm, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');

  return (
    <Link href={`/community/${post.id}`} className={styles.item}>
      {thumbnailUrl && (
        <div className={styles.thumbnailWrap}>
          <img 
            src={thumbnailUrl} 
            alt="게시글 이미지" 
            className={styles.thumbnailImg} 
          />
        </div>
      )}
      
      <div className={styles.info}>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span className={`${styles.category} ${styles[cat.className] || ''}`}>
            {cat.label}
          </span>
          {post.festivalName && (
            <span style={{ fontSize: '11px', color: 'var(--ieum-primary)', background: '#F3E8FF', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
              🎉 {post.festivalName}
            </span>
          )}
        </div>
        <div className={styles.title}><HighlightText text={post.title} keyword={keyword} /></div>
        <div className={styles.desc}><HighlightText text={plainTextContent} keyword={keyword} /></div>
        <div className={styles.meta}>
          <span>{timeAgo(post.createdAt)}</span>
          <span>·</span>
          <span>{post.authorName}</span>
          <div className={styles.metaRight}>
            <div className={styles.metaItem}>
              <Eye size={14} />
              {post.viewCount ?? 0}
            </div>
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

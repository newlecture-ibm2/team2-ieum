'use client';

import styles from './PopularPosts.module.css';
import { Star } from 'lucide-react';
import Link from 'next/link';
import type { Post } from '../PostCard/usePosts';

interface PopularPostsProps {
  posts: Post[];
}

const CATEGORY_PREFIX: Record<string, string> = {
  qna: 'Q&A',
  tip: '축제꿀팁',
  review: '먹거리 리뷰',
};

export default function PopularPosts({ posts }: PopularPostsProps) {
  if (!posts || posts.length === 0) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Star size={14} className={styles.starIcon} />
        <span>실시간 인기글 Top 3</span>
      </div>
      <div className={styles.list}>
        {posts.slice(0, 3).map((post, idx) => (
          <Link
            key={post.id}
            href={`/community/${post.id}`}
            className={styles.item}
          >
            <span className={`${styles.rank} ${styles[`rank${idx + 1}`]}`}>
              {idx + 1}
            </span>
            <span className={styles.text}>
              [{CATEGORY_PREFIX[post.category?.toLowerCase()] || post.category}] {post.title}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Pencil } from 'lucide-react';
import Link from 'next/link';
import styles from './community.module.css';
import SearchFilter from '@/_component/common/SearchFilter';
import PopularPosts from './_components/PopularPosts/PopularPosts';
import PostCard from './_components/PostCard/PostCard';
import { usePosts } from './_components/PostCard/usePosts';
import { usePopularPosts } from './_components/PopularPosts/usePopularPosts';

export default function CommunityPage() {
  return (
    <Suspense fallback={<div className={styles.loadingWrap}>로딩 중...</div>}>
      <CommunityContent />
    </Suspense>
  );
}

function CommunityContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || '';
  const areaCode = searchParams.get('areaCode') || '';
  const keyword = searchParams.get('keyword') || '';
  const sort = searchParams.get('sort') || 'latest';

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => setIsLoggedIn(data.isLoggedIn))
      .catch(() => {});
  }, []);

  const { posts, loading, hasMore, lastPostRef } = usePosts({
    category: category || undefined,
    areaCode: areaCode || undefined,
    keyword: keyword || undefined,
    sort,
  });

  const { popularPosts } = usePopularPosts();

  return (
    <main className={styles.mainContainer}>
      {/* 히어로 배너 */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>커뮤니티</h1>
          <p className={styles.heroSub}>
            다양한 축제 정보를 나누고 질문해보세요! 💬
          </p>
        </div>
      </section>

      {/* 검색/필터 + 콘텐츠 */}
      <section className={styles.contentSection}>
        <SearchFilter variant="with-filter" filterType="community" />

        {/* 🔥 인기 게시글 Top 3 */}
        <PopularPosts posts={popularPosts} />

        {/* 게시글 리스트 (무한 스크롤) */}
        <div className={styles.postList}>
          {posts.length === 0 && !loading && (
            <div className={styles.emptyState}>
              <p>📝</p>
              <p>아직 게시글이 없습니다. 첫 번째 글을 작성해 보세요!</p>
            </div>
          )}

          {posts.map((post, idx) => {
            if (idx === posts.length - 1) {
              return (
                <div ref={lastPostRef} key={post.id}>
                  <PostCard post={post} />
                </div>
              );
            }
            return <PostCard key={post.id} post={post} />;
          })}

          {loading && (
            <div className={styles.loadingWrap}>게시글을 불러오는 중...</div>
          )}
        </div>
      </section>

      {/* 글쓰기 FAB — 로그인 사용자만 노출 */}
      {isLoggedIn && (
        <Link href="/community/write" className={styles.fab} title="글쓰기">
          <Pencil size={22} />
        </Link>
      )}
    </main>
  );
}

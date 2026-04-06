'use client';

import { Calendar, Eye, User, FileWarning } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Notice } from '@/types/notice';
import styles from './page.module.css';

interface NavNotice {
  id: number;
  title: string;
}

export default function NoticeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const noticeId = params.noticeId as string;

  const [notice, setNotice] = useState<Notice | null>(null);
  const [prevNotice, setPrevNotice] = useState<NavNotice | null>(null);
  const [nextNotice, setNextNotice] = useState<NavNotice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
    if (noticeId) fetchDetail();
  }, [noticeId]);

  const formatDate = (dt: string) => {
    if (!dt) return '-';
    return dt.substring(0, 10).replace(/-/g, '.');
  };

  if (loading) {
    return <main className={styles.container}><div className={styles.loadingState}>불러오는 중...</div></main>;
  }

  if (error || !notice) {
    return (
      <main className={styles.container}>
        <div className={styles.errorState}>
          <FileWarning size={40} />
          <h3>공지사항을 찾을 수 없습니다</h3>
          <p>삭제되었거나 존재하지 않는 공지사항입니다.</p>
          <div className={styles.backBtnWrap} style={{ marginTop: 20 }}>
            <button className={styles.backBtn} onClick={() => router.push('/notices')}>목록으로</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <div className={styles.breadcrumb}>
        <Link href="/notices">공지사항</Link>
        <span>&gt;</span>
        <span>상세</span>
      </div>

      <div className={styles.detailHeader}>
        <h1 className={styles.detailTitle}>
          {notice.isPinned && <span className={styles.pinIcon}>📌</span>}
          {notice.title}
        </h1>
        <div className={styles.detailMeta}>
          <span><Calendar size={14} /> {formatDate(notice.createdAt)}</span>
          <span><Eye size={14} /> 조회수 {notice.viewCount?.toLocaleString()}</span>
          <span><User size={14} /> 관리자</span>
        </div>
      </div>

      <div className={styles.detailBody} dangerouslySetInnerHTML={{ __html: notice.content }} />

      <div className={styles.detailNav}>
        {prevNotice ? (
          <button className={styles.navLink} onClick={() => router.push(`/notices/${prevNotice.id}`)}>
            ◀ 이전글: {prevNotice.title}
          </button>
        ) : (
          <span className={`${styles.navLink} ${styles.navDisabled}`}>◀ 이전글 없음</span>
        )}
        {nextNotice ? (
          <button className={styles.navLink} onClick={() => router.push(`/notices/${nextNotice.id}`)}>
            다음글: {nextNotice.title} ▶
          </button>
        ) : (
          <span className={`${styles.navLink} ${styles.navDisabled}`}>다음글 없음 ▶</span>
        )}
      </div>

      <div className={styles.backBtnWrap}>
        <button className={styles.backBtn} onClick={() => router.push('/notices')}>목록으로</button>
      </div>
    </main>
  );
}

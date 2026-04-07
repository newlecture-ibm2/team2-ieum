import { Suspense } from 'react';
import { Megaphone } from 'lucide-react';
import NoticeListContent from './_components/NoticeList';
import styles from './page.module.css';

/**
 * 유저 공지사항 페이지 (Server Component)
 * 라우트: /notices
 */
export default function NoticesPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>
        <Megaphone size={22} />
        공지사항
      </h1>

      <Suspense>
        <NoticeListContent />
      </Suspense>
    </div>
  );
}

import { Suspense } from 'react';
import MyPageContent from './_components/MyPageContent';
import styles from './mypage.module.css';

export const metadata = {
  title: '마이페이지 - 이음(IEUM)',
  description: '회원 정보를 관리하고 활동 내역을 확인하세요.',
};

export default function MyPage() {
  return (
    <main className={styles.container}>
      <Suspense fallback={<div className={styles.loading}>정보를 불러오는 중...</div>}>
        <MyPageContent />
      </Suspense>
    </main>
  );
}

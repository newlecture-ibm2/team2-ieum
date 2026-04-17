'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Map } from 'lucide-react';
import { FESTIVAL_STATUS_TABS } from '@/constants/filterOptions';
import styles from './HeroBanner.module.css';

interface HeroBannerProps {
  currentTab: string;
}

// 고정된 메인 슬라이드 (프로젝트의 핵심 정체성)
const FIXED_BANNER = {
  id: 'fixed-1',
  title: '이음(IEUM) : 축제의 모든 순간에 함께',
  subtitle: '전국에 숨겨진 다채로운 지역 축제들을 한곳에서 빠르게 만나보세요 ✨',
  image: '/images/hero_option_b.png',
};

export default function HeroBanner({ currentTab }: HeroBannerProps) {
  const TABS = FESTIVAL_STATUS_TABS;
  const searchParams = useSearchParams();

  /** 탭 전환 시 기존 검색/필터/정렬 파라미터를 유지한 URL 생성 */
  const buildTabHref = (tabValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    // 탭(status) 변경
    if (tabValue === 'all') {
      params.delete('status');
    } else {
      params.set('status', tabValue);
    }
    // 페이지 초기화
    params.delete('page');
    const qs = params.toString();
    return qs ? `/?${qs}` : '/';
  };

  return (
    <section className={styles.heroSection}>
      {/* Background Image */}
      <div
        className={`${styles.slide} ${styles.active}`}
        style={{ backgroundImage: `url(${FIXED_BANNER.image})` }}
      >
        <div className={styles.overlay} />
      </div>

      {/* Content Overlay */}
      <div className={styles.contentWrap}>
        <div className={styles.textContent}>
          <h2 className={styles.title}>{FIXED_BANNER.title}</h2>
          <p className={styles.subtitle}>{FIXED_BANNER.subtitle}</p>
        </div>

        {/* Navigation Tabs (As defined in blueprint) */}
        <div className={styles.tabsContainer}>
          <div className={styles.tabsRow}>
            <div className={styles.pills}>
              {TABS.map(tab => (
                <Link
                  key={tab.value}
                  href={buildTabHref(tab.value)}
                  className={`${styles.pill} ${currentTab === tab.value ? styles.activePill : ''}`}
                >
                  {tab.label}
                </Link>
              ))}
            </div>

            <Link href="/festivals/map" className={styles.mapBtn}>
              <Map size={14} /> 지도 뷰로 보기
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

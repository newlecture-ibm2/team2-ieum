'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Map, ArrowRight } from 'lucide-react';
import { FESTIVAL_STATUS_TABS } from '@/constants/filterOptions';
import styles from './HeroBanner.module.css';

interface HeroBannerProps {
  currentTab: string;
}

const BANNERS = [
  {
    id: 1,
    title: '전국 추천 축제',
    subtitle: '밤하늘을 수놓는 화려한 여름 바다 불꽃놀이의 향연 🎆',
    image: '/images/hero_summer.png',
  },
  {
    id: 2,
    title: '따뜻한 봄의 시작',
    subtitle: '여의도 윤중로에서 만나는 로맨틱한 벚꽃 축제 🌸',
    image: '/images/hero_spring.png',
  }
];

export default function HeroBanner({ currentTab }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto carousel effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BANNERS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const TABS = FESTIVAL_STATUS_TABS;

  return (
    <section className={styles.heroSection}>
      {/* Background Slides */}
      {BANNERS.map((banner, idx) => (
        <div
          key={banner.id}
          className={`${styles.slide} ${idx === currentIndex ? styles.active : ''}`}
          style={{ backgroundImage: `url(${banner.image})` }}
        >
          <div className={styles.overlay} />
        </div>
      ))}

      {/* Content Overlay */}
      <div className={styles.contentWrap}>
        <div className={styles.textContent}>
          <span className={styles.badge}>이번 주 추천</span>
          <h2 className={styles.title}>{BANNERS[currentIndex].title}</h2>
          <p className={styles.subtitle}>{BANNERS[currentIndex].subtitle}</p>
          <button className={styles.ctaButton}>
            자세히 보기 <ArrowRight size={16} />
          </button>
        </div>

        {/* Navigation Tabs (As defined in blueprint) */}
        <div className={styles.tabsContainer}>
          <div className={styles.tabsRow}>
            <div className={styles.pills}>
              {TABS.map(tab => (
                <Link
                  key={tab.value}
                  href={tab.value === 'all' ? '/' : `/?status=${tab.value}`}
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

      {/* Dots Indicator */}
      <div className={styles.dots}>
        {BANNERS.map((_, idx) => (
          <button
            key={idx}
            className={`${styles.dot} ${idx === currentIndex ? styles.activeDot : ''}`}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

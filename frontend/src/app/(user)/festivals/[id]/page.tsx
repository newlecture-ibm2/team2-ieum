'use client';

import { useState, use } from 'react';
import { Heart } from 'lucide-react';
import Image from 'next/image';
import styles from './FestivalDetail.module.css';

// 임시 더미 데이터 (아직 백엔드에 /api/festivals/[id] API가 없을 것으로 예상됨)
const DUMMY_FESTIVAL = {
  id: 'dummy-1',
  title: '서울 벚꽃 축제 2026',
  badge: '진행중',
  dateString: '2026.04.01 ~ 04.10',
  location: '서울특별시 영등포구',
  address: '서울특별시 영등포구\n여의서로 일대',
  phone: '02-238-7763',
  fee: '무료',
  description: '여의도 봄꽃축제는 매년 봄, 벚꽃이 만개할 때 열리는 서울의 대표적인 축제입니다. 탁 트인 한강을 배경으로 펼쳐지는 아름다운 벚꽃길을 걸으며 다채로운 문화 공연과 체험 프로그램을 즐길 수 있습니다. 가족, 연인, 친구와 함께 잊지 못할 봄날의 추억을 만들어보세요.',
  image: 'https://images.unsplash.com/photo-1522864697368-8096add2e6df?auto=format&fit=crop&q=80&w=800',
  viewCount: 1542,
};

export default function FestivalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // 실제 환경: 서버 혹은 SWR/React Query로 데이터를 가져옴.
  const resolvedParams = use(params);
  const fid = resolvedParams.id;
  
  const [data, setData] = useState(DUMMY_FESTIVAL);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const toggleBookmark = () => {
    setIsBookmarked(prev => !prev);
    // API_FES_0040 연동
  };

  return (
    <main>
      {/* 1. 히어로 배경 영역 */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.badgeWrap}>
            <span className={styles.badge}>{data.badge}</span>
          </div>
          <div className={styles.titleRow}>
            <div className={styles.titleBox}>
              <h1>{data.title}</h1>
              <p><span>📅 {data.dateString}</span> <span>📍 {data.location}</span></p>
            </div>
            
            {/* 북마크 (찜하기) 토글 영역 */}
            <button 
              className={`${styles.bookmark} ${isBookmarked ? styles.active : ''}`} 
              onClick={toggleBookmark}
              aria-label="찜하기"
            >
              <Heart fill={isBookmarked ? "currentColor" : "none"} strokeWidth={2} />
            </button>
          </div>
        </div>
      </section>

      {/* 2. 콘텐츠 2단 분할 영역 */}
      <section className={styles.contentWrap}>
        <div className={styles.contentInner}>
          
          {/* 좌측 메인: 상세설명 + 리뷰 */}
          <div className={styles.leftCol}>
            
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>축제 상세 정보</h2>
              <div className={styles.descText}>
                {data.description}
              </div>
              <div className={styles.descImage}>
                <Image src={data.image} alt="축제 전경" width={800} height={400} />
              </div>
            </div>


          </div>

          {/* 우측 사이드바: 기본정보 + 통계 */}
          <div className={styles.rightCol}>
            
            {/* 정보 박스 */}
            <div className={styles.infoBox}>
              <div className={styles.infoRow}>
                <div className={styles.infoIcon}>📍</div>
                <div>
                  <div className={styles.infoLabel}>장소</div>
                  <div className={styles.infoVal} style={{ whiteSpace: 'pre-line' }}>{data.address}</div>
                </div>
              </div>
              <div className={styles.infoRow}>
                <div className={styles.infoIcon}>📅</div>
                <div>
                  <div className={styles.infoLabel}>기간</div>
                  <div className={styles.infoVal}>{data.dateString}</div>
                </div>
              </div>
              <div className={styles.infoRow}>
                <div className={styles.infoIcon}>📞</div>
                <div>
                  <div className={styles.infoLabel}>문의안내</div>
                  <div className={styles.infoVal}>{data.phone}</div>
                </div>
              </div>
              <div className={styles.infoRow}>
                <div className={styles.infoIcon}>💰</div>
                <div>
                  <div className={styles.infoLabel}>이용요금</div>
                  <div className={styles.infoVal}>{data.fee}</div>
                </div>
              </div>
            </div>



          </div>

        </div>
      </section>
    </main>
  );
}

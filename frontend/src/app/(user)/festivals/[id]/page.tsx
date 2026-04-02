'use client';

import { useState, useEffect, use } from 'react';
import { Heart } from 'lucide-react';
import Image from 'next/image';
import axios from 'axios';
import styles from './FestivalDetail.module.css';

export default function FestivalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const fid = resolvedParams.id;
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const fetchFestival = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9090';
        const res = await axios.get(`${baseUrl}/api/festivals/${fid}`);
        if (res.data && res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch festival details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFestival();
  }, [fid]);

  const toggleBookmark = () => {
    setIsBookmarked(prev => !prev);
    // API_FES_0040 연동
  };

  if (loading) {
    return <div style={{ minHeight: '800px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#666' }}>축제 정보를 불러오는 중입니다...</div>;
  }

  if (!data) {
    return <div style={{ minHeight: '800px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
      <p style={{ fontSize: '18px', color: '#666' }}>축제 데이터를 찾을 수 없습니다.</p>
    </div>;
  }

  // Format data
  const formatDt = (dt: string) => dt ? dt.toString().replace(/-/g, '.') : '';
  const dateString = data.startDate && data.endDate ? `${formatDt(data.startDate)} ~ ${formatDt(data.endDate)}` : '상시 진행 (미정)';
  
  let badgeText = '진행전';
  if (data.status === 'ONGOING') badgeText = '진행중';
  if (data.status === 'ENDED') badgeText = '종료';

  const imageSrc = data.imageUrl || data.thumbnailUrl || 'https://images.unsplash.com/photo-1522864697368-8096add2e6df?auto=format&fit=crop&q=80&w=800';

  return (
    <main>
      {/* 1. 히어로 배경 영역 (동적 이미지 렌더링) */}
      <section 
        className={styles.hero} 
        style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.7)), url(${imageSrc})` }}
      >
        <div className={styles.heroInner}>
          <div className={styles.badgeWrap}>
            <span className={styles.badge}>{badgeText}</span>
          </div>
          <div className={styles.titleRow}>
            <div className={styles.titleBox}>
              <h1>{data.title}</h1>
              <p><span>📅 {dateString}</span> <span>📍 {data.address ? data.address.split(' ')[0] : '지역 미상'}</span></p>
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
          
          {/* 좌측 메인: 상세설명 */}
          <div className={styles.leftCol}>
            
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>축제 상세 정보</h2>
              <div className={styles.descText}>
                {/* 공공데이터는 종종 설명이 없을 수도 있습니다. */}
                {data.overview || data.description || '축제의 상세 설명이 아직 등록되지 않았습니다. (공공데이터 내용 업데이트 예정)'}
              </div>
              <div className={styles.descImageGallery}>
                <div className={styles.mainImageWrapper}>
                  <Image src={imageSrc} alt="축제 포스터 및 전경" fill sizes="(max-width: 1200px) 100vw, 800px" style={{ objectFit: 'cover' }} />
                </div>
                {/* 추가 이미지 갤러리 */}
                {data.images && data.images.length > 0 && (
                  <div className={styles.extraImageGrid}>
                    {data.images.map((img: string, idx: number) => (
                      <div key={idx} className={styles.extraImageWrapper}>
                        <Image src={img} alt={`추가 이미지 ${idx+1}`} fill sizes="(max-width: 1200px) 25vw, 200px" style={{ objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 후기 섹션 - 플레이스홀더 */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>축제 후기 (0)</h2>
              
              <div className={styles.reviewForm}>
                <div className={styles.reviewAvatar}></div>
                <div className={styles.reviewInputBox}>
                  <input type="text" placeholder="이 축제에 대한 솔직한 리뷰를 남겨주세요 (최소 10자 이상)" disabled style={{ cursor: 'not-allowed', background: '#f8fafc' }} />
                  <div className={styles.reviewActions}>
                    <span className={styles.reviewStars}>☆☆☆☆☆</span>
                    <button className={styles.reviewBtn} disabled style={{opacity: 0.5, cursor: 'not-allowed'}}>리뷰 등록 (준비중)</button>
                  </div>
                </div>
              </div>

              <div className={styles.reviewList}>
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: '14px' }}>
                  아직 등록된 리뷰가 없습니다. 첫 리뷰를 남겨보세요!
                </div>
              </div>
            </div>

          </div>

          {/* 우측 사이드바: 기본정보 요약 */}
          <div className={styles.rightCol}>
            
            {/* 정보 박스 */}
            <div className={styles.infoBox}>
              <div className={styles.infoRow}>
                <div className={styles.infoIcon}>📍</div>
                <div>
                  <div className={styles.infoLabel}>장소</div>
                  <div className={styles.infoVal} style={{ whiteSpace: 'pre-line' }}>{data.address || '상세 주소 미등록'}</div>
                </div>
              </div>
              <div className={styles.infoRow}>
                <div className={styles.infoIcon}>📅</div>
                <div>
                  <div className={styles.infoLabel}>기간</div>
                  <div className={styles.infoVal}>{dateString}</div>
                </div>
              </div>
              <div className={styles.infoRow}>
                <div className={styles.infoIcon}>📞</div>
                <div>
                  <div className={styles.infoLabel}>문의안내</div>
                  <div className={styles.infoVal}>{data.tel || '전화번호 미등록'}</div>
                </div>
              </div>
              <div className={styles.infoRow}>
                <div className={styles.infoIcon}>💰</div>
                <div>
                  <div className={styles.infoLabel}>이용요금</div>
                  <div className={styles.infoVal}>{data.fee || '무료 또는 상세설명 참조'}</div>
                </div>
              </div>
            </div>

            {/* 별점 통계 - 플레이스홀더 */}
            <div className={styles.ratingBox}>
              <div className={styles.ratingTitle}>리뷰 통계</div>
              <div className={styles.ratingBig}>0.0</div>
              <div className={styles.ratingStarsMain}>☆☆☆☆☆</div>
              <div className={styles.ratingCount}>총 0개의 리뷰</div>

              <div className={styles.ratingBars}>
                {[5, 4, 3, 2, 1].map(num => (
                  <div key={num} className={styles.rbRow}>
                    <span>{num}점</span>
                    <div className={styles.rbBarWrap}>
                      <div className={styles.rbBar} style={{ width: '0%' }}></div>
                    </div>
                    <span>0</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>
    </main>
  );
}

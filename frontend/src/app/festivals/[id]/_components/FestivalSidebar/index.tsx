import styles from './FestivalSidebar.module.css';

interface FestivalSidebarProps {
  address?: string;
  dateString: string;
  tel?: string;
  fee?: string;
  reviewStats: any;
}

export default function FestivalSidebar({
  address,
  dateString,
  tel,
  fee,
  reviewStats,
}: FestivalSidebarProps) {
  const renderStars = (score: number) => {
    return [1, 2, 3, 4, 5].map(num => (
      <span key={num} className={styles.starIcon} style={{ color: num <= score ? '#fbbf24' : '#e2e8f0' }}>★</span>
    ));
  };

  return (
    <aside className={styles.rightCol}>
      {/* 기본정보 박스 */}
      <div className={styles.infoBox}>
        <div className={styles.infoRow}>
          <div className={styles.infoIcon}>📍</div>
          <div>
            <div className={styles.infoLabel}>장소</div>
            <div className={`${styles.infoVal} ${styles.preLine}`}>{address || '상세 주소 미등록'}</div>
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
            <div className={styles.infoVal}>{tel || '전화번호 미등록'}</div>
          </div>
        </div>
        <div className={styles.infoRow}>
          <div className={styles.infoIcon}>💰</div>
          <div>
            <div className={styles.infoLabel}>이용요금</div>
            <div className={`${styles.infoVal} ${styles.feeContainer}`}>
              {!fee ? (
                '무료 또는 상세설명 참조'
              ) : (
                fee.split(/\\n|\n|\r\n|<br\s*\/?>|,\s+(?![0-9]{3})|(?=- )/).map((line, idx) => {
                  let trimmed = line.trim();
                  // 앞의 하이픈이 중복되지 않도록 정리 (이미 bullet을 붙일 것이므로)
                  if (trimmed.startsWith('-')) {
                    trimmed = trimmed.substring(1).trim();
                  }
                  if (!trimmed) return null;
                  
                  // 항목 앞에 불릿 적용 
                  return (
                    <div key={idx} className={styles.preLine}>
                      • {trimmed}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 별점 통계 박스 */}
      <div className={styles.ratingBox}>
        <div className={styles.ratingTitle}>리뷰 통계</div>
        <div className={styles.ratingBig}>{reviewStats?.averageRating?.toFixed(1) || '0.0'}</div>
        <div className={styles.ratingStarsMain}>{renderStars(Math.round(reviewStats?.averageRating || 0))}</div>
        <div className={styles.ratingCount}>총 {reviewStats?.totalElements || 0}개의 리뷰</div>

        <div className={styles.ratingBars}>
          {[5, 4, 3, 2, 1].map(num => {
            const count = reviewStats?.ratingDistribution?.[num] || 0;
            const total = reviewStats?.totalElements || 1;
            const percent = total === 0 ? 0 : (count / total) * 100;
            return (
              <div key={num} className={styles.rbRow}>
                <span>{num}점</span>
                <div className={styles.rbBarWrap}>
                  <div className={styles.rbBar} style={{ width: `${percent}%` }}></div>
                </div>
                <span>{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

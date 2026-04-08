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

  // 이용요금 문자열을 파싱하는 고도화된 헬퍼 함수
  const parseFeeLines = (feeStr: string): string[] => {
    let result: string[] = [];
    let current = '';
    let depth = 0; // 괄호 중첩 추적
    
    // <br> 태그 등을 미리 줄바꿈 기호(\n)로 정규화
    const normalized = feeStr.replace(/<br\s*\/?>/gi, '\n');
    
    for (let i = 0; i < normalized.length; i++) {
      const char = normalized[i];
      const nextChar = normalized[i + 1] || '';
      
      // 다양한 종류의 괄호 깊이 추적
      if (['(', '[', '{', '<', '（', '【'].includes(char)) depth++;
      else if ([')', ']', '}', '>', '）', '】'].includes(char)) depth = Math.max(0, depth - 1);
      
      // 괄호 바깥일 때만 분리 기호들 확인
      if (depth === 0) {
        // 1. 줄바꿈 기호
        if (char === '\n' || char === '\r') {
          if (current.trim()) result.push(current.trim());
          current = '';
          continue;
        }
        
        // 2. 콤마
        if (char === ',') {
          const nextPart = normalized.substring(i + 1).trimStart();
          // 돈의 단위(예: ,000)인지 확인
          if (/^[0-9]{3}(?![0-9])/.test(nextPart) || /^[0-9]{3}/.test(normalized.substring(i + 1))) {
            current += char;
          } else {
            if (current.trim()) result.push(current.trim());
            current = '';
          }
          continue;
        }
        
        // 3. 하이픈(-) 리스트 (ex. '...무료 - 성인 500원')
        // 하이픈 앞에 문자열이 이미 쌓여 있다면 분리 단위로 인식
        if (char === '-' && nextChar === ' ' && current.trim()) {
           result.push(current.trim());
           current = ''; 
           // 현재 순회중인 char '-'는 아래의 current += char 로 넘어가서 다음 문장의 시작을 담당함
        }
      }
      
      current += char;
    }
    
    if (current.trim()) result.push(current.trim());
    
    return result.map(line => {
      // 괄호 안이라서 잘리지 않고 품고 있던 구분의미(\n 등)를 ", " 로 부드럽게 치환
      let clean = line.replace(/[\n\r]+/g, ', ').replace(/\s{2,}/g, ' ').trim();
      
      // 파싱 후 첫글자가 쓸데없는 기호면 깔끔하게 삭제
      if (clean.startsWith('-') || clean.startsWith(',')) {
        clean = clean.substring(1).trim();
      }
      return clean;
    }).filter(Boolean);
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
            <div className={styles.infoVal}>
              {!tel ? (
                '전화번호 미등록'
              ) : (
                tel.split(/,\s*|\s*<br\s*\/?>\s*|(?<=\d)(?=(?:02|0[1-9][0-9]|1[5-8][0-9]{2})-)/).map((line, idx) => {
                  const trimmed = line.trim();
                  if (!trimmed) return null;
                  return (
                    <div key={idx} className={styles.preLine}>
                      {trimmed}
                    </div>
                  );
                })
              )}
            </div>
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
                parseFeeLines(fee).map((line, idx) => {
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

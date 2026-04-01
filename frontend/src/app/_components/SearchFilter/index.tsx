'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import styles from './SearchFilter.module.css';

export default function SearchFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentKeyword = searchParams.get('keyword') || '';

  const [keyword, setKeyword] = useState(currentKeyword);

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (keyword.trim()) {
      params.set('keyword', keyword.trim());
    } else {
      params.delete('keyword');
    }
    // 검색 시 1페이지로 리셋
    params.delete('page');
    router.push(`/?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  const clearKeyword = () => {
    setKeyword('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('keyword');
    params.delete('page');
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.filterBar}>
        <div className={styles.left}>
          <div className={styles.inputWrap}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="축제명, 지역명으로 검색해보세요" 
              className={styles.input}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {keyword && (
              <button className={styles.clearBtn} onClick={clearKeyword} aria-label="검색어 지우기">
                <X size={14} />
              </button>
            )}
          </div>
          <button className={styles.submitBtn} onClick={handleSearch}>검색</button>
        </div>
      </div>

      {/* 현재 검색 중인 키워드 태그 */}
      {currentKeyword && (
        <div className={styles.activeTags}>
          <span className={styles.activeTag}>
            &quot;{currentKeyword}&quot; 검색 결과
            <button onClick={clearKeyword} className={styles.closeIconBtn}>
              <X size={12} className={styles.closeIcon} />
            </button>
          </span>
        </div>
      )}
    </div>
  );
}

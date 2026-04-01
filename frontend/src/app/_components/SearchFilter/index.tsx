'use client';

import { Search, Filter, X } from 'lucide-react';
import styles from './SearchFilter.module.css';

export default function SearchFilter() {
  return (
    <div className={styles.wrapper}>
      {/* 퀵 카테고리 (Wow 포인트) */}
      <div className={styles.quickTags}>
        <button className={styles.quickTag}>🌸 벚꽃/봄꽃</button>
        <button className={styles.quickTag}>🌊 바다 축제</button>
        <button className={styles.quickTag}>🍱 먹거리/푸드</button>
        <button className={styles.quickTag}>👨‍👩‍👧 가족과 함께</button>
        <button className={styles.quickTag}>🌌 야경 명소</button>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.left}>
          <div className={styles.inputWrap}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="축제명, 지역명으로 검색해보세요" 
              className={styles.input}
            />
          </div>
          <button className={styles.filterBtn}>
            <Filter size={16} /> 상세 필터
          </button>
          <button className={styles.submitBtn}>검색</button>
        </div>

        <div className={styles.right}>
          <select className={styles.sortSelect} defaultValue="latest">
            <option value="latest">최신순</option>
            <option value="popular">인기순</option>
            <option value="rating">별점순</option>
          </select>
        </div>
      </div>

      {/* 액티브 필터 태그들 */}
      <div className={styles.activeTags}>
        <span className={styles.activeTag}>
          서울 <X size={12} className={styles.closeIcon} />
        </span>
        <span className={styles.activeTag}>
          진행중 <X size={12} className={styles.closeIcon} />
        </span>
      </div>
    </div>
  );
}

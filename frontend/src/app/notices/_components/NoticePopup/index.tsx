'use client';

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import api from '@/lib/api';
import type { Notice } from '@/types/notice';
import s from './NoticePopup.module.css';

export default function NoticePopup() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hideUntil = localStorage.getItem('hideNoticePopupUntil');
    if (hideUntil && new Date().getTime() < parseInt(hideUntil, 10)) {
      console.log('NoticePopup: 숨김 처리 중 (만료: ' + new Date(parseInt(hideUntil, 10)).toLocaleString() + ')');
      return; // "오늘 하루 안보기" 상태
    }

    // 2. Fetch popup notice
    const fetchPopup = async () => {
      try {
        const { data } = await api.get<{ data: Notice[] }>('/api/notices/popup');
        console.log('NoticePopup fetched data:', data); // 디버깅 용
        if (data && data.data && data.data.length > 0) {
          setNotices(data.data);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('팝업 공지사항을 불러오는 중 오류 발생:', err);
      }
    };

    fetchPopup();
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleHideToday = () => {
    // 오늘 자정 (밤 12시) 까지 만료
    const tomorrow = new Date();
    tomorrow.setHours(24, 0, 0, 0); // 다음날 0시 0분 0초
    localStorage.setItem('hideNoticePopupUntil', tomorrow.getTime().toString());
    setIsOpen(false);
  };

  if (!isOpen || notices.length === 0) return null;

  const currentNotice = notices[currentIndex];

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleNext = () => {
    if (currentIndex < notices.length - 1) setCurrentIndex(currentIndex + 1);
  };

  return (
    <div className={s.overlay}>
      <div className={s.popupContainer}>
        <div className={s.header}>
          <h2 className={s.title}>{currentNotice.title}</h2>
          <button className={s.closeBtn} onClick={handleClose}>&times;</button>
        </div>
        <div className={`${s.body} ${s.markdownBody}`}>
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
            {currentNotice.content}
          </ReactMarkdown>
        </div>

        {notices.length > 1 && (
          <div className={s.carouselControls}>
            <button className={s.carouselBtn} onClick={handlePrev} disabled={currentIndex === 0}>
              &lt; 이전
            </button>
            <span className={s.carouselIndicator}>
              {currentIndex + 1} / {notices.length}
            </span>
            <button className={s.carouselBtn} onClick={handleNext} disabled={currentIndex === notices.length - 1}>
              다음 &gt;
            </button>
          </div>
        )}

        <div className={s.footer}>
          <button className={s.hideTodayBtn} onClick={handleHideToday}>
            오늘 하루 보지 않기
          </button>
          <button className={s.confirmBtn} onClick={handleClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

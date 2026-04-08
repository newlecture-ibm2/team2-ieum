'use client';

import { useState, useEffect } from 'react';
import common from '@/app/admin/_styles/admin-common.module.css';
import s from './InquiryDetailModal.module.css';
import adminApi from '@/lib/adminApi';
import type { InquiryItem } from '@/types/admin-inquiry';
import { Modal } from '@/_component/common/Modal';
import { useToast } from '@/_component/common/Toast';

/* ── Props ── */
interface Props {
  inquiry: InquiryItem;
  onClose: () => void;
  onAnswered: () => void;
}

export default function InquiryDetailModal({ inquiry, onClose, onAnswered }: Props) {
  /* ── 최신 데이터 상태 ── */
  const [detail, setDetail] = useState<InquiryItem>(inquiry);
  const [detailLoading, setDetailLoading] = useState(true);

  const isPending = detail.status === 'PENDING';

  const { toast } = useToast();

  /* ── 답변 상태 ── */
  const [answer, setAnswer] = useState('');
  const [answerError, setAnswerError] = useState('');
  const [processing, setProcessing] = useState(false);

  /* ── 상세 API로 최신 데이터 조회 ── */
  useEffect(() => {
    const fetchDetail = async () => {
      setDetailLoading(true);
      try {
        const { data } = await adminApi.get<{ data: InquiryItem }>(`/inquiries/${inquiry.id}`);
        setDetail(data.data);
      } catch {
        // API 실패 시 리스트에서 전달받은 데이터 그대로 사용
        setDetail(inquiry);
      } finally {
        setDetailLoading(false);
      }
    };
    fetchDetail();
  }, [inquiry.id]);

  /* ── 답변 등록 ── */
  const handleSubmit = async () => {
    if (!isPending) return;

    const trimmed = answer.trim();
    if (!trimmed) {
      setAnswerError('답변 내용을 입력해주세요.');
      return;
    }
    if (trimmed.length < 5) {
      setAnswerError('답변은 최소 5자 이상 작성해주세요.');
      return;
    }

    setProcessing(true);
    try {
      await adminApi.post(`/inquiries/${inquiry.id}/answer`, {
        answer: trimmed,
      });
      toast('답변이 성공적으로 등록되었습니다.', 'success');
      onAnswered();
    } catch (err: any) {
      const errorCode = err?.response?.data?.error?.code;
      if (errorCode === 'ALREADY_ANSWERED') {
        toast('이미 답변이 등록된 문의입니다. 목록을 새로고침합니다.', 'error');
        onAnswered();
      } else if (errorCode === 'INQUIRY_NOT_FOUND') {
        toast('해당 문의를 찾을 수 없습니다.', 'error');
        onClose();
      } else {
        console.error('답변 등록 실패:', err);
        toast('답변 등록 중 오류가 발생했습니다.', 'error');
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className={s.modalWrap}>
      <Modal title={`📩 문의 상세 ${!isPending ? '(답변 완료)' : ''}`} size="large" onClose={onClose} closeOnOverlay={false}>
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <span className={common.spinner} /> 불러오는 중...
          </div>
        ) : (
          <div className={s.modalBody}>
            {/* ── 타이틀 & 메타 헤더 ── */}
            <div className={s.headerArea}>
              <div className={s.titleRow}>
                <div 
                  className={s.statusBadge} 
                  style={isPending ? { background: '#f5f3ff', color: '#8b5cf6' } : { background: '#f0fdf4', color: '#16a34a' }}
                >
                  {isPending ? '대기중' : '답변완료'}
                </div>
                <div className={s.mainTitle}>
                  {detail.title}
                </div>
              </div>
              
              {/* ── 2. 메타 정보 (우측 정렬) ── */}
              <div className={s.metaWrap}>
                <div className={s.metaRowBox}>
                  <span>작성자: 👤 {detail.authorNickname}</span>
                  <span className={s.metaDot}>•</span>
                  <span>접수 일시: {detail.createdAt?.replace('T', ' ').slice(0, 16)}</span>
                </div>
              </div>
            </div>

            <hr className={s.divider} />

            {/* ── 사용자 문의 본문 (버블 스타일 & 스크롤) ── */}
            <div className={s.questionBubble}>
              <div className={s.bubbleHeader}>💡 문의 내용</div>
              <div className={s.questionTextScroll}>{detail.content}</div>
            </div>

            {/* ── 답변 작성 / 기록 구역 ── */}
            {isPending ? (
              <div>
                <div className={s.answerSectionTitle}>
                  관리자 답변 작성
                </div>
                <div className={s.responseArea}>
                  <textarea
                    className={`${s.responseTextarea} ${answerError ? s.responseTextareaError : ''}`}
                    value={answer}
                    onChange={(e) => {
                      setAnswer(e.target.value);
                      if (answerError) setAnswerError('');
                    }}
                    placeholder="문의에 대한 상세한 답변을 작성해주세요."
                    maxLength={2000}
                  />
                  <span className={`${s.charCount} ${answer.length < 5 && answer.length > 0 ? s.charCountError : ''}`}>
                    {answer.length} / 2000
                  </span>
                </div>
                {answerError && <span className={s.errorText}>{answerError}</span>}
              </div>
            ) : (
              <div>
                <div className={s.answerSectionTitle}>
                  처리 결과
                </div>
                <div className={s.answerBubble}>
                  <div className={s.answerMeta}>
                    <span style={{ color: '#16a34a' }}>✅ 답변 완료</span>
                    <span className={s.metaDot}>•</span>
                    <span>담당자</span>
                    <span className={s.metaDot}>•</span>
                    <span>{detail.answeredAt?.replace('T', ' ').slice(0, 16) || '-'}</span>
                  </div>
                  <div className={s.answerContent}>
                    {detail.answer || '(답변 내용 없음)'}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── 하단 버튼 ── */}
        <div className={s.modalFooter}>
          <button className={common.btnCancel} onClick={onClose}>
            닫기
          </button>
          {isPending && !detailLoading && (
            <button
              className={common.btnPrimary}
              style={{ opacity: answer.trim().length < 5 ? 0.5 : 1 }}
              onClick={handleSubmit}
              disabled={processing || answer.trim().length < 5}
            >
              {processing ? '등록 중...' : '답변 등록'}
            </button>
          )}
        </div>
      </Modal>
    </div>
  );
}

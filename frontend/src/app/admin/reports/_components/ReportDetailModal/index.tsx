'use client';

import { useState, useEffect } from 'react';
import common from '@/app/admin/_styles/admin-common.module.css';
import s from './ReportDetailModal.module.css';
import adminApi from '@/lib/adminApi';
import type { ReportItem } from '@/types/admin-report';
import { Modal } from '@/_component/common/Modal';
import ConfirmModal from '@/_component/common/Modal/ConfirmModal';
import { useToast } from '@/_component/common/Toast';

/* ── 매핑 상수 ── */
const TARGET_TYPE_MAP: Record<string, string> = {
  REVIEW:  '리뷰',
  POST:    '게시글',
  COMMENT: '댓글',
};

const REASON_MAP: Record<string, string> = {
  SPAM:          '스팸',
  ABUSE:         '욕설/비방',
  INAPPROPRIATE: '부적절한 콘텐츠',
  FALSE_INFO:    '허위 정보',
  OTHER:         '기타',
};

/* ── 답변 템플릿 부분은 하단에서 동적으로 렌더링 ── */

/* ── 원문 타입 ── */
interface OriginalContent {
  author: string;
  createdAt: string;
  content: string;
}

/* ── Props ── */
interface Props {
  report: ReportItem;
  onClose: () => void;
  onProcessed: () => void;
}

export default function ReportDetailModal({ report, onClose, onProcessed }: Props) {
  const isPending = report.status === 'PENDING';
  const targetLabel = TARGET_TYPE_MAP[report.targetType] || report.targetType;

  const { toast } = useToast();
  const [confirmTarget, setConfirmTarget] = useState<'DISMISS' | 'DELETE' | null>(null);

  /* ── 답변 상태 ── */
  const [message, setMessage] = useState('');
  const [messageError, setMessageError] = useState('');
  const [processing, setProcessing] = useState(false);

  /* ── 원문 로딩 ── */
  const [original, setOriginal] = useState<OriginalContent | null>(null);
  const [originalLoading, setOriginalLoading] = useState(true);
  const [originalDeleted, setOriginalDeleted] = useState(false);

  /* ── 스크롤 방지 제거 ── */

  /* ── 원문 조회 시도 ── */
  useEffect(() => {
    const fetchOriginal = async () => {
      setOriginalLoading(true);
      try {
        const { data } = await adminApi.get(`/reports/${report.id}/target`);
        if (data.success && data.data) {
          setOriginal({
            author: data.data.author,
            content: data.data.content,
            createdAt: data.data.createdAt
          });
          setOriginalDeleted(false);
        } else {
          setOriginalDeleted(true);
        }
      } catch {
        setOriginalDeleted(true);
      } finally {
        setOriginalLoading(false);
      }
    };
    fetchOriginal();
  }, [report.id]);

  /* ── 처리 로직 ── */
  const executeProcess = async (actionType: 'DISMISS' | 'DELETE') => {
    if (!isPending) return;

    const trimmed = message.trim();
    if (!trimmed) {
      setMessageError('처리 답변을 입력해주세요.');
      return;
    }
    if (trimmed.length < 10) {
      setMessageError('답변은 최소 10자 이상 작성해주세요.');
      return;
    }

    setProcessing(true);
    try {
      const res = await adminApi.patch(`/reports/${report.id}/process`, {
        actionType,
        message: trimmed,
      });
      if (res.data.success) {
        toast('신고 처리가 완료되었습니다.', 'success');
        onProcessed();
      }
    } catch (err) {
      console.error('신고 처리 실패:', err);
      toast('처리 중 오류가 발생했습니다.', 'error');
    } finally {
      setProcessing(false);
      setConfirmTarget(null);
    }
  };

  const handleProcessClick = (actionType: 'DISMISS' | 'DELETE') => {
    const trimmed = message.trim();
    if (!trimmed) {
      setMessageError('처리 답변을 입력해주세요.');
      return;
    }
    if (trimmed.length < 10) {
      setMessageError('답변은 최소 10자 이상 작성해주세요.');
      return;
    }
    setConfirmTarget(actionType);
  };

  /* ── 템플릿 적용 ── */
  const applyTemplate = (text: string) => {
    setMessage(text);
    setMessageError('');
  };

  /* ── 아웃링크 계산 ── */
  const getOutlink = () => {
    if (report.targetType === 'POST') return `/community/${report.targetId}`;
    if (report.targetType === 'FESTIVAL') return `/festivals/${report.targetId}`; // 리뷰의 상위 축제를 직접 알기는 로직상 까다로워 대안 경로 처리 (필요시 수정)
    return null;
  };
  const outlink = getOutlink();

  return (
    <>
      <div className={s.modalWrap}>
        <Modal title={`🔍 신고 내용 확인 ${!isPending ? '(처리 완료)' : ''}`} size="large" onClose={onClose} closeOnOverlay={false}>
          <div className={s.modalBody}>
          {/* ── ① 신고 기본 정보 (Summary Card) ── */}
          <div className={s.section}>
            <div className={s.infoSummaryCard}>
              <div className={s.infoHeader}>
                <div className={s.reasonBadge}>
                  🚨 {REASON_MAP[report.reason] || report.reason}
                </div>
                <div className={s.targetBadge}>
                  {targetLabel} #{report.targetId}
                </div>
              </div>

              <div className={s.metaList}>
                <div className={s.metaItem}>신고자: <strong>👤 {report.reporterNickname}</strong></div>
                <div className={s.metaItem}>접수일시: <strong>{report.createdAt?.replace('T', ' ').slice(0, 16)}</strong></div>
              </div>

              {report.description && (
                <div className={s.quoteBox}>
                  {report.description}
                </div>
              )}
            </div>
          </div>

          <div className={s.divider} />

          {/* ── ② 신고 대상 원문 ── */}
          <div className={s.section}>
            <div className={s.sectionHeaderWrap}>
              <div className={s.sectionTitleNoMargin}>
                <span className={s.sectionIcon}>📄</span> 신고 대상 원문
              </div>
              {outlink && !originalDeleted && !originalLoading && (
                 <a href={outlink} target="_blank" rel="noopener noreferrer" className={s.outlinkBtn} title="새 탭에서 원문 엽니다">
                   🔗 원문 바로가기
                 </a>
              )}
            </div>
            {originalLoading ? (
              <div style={{ textAlign: 'center', padding: '16px 0', color: '#94a3b8', fontSize: 13 }}>
                <span className={common.spinner} /> 원문 불러오는 중...
              </div>
            ) : originalDeleted || !original ? (
              <div className={s.originalCard}>
                <div className={s.deletedContent}>
                  🚫 이미 삭제되었거나 원문을 조회할 수 없는 콘텐츠입니다.
                </div>
              </div>
            ) : (
              <div className={s.originalCard}>
                <div className={s.originalMeta}>
                  <span className={s.originalAuthor}>{original.author}</span>
                  <span>·</span>
                  <span>{original.createdAt?.slice(0, 10)}</span>
                </div>
                <div className={s.originalContentScroll}>{original.content}</div>
              </div>
            )}
          </div>

          <div className={s.divider} />


          {/* ── ④ 처리 답변 / 처리 이력 ── */}
          {isPending ? (
            <div className={s.section}>
              <div className={s.sectionTitle}>
                <span className={s.sectionIcon}>✏️</span>
                <span className={s.requiredStar}>*</span> 처리 답변
              </div>

              {/* 동적 템플릿 버튼 (신고 사유 기반) */}
              <div className={s.templateRow}>
                <button
                  className={`${s.templateBtn} ${s.templateBtnAccept}`}
                  onClick={() => applyTemplate(`신고하신 콘텐츠를 확인한 결과, [${REASON_MAP[report.reason] || report.reason}] 사유가 명확히 확인되어 해당 ${targetLabel}을(를) 규제(숨김) 처리하였습니다. 건전한 커뮤니티 조성을 위한 신고에 진심으로 감사드립니다.`)}
                  type="button"
                >
                  ✅ {REASON_MAP[report.reason] || report.reason} 인정 (구제 템플릿)
                </button>
                <button
                  className={`${s.templateBtn} ${s.templateBtnReject}`}
                  onClick={() => applyTemplate(`접수해주신 [${REASON_MAP[report.reason] || report.reason}] 사유에 대해 면밀히 검토하였으나, 현재 커뮤니티 운영 정책상 명백한 위반 사항을 발견하기 어려워 부득이하게 신고를 반려 처리합니다. 추가적인 다른 문제가 있다면 언제든 다시 신고해 주시기 바랍니다.`)}
                  type="button"
                >
                  ↩️ 정책 위반 없음 (반려 템플릿)
                </button>
              </div>

              {/* textarea */}
              <div className={s.responseArea}>
                <textarea
                  className={`${s.responseTextarea} ${messageError ? s.responseTextareaError : ''}`}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (messageError) setMessageError('');
                  }}
                  placeholder="신고자에게 전달될 처리 사유를 작성해주세요."
                  maxLength={500}
                />
                <span className={`${s.charCount} ${message.length < 10 && message.length > 0 ? s.charCountError : ''}`}>
                  {message.length} / 500
                </span>
              </div>
              {messageError && <span className={s.errorText}>⚠ {messageError}</span>}
            </div>
          ) : (
            /* 처리 이력 (readonly) */
            <div className={s.section}>
              <div className={s.sectionTitle}>
                <span className={s.sectionIcon}>📑</span> 처리 이력
              </div>
              <div className={`${s.historyCard} ${report.status === 'REJECTED' ? s.historyCardRejected : ''}`}>
                <div className={s.historyMeta}>
                  <span className={`${s.historyStatus} ${report.status === 'RESOLVED' ? s.historyStatusResolved : s.historyStatusRejected}`}>
                    {report.status === 'RESOLVED' ? '✅ 처리완료' : '↩️ 반려'}
                  </span>
                  <span>처리자: 관리자</span>
                  <span>{report.processedAt?.replace('T', ' ').slice(0, 19) || '-'}</span>
                </div>
                <div className={s.historyMessage}>
                  {report.adminNote || '(답변 내용 없음)'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── 하단 버튼 ── */}
        <div className={s.modalFooter}>
          <button className={common.btnCancel} onClick={onClose}>
            닫기
          </button>
          {isPending && (
            <>
              <button
                className={common.btnCancel}
                style={{
                  borderColor: '#0284c7',
                  color: '#0284c7',
                  opacity: message.trim().length < 10 ? 0.5 : 1,
                }}
                onClick={() => handleProcessClick('DISMISS')}
                disabled={processing || message.trim().length < 10}
              >
                {processing ? '처리 중...' : '신고 반려'}
              </button>
              <button
                className={common.btnDanger}
                style={{ opacity: message.trim().length < 10 ? 0.5 : 1 }}
                onClick={() => handleProcessClick('DELETE')}
                disabled={processing || message.trim().length < 10}
              >
                {processing ? '처리 중...' : `신고 대상 ${targetLabel} 삭제`}
              </button>
            </>
          )}
        </div>
        </Modal>
      </div>

      {confirmTarget && (
        <ConfirmModal
          title="신고 처리 확인"
          message={
            confirmTarget === 'DELETE'
              ? `신고 대상 ${targetLabel}을(를) 정말 삭제하시겠습니까?\n(삭제 후에는 복구가 불가합니다.)`
              : '신고를 반려 처리하시겠습니까?'
          }
          confirmText={confirmTarget === 'DELETE' ? '삭제' : '반려'}
          danger={confirmTarget === 'DELETE'}
          onConfirm={() => executeProcess(confirmTarget)}
          onCancel={() => setConfirmTarget(null)}
        />
      )}
    </>
  );
}

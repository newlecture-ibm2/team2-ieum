'use client';

import { useState, useEffect } from 'react';
import common from '@/app/admin/_styles/admin-common.module.css';
import s from './ReportDetailModal.module.css';
import adminApi from '@/lib/adminApi';
import type { ReportItem } from '@/types/admin-report';
import { Modal } from '@/_component/common/Modal';
import ConfirmModal from '@/_component/common/Modal/ConfirmModal';
import { useToast } from '@/_component/common/Toast';
import { REPORT_REASON_LABELS, REPORT_ACTION } from '@/constants/reportOptions';
import { REPORT_STATUS } from '@/constants/statusLabels';
import { TARGET_TYPE } from '@/constants/targetType';
import DOMPurify from 'isomorphic-dompurify';

/* ── 매핑 상수 ── */
const TARGET_TYPE_MAP: Record<string, string> = {
  [TARGET_TYPE.REVIEW]:  '리뷰',
  [TARGET_TYPE.POST]:    '게시글',
  [TARGET_TYPE.COMMENT]: '댓글',
};

/* ── 답변 템플릿 부분은 하단에서 동적으로 렌더링 ── */

/* ── 원문 타입 ── */
interface OriginalContent {
  author: string;
  createdAt: string;
  content: string;
  parentId?: string;
}

/* ── Props ── */
interface Props {
  report: ReportItem;
  onClose: () => void;
  onProcessed: () => void;
}

export default function ReportDetailModal({ report, onClose, onProcessed }: Props) {
  const isPending = report.status === REPORT_STATUS.PENDING;
  const targetLabel = TARGET_TYPE_MAP[report.targetType] || report.targetType;

  const { toast } = useToast();
  const [confirmTarget, setConfirmTarget] = useState<typeof REPORT_ACTION.DISMISS | typeof REPORT_ACTION.DELETE | null>(null);

  /* ── 답변 상태 ── */
  const [message, setMessage] = useState('');
  const [messageError, setMessageError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [intendedAction, setIntendedAction] = useState<typeof REPORT_ACTION.DISMISS | typeof REPORT_ACTION.DELETE | null>(null);

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
            createdAt: data.data.createdAt,
            parentId: data.data.parentId
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
  const executeProcess = async (actionType: typeof REPORT_ACTION.DISMISS | typeof REPORT_ACTION.DELETE) => {
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

  const handleProcessClick = (actionType: typeof REPORT_ACTION.DISMISS | typeof REPORT_ACTION.DELETE) => {
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
  const applyTemplate = (text: string, actionType: typeof REPORT_ACTION.DISMISS | typeof REPORT_ACTION.DELETE) => {
    setMessage(text);
    setMessageError('');
    setIntendedAction(actionType);
  };

  /* ── 아웃링크 계산 ── */
  const getOutlink = () => {
    if (report.targetType === TARGET_TYPE.POST) return `/community/${report.targetId}`;
    if (report.targetType === TARGET_TYPE.COMMENT && original?.parentId) return `/community/${original.parentId}`;
    if (report.targetType === TARGET_TYPE.REVIEW && original?.parentId) return `/festivals/${original.parentId}`;
    if (report.targetType === TARGET_TYPE.FESTIVAL) return `/festivals/${report.targetId}`;
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
                  🚨 {REPORT_REASON_LABELS[report.reason] || report.reason}
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
                   🔗 {report.targetType === TARGET_TYPE.COMMENT || report.targetType === TARGET_TYPE.REVIEW ? '원 게시글 바로가기' : '원문 바로가기'}
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
                <div 
                  className={s.originalContentScroll}
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(original.content) }}
                />
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
                  onClick={() => applyTemplate(`신고하신 콘텐츠를 확인한 결과, [${REPORT_REASON_LABELS[report.reason] || report.reason}] 사유가 명확히 확인되어 해당 ${targetLabel}을(를) 규제(숨김) 처리하였습니다. 건전한 커뮤니티 조성을 위한 신고에 진심으로 감사드립니다.`, REPORT_ACTION.DELETE)}
                  type="button"
                >
                  ✅ 콘텐츠 위반
                </button>
                <button
                  className={`${s.templateBtn} ${s.templateBtnReject}`}
                  onClick={() => applyTemplate(`접수해주신 [${REPORT_REASON_LABELS[report.reason] || report.reason}] 사유에 대해 면밀히 검토하였으나, 현재 커뮤니티 운영 정책상 명백한 위반 사항을 발견하기 어려워 부득이하게 신고를 반려 처리합니다. 추가적인 다른 문제가 있다면 언제든 다시 신고해 주시기 바랍니다.`, REPORT_ACTION.DISMISS)}
                  type="button"
                >
                  ↩️ 위반 없음
                </button>
                {originalDeleted && (
                  <button
                    className={`${s.templateBtn} ${s.templateBtnReject}`}
                    onClick={() => applyTemplate(`신고해주신 콘텐츠는 이미 작성자 본인 또는 다른 관리자에 의해 원문이 삭제 조치되었습니다. 추가적인 처리가 불필요함에 따라 본 신고 건은 종결(반려) 처리합니다. 건전한 커뮤니티 조성을 위한 신고에 진심으로 감사드립니다.`, REPORT_ACTION.DISMISS)}
                    type="button"
                    style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}
                  >
                    🗑️ 이미 삭제됨
                  </button>
                )}
              </div>

              {/* textarea */}
              <div className={s.responseArea}>
                <textarea
                  className={`${s.responseTextarea} ${messageError ? s.responseTextareaError : ''}`}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    setIntendedAction(null);
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
              <div className={`${s.historyCard} ${report.status === REPORT_STATUS.REJECTED ? s.historyCardRejected : ''}`}>
                <div className={s.historyMeta}>
                  <span className={`${s.historyStatus} ${report.status === REPORT_STATUS.RESOLVED ? s.historyStatusResolved : s.historyStatusRejected}`}>
                    {report.status === REPORT_STATUS.RESOLVED ? '✅ 처리완료' : '↩️ 반려'}
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
                  opacity: message.trim().length < 10 || intendedAction === REPORT_ACTION.DELETE ? 0.5 : 1,
                }}
                onClick={() => handleProcessClick(REPORT_ACTION.DISMISS)}
                disabled={processing || message.trim().length < 10 || intendedAction === REPORT_ACTION.DELETE}
              >
                {processing ? '처리 중...' : '신고 반려'}
              </button>
              <button
                className={common.btnDanger}
                style={{ opacity: message.trim().length < 10 || intendedAction === REPORT_ACTION.DISMISS ? 0.5 : 1 }}
                onClick={() => handleProcessClick(REPORT_ACTION.DELETE)}
                disabled={processing || message.trim().length < 10 || intendedAction === REPORT_ACTION.DISMISS}
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
            confirmTarget === REPORT_ACTION.DELETE
              ? `신고 대상 ${targetLabel}을(를) 정말 삭제하시겠습니까?\n(삭제 후에는 복구가 불가합니다.)`
              : '신고를 반려 처리하시겠습니까?'
          }
          confirmText={confirmTarget === REPORT_ACTION.DELETE ? '삭제' : '반려'}
          danger={confirmTarget === REPORT_ACTION.DELETE}
          onConfirm={() => executeProcess(confirmTarget)}
          onCancel={() => setConfirmTarget(null)}
        />
      )}
    </>
  );
}

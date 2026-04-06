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

/* ── 답변 템플릿 ── */
const TEMPLATES: { label: string; text: string }[] = [
  { label: '스팸', text: '신고하신 콘텐츠를 확인한 결과, 스팸성 콘텐츠로 판단되어 해당 콘텐츠를 삭제 처리하였습니다. 더 나은 서비스를 위해 노력하겠습니다.' },
  { label: '욕설', text: '신고하신 콘텐츠를 확인한 결과, 욕설·비방이 포함된 것으로 확인되어 해당 콘텐츠를 삭제 처리하였습니다.' },
  { label: '허위정보', text: '신고하신 콘텐츠를 확인한 결과, 사실과 다른 정보가 포함되어 있어 해당 콘텐츠를 삭제 처리하였습니다.' },
  { label: '정책위반없음', text: '신고하신 콘텐츠를 면밀히 검토한 결과, 현재 커뮤니티 정책에 위반되는 내용이 확인되지 않아 신고를 반려합니다. 추가 의견이 있으시면 다시 신고해주세요.' },
  { label: '기타', text: '신고해주셔서 감사합니다. 검토 결과, ' },
];

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
        // 원문 API가 준비되면 여기에 연결
        // const { data } = await adminApi.get(`/reports/${report.id}/target`);
        // setOriginal(data.data);
        // 현재는 미구현 — 삭제 상태로 표시
        setOriginalDeleted(true);
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

  return (
    <>
      <div className={s.modalWrap}>
        <Modal title={`🔍 신고 내용 확인 ${!isPending ? '(처리 완료)' : ''}`} size="large" onClose={onClose} closeOnOverlay={false}>
          <div className={s.modalBody}>
          {/* ── ① 신고 기본 정보 ── */}
          <div className={s.section}>
            <div className={s.sectionTitle}>
              <span className={s.sectionIcon}>📋</span> 신고 정보
            </div>
            <div className={s.infoGrid}>
              <span className={s.infoLabel}>신고 대상</span>
              <span className={s.infoValue}>
                <span className={`${common.statusBadge} ${common.badgeUpcoming}`} style={{ marginRight: 6 }}>
                  {targetLabel}
                </span>
                #{report.targetId}
              </span>

              <span className={s.infoLabel}>신고자</span>
              <span className={s.infoValue}>{report.reporterNickname}</span>

              <span className={s.infoLabel}>신고 사유</span>
              <span className={s.infoValue}>
                {REASON_MAP[report.reason] || report.reason}
              </span>

              <span className={s.infoLabel}>신고 일시</span>
              <span className={s.infoValue}>
                {report.createdAt?.replace('T', ' ').slice(0, 16)}
              </span>

              {report.description && (
                <>
                  <span className={`${s.infoLabel} ${s.infoFullRow}`}>상세 내용</span>
                  <span className={`${s.infoValue} ${s.infoFullRow}`}>{report.description}</span>
                </>
              )}
            </div>
          </div>

          <div className={s.divider} />

          {/* ── ② 신고 대상 원문 ── */}
          <div className={s.section}>
            <div className={s.sectionTitle}>
              <span className={s.sectionIcon}>📄</span> 신고 대상 원문
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
                <div className={s.originalContent}>{original.content}</div>
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

              {/* 템플릿 버튼 */}
              <div className={s.templateRow}>
                {TEMPLATES.map((t) => (
                  <button
                    key={t.label}
                    className={s.templateBtn}
                    onClick={() => applyTemplate(t.text)}
                    type="button"
                  >
                    {t.label}
                  </button>
                ))}
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

'use client';

import { useState } from 'react';
import common from '@/app/admin/_styles/admin-common.module.css';
import s from './MemberDetailModal.module.css';
import adminApi from '@/lib/adminApi';
import type { MemberItem } from '@/types/admin-member';

/* ── 상태 매핑 ── */
const STATUS_MAP: Record<string, { label: string; className: string }> = {
  ACTIVE:    { label: '정상 회원', className: 'badgeOngoing' },
  SUSPENDED: { label: '정지 회원', className: 'badgePending' },
  DELETED:   { label: '탈퇴 대기', className: 'badgeEnded' },
};

const ROLE_MAP: Record<string, string> = {
  USER:  '일반회원',
  ADMIN: '관리자',
};

/* ── Props ── */
interface Props {
  member: MemberItem;
  onClose: () => void;
  onStatusChanged: () => void;
}

export default function MemberDetailModal({ member, onClose, onStatusChanged }: Props) {
  const [processing, setProcessing] = useState(false);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  const isSuspended = member.status === 'SUSPENDED';
  const isDeleted = member.status === 'DELETED';
  const isActive = member.status === 'ACTIVE';

  /* ── 상태 변경 ── */
  const handleStatusChange = async (newStatus: string) => {
    setProcessing(true);
    try {
      await adminApi.patch(`/members/${member.userId}/status`, { status: newStatus });
      onStatusChanged();
    } catch (err) {
      console.error('상태 변경 실패:', err);
      alert('상태 변경에 실패했습니다.');
    } finally {
      setProcessing(false);
      setConfirmAction(null);
    }
  };

  return (
    <>
      {/* ── 모달 오버레이 ── */}
      <div className={common.modalOverlay} onClick={onClose}>
        <div className={common.modalContent} style={{ maxWidth: 600 }} onClick={(e) => e.stopPropagation()}>
          {/* ── 헤더 ── */}
          <div className={common.modalHeader}>
            <h2 className={common.modalTitle}>👤 회원 상세 정보</h2>
            <button className={common.modalCloseBtn} onClick={onClose}>✕</button>
          </div>

          <div className={s.modalBody}>
            {/* ── 프로필 카드 ── */}
            <div className={s.section}>
              <div className={s.profileCard}>
                {member.profileImage ? (
                  <img src={member.profileImage} alt="" className={s.profileImageLarge} />
                ) : (
                  <span className={s.profilePlaceholderLarge}>👤</span>
                )}
                <div className={s.profileInfo}>
                  <div className={s.profileNickname}>{member.nickname}</div>
                  <div className={s.profileEmail}>{member.loginId}</div>
                  <div className={s.profileBadges}>
                    <span className={`${common.statusBadge} ${member.role === 'ADMIN' ? common.badgeUpcoming : common.badgeDismissed}`}>
                      {ROLE_MAP[member.role] || member.role}
                    </span>
                    <span className={`${common.statusBadge} ${common[STATUS_MAP[member.status]?.className || 'badgeEnded'] || ''}`}>
                      {STATUS_MAP[member.status]?.label || member.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className={s.divider} />

            {/* ── 상세 정보 그리드 ── */}
            <div className={s.section}>
              <div className={s.sectionTitle}>
                <span className={s.sectionIcon}>📋</span> 기본 정보
              </div>
              <div className={s.infoGrid}>
                <div className={s.infoItem}>
                  <span className={s.infoLabel}>회원번호</span>
                  <span className={s.infoValue}>{member.userId}</span>
                </div>
                <div className={s.infoItem}>
                  <span className={s.infoLabel}>이름</span>
                  <span className={s.infoValue}>{member.name}</span>
                </div>
                <div className={s.infoItem}>
                  <span className={s.infoLabel}>닉네임</span>
                  <span className={s.infoValue}>{member.nickname}</span>
                </div>
                <div className={s.infoItem}>
                  <span className={s.infoLabel}>아이디</span>
                  <span className={s.infoValue}>{member.loginId}</span>
                </div>
                <div className={s.infoItem}>
                  <span className={s.infoLabel}>전화번호</span>
                  <span className={s.infoValue}>{member.phone || '-'}</span>
                </div>
                <div className={s.infoItem}>
                  <span className={s.infoLabel}>가입일</span>
                  <span className={s.infoValue}>{member.createdAt?.replace('T', ' ').slice(0, 16)}</span>
                </div>
                <div className={`${s.infoItem} ${member.reportedCount >= 3 ? s.reportHighlight : ''}`}>
                  <span className={s.infoLabel}>신고횟수</span>
                  <span className={`${s.infoValue} ${member.reportedCount >= 3 ? s.reportHighlightValue : ''}`}>
                    {member.reportedCount}건
                  </span>
                </div>
                {member.deletedAt && (() => {
                  const deletedDate = new Date(member.deletedAt);
                  const expiryDate = new Date(deletedDate);
                  expiryDate.setDate(expiryDate.getDate() + 30);
                  const today = new Date();
                  const diffTime = expiryDate.getTime() - today.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  const dDayText = diffDays > 0 ? `(완전 삭제 D-${diffDays})` : '(완전 삭제됨)';
                  
                  return (
                    <div className={s.infoItem} style={{ gridColumn: '1 / -1' }}>
                      <span className={s.infoLabel}>탈퇴 신청일</span>
                      <span className={s.infoValue}>
                        {member.deletedAt?.replace('T', ' ').slice(0, 16)}
                        <strong style={{ color: '#dc2626', marginLeft: 8, fontSize: 13 }}>{dDayText}</strong>
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className={s.divider} />

            {/* ── 확인 모달(인라인) ── */}
            {confirmAction && (
              <div className={s.section}>
                <div style={{
                  background: confirmAction === 'SUSPENDED' ? '#fef9c3' : '#dcfce7',
                  border: `1px solid ${confirmAction === 'SUSPENDED' ? '#fde68a' : '#bbf7d0'}`,
                  borderRadius: 10, padding: '16px 20px',
                  fontSize: 14, color: '#1e293b',
                }}>
                  <strong>
                    {confirmAction === 'SUSPENDED'
                      ? '⚠️ 이 회원을 정지하시겠습니까?'
                      : '✅ 이 회원의 정지를 해제하시겠습니까?'}
                  </strong>
                  <p style={{ margin: '8px 0 0', fontSize: 13, color: '#64748b' }}>
                    {confirmAction === 'SUSPENDED'
                      ? '정지된 회원은 서비스 이용이 제한됩니다.'
                      : '정지 해제 후 해당 회원은 다시 정상적으로 서비스를 이용할 수 있습니다.'}
                  </p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button
                      className={common.btnCancel}
                      style={{ padding: '6px 16px', fontSize: 12 }}
                      onClick={() => setConfirmAction(null)}
                    >
                      취소
                    </button>
                    <button
                      className={confirmAction === 'SUSPENDED' ? common.btnDanger : common.btnSubmit}
                      style={{ padding: '6px 16px', fontSize: 12 }}
                      disabled={processing}
                      onClick={() => handleStatusChange(confirmAction)}
                    >
                      {processing ? '처리 중...' : '확인'}
                    </button>
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
            {!isDeleted && !confirmAction && (
              <>
                {isActive && (
                  <button
                    className={common.btnDanger}
                    style={{ padding: '8px 20px', fontSize: 13 }}
                    onClick={() => setConfirmAction('SUSPENDED')}
                  >
                    회원 정지
                  </button>
                )}
                {isSuspended && (
                  <button
                    className={common.btnSubmit}
                    style={{ padding: '8px 20px', fontSize: 13 }}
                    onClick={() => setConfirmAction('ACTIVE')}
                  >
                    정지 해제
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

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

/* ── 확인 액션 타입 ── */
type ConfirmActionType = 'SUSPENDED' | 'ACTIVE' | 'DELETE' | 'ROLE_USER' | 'ROLE_ADMIN' | null;

export default function MemberDetailModal({ member, onClose, onStatusChanged }: Props) {
  const [processing, setProcessing] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmActionType>(null);

  const isSuspended = member.status === 'SUSPENDED';
  const isDeleted = member.status === 'DELETED';
  const isActive = member.status === 'ACTIVE';
  const canSuspend = isActive && member.reportedCount >= 4;

  /* ── 정지 해제 남은 일수 계산 ── */
  const getSuspensionRemainingDays = (): number | null => {
    if (!isSuspended || !member.suspendedUntil) return null;
    const until = new Date(member.suspendedUntil);
    const now = new Date();
    const diff = Math.ceil((until.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const remainingDays = getSuspensionRemainingDays();

  /* ── 상태 변경 (정지/해제) ── */
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

  /* ── 강제 탈퇴 ── */
  const handleDelete = async () => {
    setProcessing(true);
    try {
      await adminApi.delete(`/members/${member.userId}`);
      onStatusChanged();
    } catch (err) {
      console.error('강제 탈퇴 실패:', err);
      alert('강제 탈퇴에 실패했습니다.');
    } finally {
      setProcessing(false);
      setConfirmAction(null);
    }
  };

  /* ── 역할 변경 ── */
  const handleRoleChange = async (newRole: string) => {
    setProcessing(true);
    try {
      await adminApi.patch(`/members/${member.userId}/role`, { role: newRole });
      onStatusChanged();
    } catch (err) {
      console.error('역할 변경 실패:', err);
      alert('역할 변경에 실패했습니다.');
    } finally {
      setProcessing(false);
      setConfirmAction(null);
    }
  };

  /* ── 확인 액션 실행 ── */
  const executeConfirmAction = () => {
    if (!confirmAction) return;
    switch (confirmAction) {
      case 'SUSPENDED': handleStatusChange('SUSPENDED'); break;
      case 'ACTIVE': handleStatusChange('ACTIVE'); break;
      case 'DELETE': handleDelete(); break;
      case 'ROLE_USER': handleRoleChange('USER'); break;
      case 'ROLE_ADMIN': handleRoleChange('ADMIN'); break;
    }
  };

  /* ── 확인 모달 메시지 ── */
  const getConfirmMessage = () => {
    switch (confirmAction) {
      case 'SUSPENDED':
        return {
          title: '⚠️ 이 회원을 7일간 정지하시겠습니까?',
          desc: '정지된 회원은 서비스 이용이 제한됩니다. (신고 횟수: ' + member.reportedCount + '건)',
          bg: '#fef9c3', border: '#fde68a', btnClass: common.btnDanger,
        };
      case 'ACTIVE':
        return {
          title: '✅ 이 회원의 정지를 해제하시겠습니까?',
          desc: '정지 해제 후 해당 회원은 다시 정상적으로 서비스를 이용할 수 있습니다.',
          bg: '#dcfce7', border: '#bbf7d0', btnClass: common.btnSubmit,
        };
      case 'DELETE':
        return {
          title: '🚨 이 회원을 강제 탈퇴시키겠습니까?',
          desc: '강제 탈퇴된 회원은 더 이상 서비스를 이용할 수 없습니다. 이 작업은 되돌릴 수 없습니다.',
          bg: '#fef2f2', border: '#fecaca', btnClass: common.btnDanger,
        };
      case 'ROLE_USER':
        return {
          title: '🔄 이 회원을 일반 회원으로 변경하시겠습니까?',
          desc: '관리자 권한이 해제되어 관리자 페이지에 접근할 수 없게 됩니다.',
          bg: '#eff6ff', border: '#bfdbfe', btnClass: common.btnSubmit,
        };
      case 'ROLE_ADMIN':
        return {
          title: '🔄 이 회원에게 관리자 권한을 부여하시겠습니까?',
          desc: '관리자 권한이 부여되어 관리자 페이지에 접근할 수 있게 됩니다.',
          bg: '#eff6ff', border: '#bfdbfe', btnClass: common.btnSubmit,
        };
      default:
        return null;
    }
  };

  const confirmMsg = getConfirmMessage();

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
                <div className={`${s.infoItem} ${member.reportedCount >= 4 ? s.reportHighlight : member.reportedCount >= 2 ? s.reportWarning : ''}`}>
                  <span className={s.infoLabel}>신고횟수</span>
                  <span className={`${s.infoValue} ${member.reportedCount >= 4 ? s.reportHighlightValue : ''}`}>
                    {member.reportedCount}건
                    {member.reportedCount >= 4 && <span className={s.suspendBadge}>정지 가능</span>}
                  </span>
                </div>

                {/* ── 정지 중인 경우: 남은 일수 표시 ── */}
                {isSuspended && remainingDays !== null && (
                  <div className={`${s.infoItem} ${s.suspendedInfo}`} style={{ gridColumn: '1 / -1' }}>
                    <span className={s.infoLabel}>정지 해제일</span>
                    <span className={s.infoValue}>
                      {member.suspendedUntil?.replace('T', ' ').slice(0, 16)}
                      <strong style={{ color: '#dc2626', marginLeft: 8, fontSize: 13 }}>
                        {remainingDays > 0 ? `(D-${remainingDays})` : '(만료됨 — 수동 해제 필요)'}
                      </strong>
                    </span>
                  </div>
                )}

                {/* ── 탈퇴 신청일 표시 ── */}
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
            {confirmAction && confirmMsg && (
              <div className={s.section}>
                <div style={{
                  background: confirmMsg.bg,
                  border: `1px solid ${confirmMsg.border}`,
                  borderRadius: 10, padding: '16px 20px',
                  fontSize: 14, color: '#1e293b',
                }}>
                  <strong>{confirmMsg.title}</strong>
                  <p style={{ margin: '8px 0 0', fontSize: 13, color: '#64748b' }}>
                    {confirmMsg.desc}
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
                      className={confirmMsg.btnClass}
                      style={{ padding: '6px 16px', fontSize: 12 }}
                      disabled={processing}
                      onClick={executeConfirmAction}
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
                {/* ── 정지/해제 버튼 ── */}
                {isActive && canSuspend && (
                  <button
                    className={common.btnDanger}
                    style={{ padding: '8px 20px', fontSize: 13 }}
                    onClick={() => setConfirmAction('SUSPENDED')}
                  >
                    🚫 7일 정지
                  </button>
                )}
                {isActive && !canSuspend && (
                  <button
                    className={common.btnDanger}
                    style={{ padding: '8px 20px', fontSize: 13, opacity: 0.5, cursor: 'not-allowed' }}
                    disabled
                    title="신고 4건 이상일 때 정지할 수 있습니다"
                  >
                    🚫 정지 (신고 4건↑)
                  </button>
                )}
                {isSuspended && (
                  <button
                    className={common.btnSubmit}
                    style={{ padding: '8px 20px', fontSize: 13 }}
                    onClick={() => setConfirmAction('ACTIVE')}
                  >
                    ✅ 정지 해제
                  </button>
                )}

                {/* ── 역할 변경 버튼 ── */}
                {member.role === 'USER' ? (
                  <button
                    className={s.btnRole}
                    onClick={() => setConfirmAction('ROLE_ADMIN')}
                  >
                    👑 관리자 부여
                  </button>
                ) : (
                  <button
                    className={s.btnRole}
                    onClick={() => setConfirmAction('ROLE_USER')}
                  >
                    👤 일반 회원으로
                  </button>
                )}

                {/* ── 강제 탈퇴 버튼 ── */}
                <button
                  className={s.btnDeleteMember}
                  onClick={() => setConfirmAction('DELETE')}
                >
                  🗑️ 강제 탈퇴
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

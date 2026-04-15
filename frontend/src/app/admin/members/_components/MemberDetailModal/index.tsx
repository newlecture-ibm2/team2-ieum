'use client';

import { useState, useEffect } from 'react';
import common from '@/app/admin/_styles/admin-common.module.css';
import s from './MemberDetailModal.module.css';
import adminApi from '@/lib/adminApi';
import type { MemberItem } from '@/types/admin-member';
import { USER_STATUS, USER_ROLE } from '@/constants/userStatus';
import { useToast } from '@/_component/common/Toast';

/* ── 상태 매핑 ── */
const STATUS_MAP: Record<string, { label: string; className: string }> = {
  [USER_STATUS.ACTIVE]:    { label: '정상 회원', className: 'badgeOngoing' },
  [USER_STATUS.SUSPENDED]: { label: '정지 회원', className: 'badgePending' },
  [USER_STATUS.DELETED]:   { label: '탈퇴 대기', className: 'badgeEnded' },
};

const ROLE_MAP: Record<string, string> = {
  [USER_ROLE.USER]:  '일반회원',
  [USER_ROLE.ADMIN]: '관리자',
};

/* ── 가입 방식(provider) 표시 매핑 ── */
const PROVIDER_MAP: Record<string, { label: string; color: string; bg: string }> = {
  KAKAO:  { label: '카카오 가입', color: '#3B1C0C', bg: '#FEE500' },
  NAVER:  { label: '네이버 가입', color: '#fff',    bg: '#03C75A' },
  GOOGLE: { label: '구글 가입',   color: '#fff',    bg: '#4285F4' },
};

/* ── Props ── */
interface Props {
  member: MemberItem;
  onClose: () => void;
  onStatusChanged: () => void;
}

/* ── 확인 액션 타입 ── */
type ConfirmActionType = 'SUSPENDED' | 'ACTIVE' | 'DELETE' | 'DELETE_FINAL' | 'ROLE_USER' | 'ROLE_ADMIN' | null;

export default function MemberDetailModal({ member, onClose, onStatusChanged }: Props) {
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmActionType>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const isSuspended = member.status === USER_STATUS.SUSPENDED;
  const isDeleted = member.status === USER_STATUS.DELETED;
  const isActive = member.status === USER_STATUS.ACTIVE;
  const canSuspend = isActive && member.reportedCount >= 4;

  /* ── 현재 로그인 사용자 정보 가져오기 ── */
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.isLoggedIn && data.user?.userId) {
          setCurrentUserId(data.user.userId);
        }
      })
      .catch(() => {});
  }, []);

  /* ── 자기 자신 또는 관리자 대상 차단 판정 ── */
  const isSelf = currentUserId !== null && currentUserId === member.userId;
  const isTargetAdmin = member.role === USER_ROLE.ADMIN;
  const isProtected = isSelf || isTargetAdmin;

  /* ── 차단 사유 메시지 ── */
  const getBlockReasonMessage = (): string | null => {
    if (isSelf) return '자기 자신에 대해서는 수행할 수 없습니다.';
    if (isTargetAdmin) return '관리자 계정에 대해서는 수행할 수 없습니다.';
    return null;
  };

  /* ── 보호 대상 클릭 시 알림 ── */
  const handleProtectedClick = () => {
    const reason = getBlockReasonMessage();
    if (reason) toast(reason, 'warning');
  };

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
      const res = await adminApi.patch(`/members/${member.userId}/status`, { status: newStatus });
      if (res.data?.success === false) {
        toast(res.data?.error?.message || '상태 변경에 실패했습니다.', 'error');
        return;
      }
      onStatusChanged();
    } catch (err: any) {
      const errMsg = err?.response?.data?.error?.message || '상태 변경에 실패했습니다.';
      console.error('상태 변경 실패:', err);
      toast(errMsg, 'error');
    } finally {
      setProcessing(false);
      setConfirmAction(null);
    }
  };

  /* ── 강제 탈퇴 ── */
  const handleDelete = async () => {
    setProcessing(true);
    try {
      const res = await adminApi.delete(`/members/${member.userId}`);
      if (res.data?.success === false) {
        toast(res.data?.error?.message || '강제 탈퇴에 실패했습니다.', 'error');
        return;
      }
      onStatusChanged();
    } catch (err: any) {
      const errMsg = err?.response?.data?.error?.message || '강제 탈퇴에 실패했습니다.';
      console.error('강제 탈퇴 실패:', err);
      toast(errMsg, 'error');
    } finally {
      setProcessing(false);
      setConfirmAction(null);
    }
  };

  /* ── 역할 변경 ── */
  const handleRoleChange = async (newRole: string) => {
    setProcessing(true);
    try {
      const res = await adminApi.patch(`/members/${member.userId}/role`, { role: newRole });
      if (res.data?.success === false) {
        toast(res.data?.error?.message || '역할 변경에 실패했습니다.', 'error');
        return;
      }
      onStatusChanged();
    } catch (err: any) {
      const errMsg = err?.response?.data?.error?.message || '역할 변경에 실패했습니다.';
      console.error('역할 변경 실패:', err);
      toast(errMsg, 'error');
    } finally {
      setProcessing(false);
      setConfirmAction(null);
    }
  };

  /* ── 확인 액션 실행 ── */
  const executeConfirmAction = () => {
    if (!confirmAction) return;
    switch (confirmAction) {
      case 'SUSPENDED': handleStatusChange(USER_STATUS.SUSPENDED); break;
      case 'ACTIVE': handleStatusChange(USER_STATUS.ACTIVE); break;
      case 'DELETE':
        // 1차 확인 → 2차 확인으로 전환
        setConfirmAction('DELETE_FINAL');
        break;
      case 'DELETE_FINAL':
        // 2차 최종 확인 → 실행
        handleDelete();
        break;
      case 'ROLE_USER': handleRoleChange(USER_ROLE.USER); break;
      case 'ROLE_ADMIN': handleRoleChange(USER_ROLE.ADMIN); break;
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
          btnText: '확인',
        };
      case 'ACTIVE':
        return {
          title: '✅ 이 회원의 정지를 해제하시겠습니까?',
          desc: '정지 해제 후 해당 회원은 다시 정상적으로 서비스를 이용할 수 있습니다.',
          bg: '#dcfce7', border: '#bbf7d0', btnClass: common.btnSubmit,
          btnText: '확인',
        };
      case 'DELETE':
        return {
          title: '🚨 정말 이 회원을 강제 탈퇴 처리하시겠습니까?',
          desc: '이 작업은 되돌리기 어렵습니다. 다음 단계에서 최종 확인이 필요합니다.',
          bg: '#fef2f2', border: '#fecaca', btnClass: common.btnDanger,
          btnText: '다음 단계로',
        };
      case 'DELETE_FINAL':
        return {
          title: '🔴 최종 확인: 강제 탈퇴를 실행합니다',
          desc: `"${member.nickname}" (${member.loginId}) 회원의 모든 데이터가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.`,
          bg: '#450a0a', border: '#dc2626', btnClass: common.btnDanger,
          btnText: '강제 탈퇴 실행',
          isDark: true,
        };
      case 'ROLE_USER':
        return {
          title: '🔄 이 회원을 일반 회원으로 변경하시겠습니까?',
          desc: '관리자 권한이 해제되어 관리자 페이지에 접근할 수 없게 됩니다.',
          bg: '#eff6ff', border: '#bfdbfe', btnClass: common.btnSubmit,
          btnText: '확인',
        };
      case 'ROLE_ADMIN':
        return {
          title: '🔄 이 회원에게 관리자 권한을 부여하시겠습니까?',
          desc: '관리자 권한이 부여되어 관리자 페이지에 접근할 수 있게 됩니다.',
          bg: '#eff6ff', border: '#bfdbfe', btnClass: common.btnSubmit,
          btnText: '확인',
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
                  <div className={s.profileNickname}>
                    {(member.provider && member.provider !== 'LOCAL') ? (
                      <span style={{
                        fontSize: 12, fontWeight: 600,
                        background: '#f1f5f9', color: '#64748b',
                        padding: '2px 10px', borderRadius: 10,
                      }}>
                        소셜 가입자
                      </span>
                    ) : (
                      member.nickname
                    )}
                    {isSelf && (
                      <span style={{
                        marginLeft: 8, fontSize: 11, background: '#3b82f6',
                        color: '#fff', padding: '2px 8px', borderRadius: 10,
                      }}>
                        나
                      </span>
                    )}
                  </div>
                  <div className={s.profileEmail}>
                    {(!member.provider || member.provider === 'LOCAL')
                      ? member.loginId
                      : (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          fontSize: 11, fontWeight: 600,
                          background: PROVIDER_MAP[member.provider]?.bg || '#e2e8f0',
                          color: PROVIDER_MAP[member.provider]?.color || '#334155',
                          padding: '2px 10px', borderRadius: 12,
                        }}>
                          {PROVIDER_MAP[member.provider]?.label || member.provider}
                        </span>
                      )
                    }
                  </div>
                  <div className={s.profileBadges}>
                    <span className={`${common.statusBadge} ${member.role === USER_ROLE.ADMIN ? common.badgeUpcoming : common.badgeDismissed}`}>
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

            {/* ── 보호 대상 안내 배너 ── */}
            {isProtected && !isDeleted && (
              <div className={s.section}>
                <div style={{
                  background: isSelf ? '#eff6ff' : '#fefce8',
                  border: `1px solid ${isSelf ? '#93c5fd' : '#fde68a'}`,
                  borderRadius: 10, padding: '12px 16px',
                  fontSize: 13, color: '#1e293b',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span style={{ fontSize: 16 }}>{isSelf ? '🔒' : '🛡️'}</span>
                  <span>
                    {isSelf
                      ? '본인 계정입니다. 상태 변경, 권한 변경, 강제 탈퇴가 제한됩니다.'
                      : '관리자 계정입니다. 상태 변경, 권한 변경, 강제 탈퇴가 제한됩니다.'}
                  </span>
                </div>
              </div>
            )}

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
                  <span className={s.infoValue}>
                    {(member.provider && member.provider !== 'LOCAL') ? (
                      <span style={{
                        fontSize: 12, fontWeight: 600,
                        background: '#f1f5f9', color: '#64748b',
                        padding: '2px 10px', borderRadius: 10,
                      }}>
                        소셜 가입자
                      </span>
                    ) : (
                      member.nickname
                    )}
                  </span>
                </div>
                {(!member.provider || member.provider === 'LOCAL') ? (
                  <div className={s.infoItem}>
                    <span className={s.infoLabel}>아이디</span>
                    <span className={s.infoValue}>{member.loginId}</span>
                  </div>
                ) : (
                  <div className={s.infoItem}>
                    <span className={s.infoLabel}>로그인 방식</span>
                    <span className={s.infoValue}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontSize: 12, fontWeight: 600,
                        background: PROVIDER_MAP[member.provider]?.bg || '#e2e8f0',
                        color: PROVIDER_MAP[member.provider]?.color || '#334155',
                        padding: '2px 12px', borderRadius: 12,
                      }}>
                        {PROVIDER_MAP[member.provider]?.label || member.provider}
                      </span>
                    </span>
                  </div>
                )}
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
                  background: (confirmMsg as any).isDark ? confirmMsg.bg : confirmMsg.bg,
                  border: `1px solid ${confirmMsg.border}`,
                  borderRadius: 10, padding: '16px 20px',
                  fontSize: 14,
                  color: (confirmMsg as any).isDark ? '#fecaca' : '#1e293b',
                }}>
                  <strong style={(confirmMsg as any).isDark ? { color: '#fca5a5' } : undefined}>
                    {confirmMsg.title}
                  </strong>
                  <p style={{
                    margin: '8px 0 0', fontSize: 13,
                    color: (confirmMsg as any).isDark ? '#fca5a5' : '#64748b',
                  }}>
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
                      {processing ? '처리 중...' : confirmMsg.btnText}
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
                {isActive && canSuspend && !isProtected && (
                  <button
                    className={common.btnDanger}
                    style={{ padding: '8px 20px', fontSize: 13 }}
                    onClick={() => setConfirmAction('SUSPENDED')}
                  >
                    🚫 7일 정지
                  </button>
                )}
                {isActive && canSuspend && isProtected && (
                  <button
                    className={common.btnDanger}
                    style={{ padding: '8px 20px', fontSize: 13, opacity: 0.4, cursor: 'not-allowed' }}
                    disabled
                    title={getBlockReasonMessage() || ''}
                    onClick={handleProtectedClick}
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
                {isSuspended && !isProtected && (
                  <button
                    className={common.btnSubmit}
                    style={{ padding: '8px 20px', fontSize: 13 }}
                    onClick={() => setConfirmAction('ACTIVE')}
                  >
                    ✅ 정지 해제
                  </button>
                )}
                {isSuspended && isProtected && (
                  <button
                    className={common.btnSubmit}
                    style={{ padding: '8px 20px', fontSize: 13, opacity: 0.4, cursor: 'not-allowed' }}
                    disabled
                    title={getBlockReasonMessage() || ''}
                  >
                    ✅ 정지 해제
                  </button>
                )}

                {/* ── 역할 변경 버튼 ── */}
                {!isProtected ? (
                  member.role === USER_ROLE.USER ? (
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
                  )
                ) : (
                  <button
                    className={s.btnRole}
                    style={{ opacity: 0.4, cursor: 'not-allowed' }}
                    disabled
                    title={getBlockReasonMessage() || ''}
                  >
                    {member.role === USER_ROLE.USER ? '👑 관리자 부여' : '👤 일반 회원으로'}
                  </button>
                )}

                {/* ── 강제 탈퇴 버튼 ── */}
                {!isProtected ? (
                  <button
                    className={s.btnDeleteMember}
                    onClick={() => setConfirmAction('DELETE')}
                  >
                    🗑️ 강제 탈퇴
                  </button>
                ) : (
                  <button
                    className={s.btnDeleteMember}
                    style={{ opacity: 0.4, cursor: 'not-allowed' }}
                    disabled
                    title={getBlockReasonMessage() || ''}
                  >
                    🗑️ 강제 탈퇴
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

"use client";

import React, { useState } from 'react';
import { Modal } from '@/_component/common/Modal';
import { useToast } from '@/_component/common/Toast';
import api from '@/lib/api';
import styles from './ReportModal.module.css';
import { REPORT_REASON, REPORT_REASON_OPTIONS } from '@/constants/reportOptions';
import { TARGET_TYPE } from '@/constants/targetType';

interface ReportModalProps {
  targetId: number | string;
  targetType?: typeof TARGET_TYPE.POST | typeof TARGET_TYPE.COMMENT; // 기본값은 'POST'로 처리
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReportModal({ targetId, targetType = TARGET_TYPE.POST, onClose, onSuccess }: ReportModalProps) {
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const { toast } = useToast();

  const handleReport = async () => {
    try {
      await api.post('/api/reports', {
        targetType: targetType,
        targetId: Number(targetId),
        reason: reportReason,
        description: reportReason === REPORT_REASON.OTHER ? reportDescription : null,
      });
      toast('신고가 접수되었습니다.', 'success');
      onSuccess();
    } catch (err: unknown) {
      const errorObj = err as { response?: { status?: number; data?: { message?: string } } };
      const status = errorObj?.response?.status;
      if (status === 409) {
        toast(`이미 신고한 ${targetType === TARGET_TYPE.COMMENT ? '댓글' : '게시글'}입니다.`, 'info');
        onSuccess();
      } else {
        const msg = errorObj?.response?.data?.message || '신고 접수에 실패했습니다.';
        toast(msg, 'error');
      }
    } finally {
      onClose();
    }
  };

  return (
    <Modal title={targetType === TARGET_TYPE.COMMENT ? '댓글 신고' : '게시글 신고'} size="small" onClose={onClose}>
      <div className={styles.reportModal}>
        <p className={styles.reportDesc}>신고 사유를 선택해주세요.</p>
        <div className={styles.reportOptions}>
          {REPORT_REASON_OPTIONS.map(opt => (
            <label key={opt.value} className={styles.reportOption}>
              <input
                type="radio"
                name="reportReason"
                value={opt.value}
                checked={reportReason === opt.value}
                onChange={e => setReportReason(e.target.value)}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
        {reportReason === REPORT_REASON.OTHER && (
          <textarea
            className={styles.reportTextarea}
            placeholder="상세 사유를 입력해주세요 (최대 500자)"
            maxLength={500}
            value={reportDescription}
            onChange={e => setReportDescription(e.target.value)}
          />
        )}
        <div className={styles.reportActions}>
          <button className={styles.btnCancel} onClick={onClose}>
            취소
          </button>
          <button
            className={styles.btnReport}
            disabled={!reportReason}
            onClick={handleReport}
          >
            신고하기
          </button>
        </div>
      </div>
    </Modal>
  );
}

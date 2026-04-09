import { useState } from 'react';
import { useToast } from '@/_component/common/Toast';
import adminApi from '@/lib/adminApi';
import type { AdminNoticeItem } from '@/types/admin-notice';

interface UseNoticeFormProps {
  mode: 'create' | 'edit';
  notice: AdminNoticeItem | null;
  onSaved: () => void;
}

export function useNoticeForm({ mode, notice, onSaved }: UseNoticeFormProps) {
  const isEdit = mode === 'edit' && notice !== null;
  const { toast } = useToast();

  // 폼 상태
  const [title, setTitle] = useState(isEdit ? notice!.title : '');
  const [content, setContent] = useState(isEdit ? notice!.content : '');
  const [summary, setSummary] = useState(isEdit ? (notice!.summary || '') : '');
  const [isPinned, setIsPinned] = useState(isEdit ? notice!.isPinned : false);
  const [isPopup, setIsPopup] = useState(isEdit ? notice!.isPopup : false);
  const [isActive, setIsActive] = useState(isEdit ? notice!.isActive : true);
  const [sendPush, setSendPush] = useState(isEdit ? notice!.isPushed : false);
  const [startDate, setStartDate] = useState(isEdit ? (notice!.startDate?.slice(0, 16) || '') : '');
  const [endDate, setEndDate] = useState(isEdit ? (notice!.endDate?.slice(0, 16) || '') : '');
  const [files, setFiles] = useState<File[]>([]);

  // 에러 및 진행 상태
  const [titleError, setTitleError] = useState('');
  const [contentError, setContentError] = useState('');
  const [processing, setProcessing] = useState(false);

  const validate = (): boolean => {
    let valid = true;
    if (!title.trim()) {
      setTitleError('제목을 입력해주세요.');
      valid = false;
    } else {
      setTitleError('');
    }
    if (!content.trim()) {
      setContentError('내용을 입력해주세요.');
      valid = false;
    } else if (content.trim().length < 5) {
      setContentError('내용은 최소 5자 이상 작성해주세요.');
      valid = false;
    } else {
      setContentError('');
    }
    return valid;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', content.trim());
      if (summary.trim()) formData.append('summary', summary.trim());
      formData.append('isPinned', String(isPinned));
      formData.append('isPopup', String(isPopup));
      formData.append('isActive', String(isActive));
      formData.append('sendPush', String(sendPush));
      if (startDate) formData.append('startDate', startDate.length === 16 ? `${startDate}:00` : startDate);
      if (endDate) formData.append('endDate', endDate.length === 16 ? `${endDate}:00` : endDate);
      
      const fileKey = isEdit ? 'newFiles' : 'files';
      files.forEach((file) => formData.append(fileKey, file));

      if (isEdit) {
        await adminApi.put(`/notices/${notice!.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast('공지사항이 수정되었습니다.', 'success');
      } else {
        await adminApi.post('/notices', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast('공지사항이 작성되었습니다.', 'success');
      }
      onSaved();
    } catch (err: unknown) {
      console.error('공지사항 저장 실패:', err);
      type BackendError = { response?: { data?: { error?: { message?: string } } } };
      const msg = (err as BackendError)?.response?.data?.error?.message || '저장 중 오류가 발생했습니다.';
      toast(msg, 'error');
    } finally {
      setProcessing(false);
    }
  };

  return {
    isEdit,
    formState: {
      title, setTitle,
      content, setContent,
      summary, setSummary,
      isPinned, setIsPinned,
      isPopup, setIsPopup,
      isActive, setIsActive,
      sendPush, setSendPush,
      startDate, setStartDate,
      endDate, setEndDate,
      files, setFiles
    },
    errors: {
      titleError, setTitleError,
      contentError, setContentError
    },
    processing,
    handleSubmit
  };
}

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type ReactQuill from 'react-quill-new';
import { useToast } from '@/_component/common/Toast';
import adminApi from '@/lib/adminApi';
import api from '@/lib/api';
import type { AdminNoticeItem } from '@/types/admin-notice';

interface UseNoticeFormProps {
  mode: 'create' | 'edit';
  notice: AdminNoticeItem | null;
  onSaved: () => void;
}

export function useNoticeForm({ mode, notice, onSaved }: UseNoticeFormProps) {
  const isEdit = mode === 'edit' && notice !== null;
  const { toast } = useToast();
  const quillRefHolder = useRef<ReactQuill | null>(null);

  // 폼 상태
  const [title, setTitle] = useState(isEdit ? notice!.title : '');
  const [content, setContent] = useState(isEdit ? notice!.content : '');
  const [summary, setSummary] = useState(isEdit ? (notice!.summary || '') : '');
  const [category, setCategory] = useState<string>(isEdit ? (notice!.category || 'GENERAL') : 'GENERAL');
  const [isPinned, setIsPinned] = useState(isEdit ? notice!.isPinned : false);
  const [isPopup, setIsPopup] = useState(isEdit ? notice!.isPopup : false);
  const [isActive, setIsActive] = useState(isEdit ? notice!.isActive : true);
  const [sendPush, setSendPush] = useState(isEdit ? notice!.isPushed : false);
  const [startDate, setStartDate] = useState(isEdit ? (notice!.startDate?.slice(0, 16) || '') : '');
  const [endDate, setEndDate] = useState(isEdit ? (notice!.endDate?.slice(0, 16) || '') : '');
  const [files, setFiles] = useState<File[]>([]);
  
  // 기존 업로드된 첨부파일 (수정 모드일 때 조회)
  const [existingFiles, setExistingFiles] = useState<{ id: number; fileName: string; fileSize?: number }[]>([]);
  const [deleteFileIds, setDeleteFileIds] = useState<number[]>([]);

  // 에러 및 진행 상태
  const [titleError, setTitleError] = useState('');
  const [contentError, setContentError] = useState('');
  const [processing, setProcessing] = useState(false);

  // 수정 모드이면 기존 첨부파일 목록 불러오기
  useEffect(() => {
    if (isEdit && notice?.id) {
      api.get(`/api/attachments?targetType=NOTICE&targetId=${notice.id}`)
        .then(res => {
          setExistingFiles(res.data.data || []);
        })
        .catch(err => {
          console.error("기존 첨부파일 로드 실패:", err);
        });
    }
  }, [isEdit, notice?.id]);

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
      formData.append('category', category);
      if (startDate) formData.append('startDate', startDate.length === 16 ? `${startDate}:00` : startDate);
      if (endDate) formData.append('endDate', endDate.length === 16 ? `${endDate}:00` : endDate);
      
      const fileKey = isEdit ? 'newFiles' : 'files';
      files.forEach((file) => formData.append(fileKey, file));

      // 삭제할 파일이 있다면 (수정 모드)
      if (isEdit && deleteFileIds.length > 0) {
        deleteFileIds.forEach(id => formData.append('deleteFileIds', String(id)));
      }

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

  // Quill 에디터 이미지 핸들러
  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await api.post('/api/attachments?targetType=NOTICE&targetId=0', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (res.data?.success) {
          const attachmentId = res.data.data.id;
          const url = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/attachments/${attachmentId}/download`;

          const quill = quillRefHolder.current?.getEditor();
          if (quill) {
            const range = quill.getSelection(true);
            quill.insertEmbed(range.index, 'image', url);
            quill.setSelection(range.index + 1);
          }
        } else {
          toast('이미지 업로드에 실패했습니다.', 'error');
        }
      } catch (err) {
        console.error(err);
        toast('이미지 업로드 중 오류가 발생했습니다.', 'error');
      }
    };
  }, [toast]);

  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image'],
        ['clean'],
      ],
      handlers: {
        image: imageHandler,
      },
    },
  }), [imageHandler]);

  return {
    isEdit,
    quillRefHolder,
    quillModules,
    formState: {
      title, setTitle,
      content, setContent,
      summary, setSummary,
      category, setCategory,
      isPinned, setIsPinned,
      isPopup, setIsPopup,
      isActive, setIsActive,
      sendPush, setSendPush,
      startDate, setStartDate,
      endDate, setEndDate,
      files, setFiles,
      existingFiles, setExistingFiles,
      deleteFileIds, setDeleteFileIds
    },
    errors: {
      titleError, setTitleError,
      contentError, setContentError
    },
    processing,
    handleSubmit
  };
}

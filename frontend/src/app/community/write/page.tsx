'use client';

import { useState, useEffect, Suspense, useRef, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ImagePlus, X } from 'lucide-react';
import api from '@/lib/api';
import { CATEGORY_OPTIONS, REGION_OPTIONS } from '@/constants/filterOptions';
import { useToast } from '@/_component/common/Toast';
import { USER_STATUS } from '@/constants/userStatus';
import { ConfirmModal } from '@/_component/common/Modal';
import Dropdown from '@/_component/common/Dropdown';
import 'react-quill-new/dist/quill.snow.css';
import styles from './write.module.css';

const ReactQuill = dynamic(async () => {
  const { default: RQ } = await import('react-quill-new');
  return function Comp({ forwardedRef, ...props }: any) {
    return <RQ ref={forwardedRef} {...props} />;
  };
}, {
  ssr: false,
  loading: () => <div style={{ height: '260px', padding: '16px', border: '1px solid #cbd5e1', borderRadius: '8px' }}>에디터를 불러오는 중입니다...</div>
});

function CommunityWriteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [authChecked, setAuthChecked] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);
  const quillRef = useRef<any>(null);

  // 커스텀 이미지 핸들러 - 에디터 툴바에서 이미지 아이콘 클릭 시 동작
  const imageHandler = () => {
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
        // 백엔드 Attachment API 호출 (에디터 내 인라인 삽입용 사진은 임시로 targetId=0으로 저장)
        const res = await api.post(`/api/attachments?targetType=POST&targetId=0`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        
        if (res.data && res.data.success) {
          const attachmentId = res.data.data.id;
          const url = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/attachments/${attachmentId}/download`;
          
          const quill = quillRef.current?.getEditor();
          if (quill) {
            const range = quill.getSelection(true);
            quill.insertEmbed(range.index, 'image', url);
            quill.setSelection(range.index + 1);
          }
        } else {
          toast('에디터 내 이미지 업로드에 실패했습니다.', 'error');
        }
      } catch (err) {
        console.error(err);
        toast('에디터 내 이미지 업로드 중 오류가 발생했습니다.', 'error');
      }
    };
  };

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
  }), []);

  // 수정 모드 판별
  const editPostId = searchParams.get('edit');
  const isEditMode = !!editPostId;
  const [editLoading, setEditLoading] = useState(isEditMode);

  // 로그인 체크 — 미로그인 시 모달 표시
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.isLoggedIn) {
          setShowLoginModal(true);
        } else if (data.user?.status === USER_STATUS.SUSPENDED) {
          setIsSuspended(true);
          setAuthChecked(true);
        } else {
          setAuthChecked(true);
        }
      })
      .catch(() => {
        setShowLoginModal(true);
      });
  }, []);

  const [category, setCategory] = useState('');
  const [areaCode, setAreaCode] = useState('');
  const [festivalName, setFestivalName] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 수정 모드: 기존 게시글 데이터 불러오기
  useEffect(() => {
    if (!isEditMode || !authChecked) return;

    const fetchPost = async () => {
      try {
        const res = await api.get(`/api/community/posts/${editPostId}`);
        if (res.data.success) {
          const post = res.data.data;
          setCategory(post.category || '');
          setAreaCode(post.areaCode || '');
          setFestivalName(post.festivalName || '');
          setTitle(post.title || '');
          setContent(post.content || '');
        }
      } catch (err) {
        console.error(err);
        toast('게시글 정보를 불러오는 데 실패했습니다.', 'error');
        router.replace('/community');
      } finally {
        setEditLoading(false);
      }
    };

    fetchPost();
  }, [isEditMode, authChecked, editPostId]);

  const handleSubmit = async () => {
    if (!category || !title.trim() || !content.trim()) {
      toast('말머리, 제목, 내용은 필수 입력 항목입니다.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        category,
        areaCode: areaCode || null,
        festivalName: festivalName.trim() || null,
        title: title.trim(),
        content: content.trim()
      };

      if (isEditMode) {
        // 수정 모드: PUT API 호출
        const res = await api.put(`/api/community/posts/${editPostId}`, payload);
        if (res.data && res.data.success) {
          toast('게시글이 수정되었습니다!', 'success');
          router.push(`/community/${editPostId}`);
        } else {
          toast('게시글 수정에 실패했습니다.', 'error');
        }
      } else {
        // 작성 모드: POST API 호출
        const res = await api.post('/api/community/posts', payload);
        if (res.data && res.data.success) {
          toast('게시글이 등록되었습니다!', 'success');
          router.push('/community');
        } else {
          toast('게시글 등록에 실패했습니다.', 'error');
        }
      }
    } catch (err: unknown) {
      console.error(err);
      toast(isEditMode ? '게시글 수정 중 오류가 발생했습니다.' : '게시글 등록 중 오류가 발생했습니다.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // 인증 확인 전에는 폼을 보여주지 않음
  if (!authChecked) {
    return (
      <>
        <div style={{ textAlign: 'center', padding: '100px 0', color: '#94a3b8' }}>로그인 확인 중...</div>
        {showLoginModal && (
          <ConfirmModal
            message={"로그인이 필요한 기능입니다.\n로그인 페이지로 이동하시겠습니까?"}
            confirmText="로그인"
            onConfirm={() => router.replace('/login')}
            onCancel={() => router.replace('/community')}
          />
        )}
      </>
    );
  }

  // 정지 회원은 글쓰기/수정 불가
  if (isSuspended) {
    return (
      <main style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h2 style={{ color: '#ef4444', marginBottom: '12px' }}>활동 정지 안내</h2>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>
          활동이 정지된 계정입니다. 정지 해제 후 게시글을 작성할 수 있습니다.
        </p>
        <button
          style={{
            padding: '10px 24px',
            borderRadius: '8px',
            border: 'none',
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
          }}
          onClick={() => router.replace('/community')}
        >
          커뮤니티로 돌아가기
        </button>
      </main>
    );
  }

  // 수정 모드에서 데이터 로딩 중
  if (editLoading) {
    return <div style={{ textAlign: 'center', padding: '100px 0', color: '#94a3b8' }}>게시글 정보를 불러오는 중...</div>;
  }

  return (
    <main className={styles.writeContainer}>
      {/* 히어로 배너 */}
      <div className={styles.heroBanner}>
        <div className={styles.heroInner}>
          <div className={styles.heroTitle}>{isEditMode ? '게시글 수정' : '게시글 작성'}</div>
          <div className={styles.heroSub}>
            {isEditMode ? '게시글 내용을 수정하세요 ✏️' : '커뮤니티에 새로운 글을 작성해 보세요 ✍️'}
          </div>
        </div>
      </div>

      {/* 폼 영역 */}
      <div className={styles.formContainer}>
        <h2 className={styles.formHeader}>{isEditMode ? '게시글 수정' : '게시글 작성'}</h2>

        {/* 말머리 + 지역 (2열) */}
        <div className={styles.formMultiCols}>
          <div className={styles.formRow}>
            <label className={styles.formLabel}>
              말머리<span className={styles.req}>*</span>
            </label>
            <Dropdown
              options={CATEGORY_OPTIONS.map(opt => ({ value: opt.value, label: opt.label, disabled: opt.value === '' }))}
              value={category}
              onChange={(v) => setCategory(v)}
              ariaLabel="말머리 선택"
              fullWidth
            />
          </div>

          <div className={styles.formRow}>
            <label className={styles.formLabel}>지역 분류</label>
            <Dropdown
              options={REGION_OPTIONS.map(opt => ({ value: opt.value, label: opt.label }))}
              value={areaCode}
              onChange={(v) => setAreaCode(v)}
              ariaLabel="지역 선택"
              fullWidth
            />
          </div>
        </div>

        {/* 연관 축제 */}
        <div className={styles.formRow}>
          <label className={styles.formLabel}>연관 축제명</label>
          <input
            type="text"
            className={styles.formInput}
            placeholder="어떤 축제와 관련된 글인가요? (예: 진해군항제)"
            value={festivalName}
            onChange={e => setFestivalName(e.target.value)}
            maxLength={100}
          />
        </div>

        {/* 제목 */}
        <div className={styles.formRow}>
          <label className={styles.formLabel}>
            제목<span className={styles.req}>*</span>
          </label>
          <input
            type="text"
            className={styles.formInput}
            placeholder="게시글 제목을 입력하세요"
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={200}
          />
          <span className={styles.countLabel}>
            {title.length} / 200
          </span>
        </div>

        {/* 내용 */}
        <div className={styles.formRow}>
          <label className={styles.formLabel}>
            내용<span className={styles.req}>*</span>
          </label>
          <div className={styles.quillWrapper}>
            <ReactQuill
              forwardedRef={quillRef}
              theme="snow"
              value={content}
              onChange={(val: string) => setContent(val)}
              modules={quillModules}
              placeholder="게시글 내용을 작성하고 사진 버튼을 눌러 이미지를 첨부해보세요! (10자 이상 5000자 이내 최소 텍스트 작성)"
            />
          </div>
          <span className={styles.countLabel}>
            {content.replace(/<[^>]*>?/gm, '').length} / 5000 (태그 제외 텍스트 길이)
          </span>
        </div>



        {/* 하단 버튼 */}
        <div className={styles.formActions}>
          <button
            type="button"
            className={styles.btnCancel}
            onClick={() => router.back()}
          >
            취소
          </button>
          <button
            type="button"
            className={styles.btnSave}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting
              ? (isEditMode ? '수정 중...' : '등록 중...')
              : (isEditMode ? '수정' : '등록')
            }
          </button>
        </div>
      </div>
    </main>
  );
}

export default function CommunityWritePage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '100px 0', color: '#94a3b8' }}>데이터를 불러오는 중입니다...</div>}>
      <CommunityWriteContent />
    </Suspense>
  );
}

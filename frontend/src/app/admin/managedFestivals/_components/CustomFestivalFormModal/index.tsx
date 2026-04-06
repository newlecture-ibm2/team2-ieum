'use client';

import { useState, useEffect } from 'react';
import type { CustomFestivalItem, CustomFestivalFormData, ApiResponse, RegionOptionDto, CategoryOptionDto } from '@/types/admin-festival';
import adminApi from '@/lib/adminApi';
import { resolveImageSrc, getToday } from '@/app/admin/festivals/format';
import c from '@/app/admin/_styles/admin-common.module.css';
import s from '../CustomFestivalListPage/CustomFestivalListPage.module.css';
import { Modal } from '@/_component/common/Modal';
import { useToast } from '@/_component/common/Toast';
import fm from './FormModal.module.css';

// ── 폼 초기값 ──
const INITIAL_FORM: CustomFestivalFormData = {
  title: '', areaCode: '', startDate: getToday(), endDate: getToday(),
  category: '', content: '', isVisible: true,
  eventPlace: '', address: '', detailAddress: '',
  useFee: '', startTime: '09:00', endTime: '18:00', isAllDay: false,
  tel: '', homepage: '', sigunguCode: '',
};

// ── 유효성 검증 ──
function validateForm(
  form: CustomFestivalFormData,
  hasImage: boolean,
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.title.trim()) errors.title = '축제명을 입력해주세요.';
  else if (form.title.length > 100) errors.title = '축제명은 100자 이내로 입력하세요.';
  if (!form.areaCode) errors.areaCode = '개최 지역을 선택해주세요.';
  if (!form.startDate) errors.startDate = '시작일을 선택해주세요.';
  if (!form.endDate) errors.endDate = '종료일을 선택해주세요.';
  if (!form.category) errors.category = '카테고리를 선택해주세요.';
  if (form.startDate && form.endDate && form.startDate > form.endDate)
    errors.endDate = '종료일은 시작일 이후여야 합니다.';
  if (form.startTime && form.endTime && form.startTime > form.endTime)
    errors.endTime = '종료 시간은 시작 시간 이후여야 합니다.';
  if (form.tel && !/^[\d-]+$/.test(form.tel))
    errors.tel = '올바른 전화번호 형식이 아닙니다.';
  if (form.homepage && !/^https?:\/\/.+/.test(form.homepage))
    errors.homepage = 'http:// 또는 https:// 로 시작해야 합니다.';
  if (!hasImage) errors.img = '대표 이미지는 필수입니다.';
  return errors;
}

// ── FormData 빌드 ──
function buildSubmitData(
  form: CustomFestivalFormData,
  isFree: boolean,
  file: File | null,
  extraFiles: File[],
): FormData {
  const data = new FormData();
  data.append('title', form.title);
  data.append('areaCode', form.areaCode);
  data.append('startDate', form.startDate);
  data.append('endDate', form.endDate);
  data.append('category', form.category);
  data.append('content', form.content);
  data.append('isVisible', String(form.isVisible));

  const fullAddress = [form.address, form.detailAddress].filter(Boolean).join(' ');
  if (form.eventPlace) data.append('eventPlace', form.eventPlace);
  if (fullAddress) data.append('address', fullAddress);

  const finalFee = isFree ? '무료' : form.useFee;
  if (finalFee) data.append('useFee', finalFee);

  const playTime = form.isAllDay ? '종일' : [form.startTime, form.endTime].filter(Boolean).join(' ~ ');
  if (playTime) data.append('playTime', playTime);

  if (form.tel) data.append('tel', form.tel);
  if (form.homepage) data.append('homepage', form.homepage);
  if (form.sigunguCode) data.append('sigunguCode', form.sigunguCode);
  if (file) data.append('img', file);
  extraFiles.forEach(f => data.append('extraImgs', f));

  return data;
}

// ── Props ──
interface Props {
  editingItem: CustomFestivalItem | null;
  regionOptions: RegionOptionDto[];
  categoryOptions: CategoryOptionDto[];
  onClose: () => void;
  onSaved: () => void;
}

export default function CustomFestivalFormModal({ editingItem, regionOptions, categoryOptions, onClose, onSaved }: Props) {
  const isEdit = !!editingItem;
  const { toast } = useToast();

  // ── 폼 상태 ──
  const [formData, setFormData] = useState<CustomFestivalFormData>({ ...INITIAL_FORM });
  const [file, setFile] = useState<File | null>(null);
  const [extraFiles, setExtraFiles] = useState<File[]>([]);
  const [mainPreview, setMainPreview] = useState<string | null>(null);
  const [extraPreviews, setExtraPreviews] = useState<string[]>([]);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sigunguOptions, setSigunguOptions] = useState<RegionOptionDto[]>([]);
  const [isFree, setIsFree] = useState(false);

  // 필드 변경 헬퍼
  const updateField = <K extends keyof CustomFestivalFormData>(key: K, value: CustomFestivalFormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setErrors(prev => { const next = { ...prev }; delete next[key]; return next; });
  };

  // ── 편집 모드 초기화 ──
  useEffect(() => {
    if (!editingItem) return;
    const playTime = (editingItem as any).playTime || '';
    const allDay = playTime === '종일';
    setFormData({
      title: editingItem.title || '', areaCode: editingItem.areaCode || '',
      startDate: editingItem.startDate || '', endDate: editingItem.endDate || '',
      category: editingItem.category || '', content: editingItem.content || '',
      isVisible: editingItem.isVisible,
      eventPlace: (editingItem as any).eventPlace || '', address: (editingItem as any).address || '', detailAddress: '',
      useFee: (editingItem as any).useFee === '무료' ? '' : String((editingItem as any).useFee || ''),
      isAllDay: allDay, startTime: allDay ? '' : playTime.split(' ~ ')[0] || '',
      endTime: allDay ? '' : playTime.split(' ~ ')[1] || '',
      tel: (editingItem as any).tel || '', homepage: (editingItem as any).homepage || '',
      sigunguCode: (editingItem as any).sigunguCode || '',
    });
    setMainPreview(editingItem.imgUrl || null);
    setExtraPreviews(editingItem.extraImages ? editingItem.extraImages.split(',') : []);
    setIsFree((editingItem as any).useFee === '무료');
    if (editingItem.areaCode) fetchSigungus(editingItem.areaCode);
  }, [editingItem]);

  // ── 시군구 ──
  const fetchSigungus = async (areaCode: string) => {
    if (!areaCode) return;
    const isStandard = regionOptions.some(r => r.value === areaCode && r.type === 'STANDARD');
    if (!isStandard) { setSigunguOptions([]); return; }
    try {
      const res = await adminApi.get<ApiResponse<RegionOptionDto[]>>(`/festivals/regions/${areaCode}/sigungus`);
      if (res.data.success && res.data.data) setSigunguOptions(res.data.data);
    } catch { setSigunguOptions([]); }
  };

  const handleAreaCodeChange = (code: string) => {
    updateField('areaCode', code);
    setFormData(prev => ({ ...prev, sigunguCode: '' }));
    fetchSigungus(code);
  };

  // ── 주소 검색 ──
  const openPostcode = () => {
    const loadAndOpen = () => {
      new (window as any).daum.Postcode({
        oncomplete: (data: any) => updateField('address', data.roadAddress || data.jibunAddress),
      }).open();
    };
    if (typeof window !== 'undefined' && (window as any).daum?.Postcode) {
      loadAndOpen();
    } else {
      const script = document.createElement('script');
      script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
      script.onload = () => (window as any).daum.postcode.load(() => loadAndOpen());
      document.head.appendChild(script);
    }
  };

  // ── 제출 ──
  const handleSubmit = async () => {
    const validationErrors = validateForm(formData, !!(file || mainPreview));
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }

    try {
      const data = buildSubmitData(formData, isFree, file, extraFiles);
      const url = isEdit ? `/managedFestivals/${editingItem!.festivalId}` : '/managedFestivals';
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const res = isEdit
        ? await adminApi.put(url, data, config)
        : await adminApi.post(url, data, config);

      if (res.data.success) {
        toast(isEdit ? '수정되었습니다.' : '등록되었습니다.', 'success');
        onSaved();
      }
    } catch { toast('저장에 실패했습니다.', 'error'); }
  };

  // ── 이미지 핸들러 ──
  const handleMainImageChange = (f: File | null) => {
    setFile(f);
    setMainPreview(f ? URL.createObjectURL(f) : null);
  };

  const handleExtraImagesAdd = (newFiles: File[]) => {
    if (extraFiles.length + newFiles.length > 7) { toast('갤러리 이미지는 총 7장까지만 등록 가능합니다.', 'warning'); return; }
    setExtraFiles(prev => [...prev, ...newFiles]);
    setExtraPreviews(prev => [...prev, ...newFiles.map(f => URL.createObjectURL(f))]);
  };

  const handleExtraImageRemove = (index: number) => {
    setExtraPreviews(prev => prev.filter((_, i) => i !== index));
    const existingCount = extraPreviews.length - extraFiles.length;
    if (index >= existingCount) setExtraFiles(prev => prev.filter((_, i) => i !== (index - existingCount)));
  };

  return (
    <>
      <div className={fm.formModalWrap}>
        <Modal title={`📝 축제 ${isEdit ? '수정' : '등록'}`} size="large" onClose={onClose} closeOnOverlay={false}>
          <div className={s.formGrid} style={{ overflowY: 'auto', padding: '0 8px' }}>
            {/* ── 좌측: 기본 정보 + 일정 + 장소 ── */}
            <div className={s.layoutLeft}>
              {/* 기본 정보 */}
              <div className={s.formSection}>
                <div className={s.formGroup}>
                  <label className={s.formLabel}><span className={s.requiredStar}>*</span> 축제명</label>
                  <input type="text" maxLength={100} className={`${s.formInput} ${errors.title ? s.errorInput : ''}`}
                    value={formData.title} onChange={e => updateField('title', e.target.value)} placeholder="축제 이름 입력" />
                  {errors.title && <span className={s.errorText}>⚠ {errors.title}</span>}
                </div>
                <div className={s.formRowAligned}>
                  <div className={s.formGroup}>
                    <label className={s.formLabel}><span className={s.requiredStar}>*</span> 개최 지역</label>
                    <select className={`${s.formSelect} ${errors.areaCode ? s.errorInput : ''}`} value={formData.areaCode} onChange={e => handleAreaCodeChange(e.target.value)}>
                      <option value="" disabled>지역 선택</option>
                      <optgroup label="표준 (공공 API)">
                        {regionOptions.filter(o => o.type === 'STANDARD').map(o => (
                          <option key={o.value} value={o.value} disabled={o.active === false}>{o.label} {o.active === false ? '(비활성)' : ''}</option>
                        ))}
                      </optgroup>
                      <optgroup label="추가 지역">
                        {regionOptions.filter(o => o.type === 'CUSTOM').map(o => (
                          <option key={o.value} value={o.value} disabled={o.active === false}>{o.label} {o.active === false ? '(비활성)' : ''}</option>
                        ))}
                      </optgroup>
                    </select>
                    {errors.areaCode && <span className={s.errorText}>⚠ {errors.areaCode}</span>}
                  </div>
                  <div className={s.formGroup}>
                    <label className={s.formLabel}>시군구</label>
                    <select className={`${s.formSelect} ${sigunguOptions.length === 0 ? s.disabledField : ''}`} value={formData.sigunguCode}
                      onChange={e => updateField('sigunguCode', e.target.value)} disabled={sigunguOptions.length === 0}>
                      <option value="">{sigunguOptions.length === 0 ? '선택 불필요' : '시군구 선택'}</option>
                      {sigunguOptions.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                    </select>
                  </div>
                </div>
                <div className={s.formGroup}>
                  <label className={s.formLabel}><span className={s.requiredStar}>*</span> 카테고리</label>
                  <select className={`${s.formSelect} ${errors.category ? s.errorInput : ''}`} value={formData.category}
                    onChange={e => updateField('category', e.target.value)}>
                    <option value="" disabled>분류 선택</option>
                    <optgroup label="공공 분류">{categoryOptions.filter(o => o.type === 'STANDARD').map(o => (<option key={o.value} value={o.value}>{o.label}</option>))}</optgroup>
                    <optgroup label="추가 분류">{categoryOptions.filter(o => o.type === 'CUSTOM').map(o => (<option key={o.value} value={o.value}>{o.label}</option>))}</optgroup>
                  </select>
                  {errors.category && <span className={s.errorText}>⚠ {errors.category}</span>}
                </div>
              </div>

              {/* 일정 & 운영 */}
              <div className={s.formSection}>
                <div className={s.formGroup}>
                  <label className={s.formLabel}><span className={s.requiredStar}>*</span> 축제 기간</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <input type="date" className={`${s.formInput} ${errors.startDate ? s.errorInput : ''}`} value={formData.startDate}
                      onChange={e => { updateField('startDate', e.target.value); setErrors(p => { const n = { ...p }; delete n.endDate; return n; }); }}
                      onClick={e => (e.currentTarget as any).showPicker?.()} onKeyDown={e => e.preventDefault()} />
                    <span style={{ color: '#94a3b8' }}>~</span>
                    <input type="date" className={`${s.formInput} ${errors.endDate ? s.errorInput : ''}`} value={formData.endDate}
                      onChange={e => updateField('endDate', e.target.value)}
                      onClick={e => (e.currentTarget as any).showPicker?.()} onKeyDown={e => e.preventDefault()} />
                  </div>
                  {(errors.startDate || errors.endDate) && <span className={s.errorText}>⚠ {errors.startDate || errors.endDate}</span>}
                </div>
                <div className={s.formGroup}>
                  <label className={s.formLabel}>운영 시간</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, opacity: formData.isAllDay ? 0.5 : 1, pointerEvents: formData.isAllDay ? 'none' : 'auto' }}>
                    <input type="time" disabled={formData.isAllDay} className={s.formInput} value={formData.startTime} onChange={e => updateField('startTime', e.target.value)} />
                    <span style={{ color: '#94a3b8' }}>~</span>
                    <input type="time" disabled={formData.isAllDay} className={s.formInput} value={formData.endTime} onChange={e => updateField('endTime', e.target.value)} />
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer', userSelect: 'none', marginLeft: '8px', flex: 'none' }}>
                    <input type="checkbox" checked={formData.isAllDay} onChange={e => {
                      if (e.target.checked) setFormData(prev => ({ ...prev, isAllDay: true, startTime: '', endTime: '' }));
                      else setFormData(prev => ({ ...prev, isAllDay: false, startTime: '09:00', endTime: '18:00' }));
                    }} /> 종일
                  </label>
                </div>
              </div>

              {/* 장소 & 연락 */}
              <div className={s.formSection}>
                <div className={s.formGroup}>
                  <label className={s.formLabel}>행사장명</label>
                  <input type="text" maxLength={100} className={s.formInput} value={formData.eventPlace}
                    onChange={e => updateField('eventPlace', e.target.value)} placeholder="예: 킨텍스 1전시장" />
                </div>
                <div className={s.formGroup} style={{ alignItems: 'flex-start' }}>
                  <label className={s.formLabel} style={{ marginTop: '8px' }}>주소</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input type="text" className={`${s.formInput} ${s.disabledField}`} style={{ flex: 1 }} value={formData.address} readOnly placeholder="기본 주소 (검색)" />
                      <button type="button" onClick={openPostcode} className={s.addressSearchBtn}>찾기</button>
                    </div>
                    <input type="text" maxLength={100} className={s.formInput} value={formData.detailAddress}
                      onChange={e => updateField('detailAddress', e.target.value)} placeholder="상세 주소 입력" />
                  </div>
                </div>
                <div className={s.formGroup}>
                  <label className={s.formLabel}>이용 요금</label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="text" maxLength={20} className={`${s.formInput} ${isFree ? s.disabledField : ''}`}
                        value={isFree ? '' : (formData.useFee && /^\d/.test(formData.useFee.replace(/,/g, '')) ? Number(formData.useFee.replace(/,/g, '')).toLocaleString() : '')}
                        onChange={e => updateField('useFee', e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder={isFree ? '무료 행사' : '예: 10,000'} style={{ width: '160px', flex: 'none' }} disabled={isFree} />
                      <span style={{ color: '#475569', fontSize: '13px', fontWeight: 500 }}>원</span>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer', userSelect: 'none' }}>
                      <input type="checkbox" checked={isFree} onChange={e => { setIsFree(e.target.checked); if (e.target.checked) updateField('useFee', ''); }} /> 무료
                    </label>
                  </div>
                </div>
                <div className={s.formRowAligned}>
                  <div className={s.formGroup}>
                    <label className={s.formLabel}>문의 연락처</label>
                    <input type="tel" maxLength={13} className={`${s.formInput} ${errors.tel ? s.errorInput : ''}`} value={formData.tel}
                      onChange={e => updateField('tel', e.target.value)} placeholder="예: 02-1234-5678" />
                    {errors.tel && <span className={s.errorText}>⚠ {errors.tel}</span>}
                  </div>
                  <div className={s.formGroup}>
                    <label className={s.formLabel}>공식 홈페이지</label>
                    <input type="url" maxLength={255} className={`${s.formInput} ${errors.homepage ? s.errorInput : ''}`} value={formData.homepage}
                      onChange={e => updateField('homepage', e.target.value)} placeholder="http://..." />
                    {errors.homepage && <span className={s.errorText}>⚠ {errors.homepage}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* ── 우측: 이미지 + 상세 ── */}
            <div className={s.layoutRight}>
              <div className={s.formSection} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div className={s.formGroupColumn}>
                  <label className={s.formLabelColumn}><span className={s.requiredStar}>*</span> 대표 이미지</label>
                  <label className={s.imageUploadBox}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleMainImageChange(f); }}>
                    <input type="file" style={{ display: 'none' }} accept="image/*" onChange={e => handleMainImageChange(e.target.files?.[0] || null)} />
                    {mainPreview ? (
                      <div style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '16px', gap: '16px' }}>
                        <img src={resolveImageSrc(mainPreview)} alt="대표 이미지" style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                          onClick={e => { e.preventDefault(); e.stopPropagation(); setEnlargedImage(resolveImageSrc(mainPreview)); }} />
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: 600 }}>대표 이미지 등록됨</span><br />
                          <span style={{ fontSize: '12px', color: '#64748b' }}>클릭하여 변경</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className={s.uploadIcon}>
                          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        </div>
                        <div style={{ color: '#64748b', fontSize: '13px', marginTop: '8px' }}>클릭 또는 드래그하여 등록</div>
                      </>
                    )}
                  </label>
                </div>

                <div className={s.formGroupColumn} style={{ flexGrow: 0, marginTop: '8px' }}>
                  <label className={s.formLabelColumn}>갤러리 이미지 (최대 7장)</label>
                  <div className={s.imagePreviewGrid}>
                    {extraPreviews.map((p, i) => (
                      <div key={i} className={s.galleryPreviewItem}>
                        <img src={resolveImageSrc(p)} alt={`갤러리 ${i + 1}`} className={s.galleryImg} onClick={() => setEnlargedImage(resolveImageSrc(p))} />
                        <button type="button" className={s.removeBtn} onClick={() => handleExtraImageRemove(i)}>✕</button>
                      </div>
                    ))}
                    {extraPreviews.length < 7 && (
                      <label className={s.imageUploadBoxMini}
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => { e.preventDefault(); handleExtraImagesAdd(Array.from(e.dataTransfer.files || [])); }}>
                        <input type="file" multiple style={{ display: 'none' }} accept="image/*" onChange={e => {
                          handleExtraImagesAdd(Array.from(e.target.files || []));
                          e.target.value = '';
                        }} />
                        <svg width="20" height="20" fill="none" stroke="#94a3b8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                      </label>
                    )}
                  </div>
                </div>

                <div className={s.formGroupColumn} style={{ flex: 1, marginTop: '8px' }}>
                  <label className={s.formLabelColumn}>상세 내용</label>
                  <textarea className={s.contentArea} value={formData.content} onChange={e => updateField('content', e.target.value)} placeholder="축제 상세 설명을 입력하세요." />
                </div>
              </div>
            </div>
          </div>

          {/* ── 하단 바 ── */}
          <div className={s.formBottomBar}>
            <div className={s.settingsSection}>
              <label className={s.formLabel} style={{ margin: 0, paddingRight: '12px' }}>노출 여부</label>
              <label className={s.toggleWrapperSettings}>
                <input type="checkbox" checked={formData.isVisible} onChange={e => updateField('isVisible', e.target.checked)} style={{ display: 'none' }} />
                <div className={`${s.toggleSlot} ${formData.isVisible ? s.activeSlot : ''}`}>
                  <div className={s.toggleKnob} />
                </div>
                <span className={formData.isVisible ? s.blueText : s.grayText} style={{ marginLeft: '12px', fontWeight: 600, fontSize: '14px' }}>
                  {formData.isVisible ? '공개' : '비공개'}
                </span>
              </label>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className={c.btnCancel} onClick={onClose}>취소</button>
              <button className={c.btnSubmit} onClick={handleSubmit}>{isEdit ? '수정 완료' : '등록 완료'}</button>
            </div>
          </div>
        </Modal>
      </div>

      {enlargedImage && (
        <div className={s.imageViewerOverlay} onClick={() => setEnlargedImage(null)}>
          <div className={s.imageViewerContent} onClick={e => e.stopPropagation()}>
            <button className={s.imageViewerCloseBtn} onClick={() => setEnlargedImage(null)}>✕</button>
            <img src={enlargedImage} alt="크게 보기" className={s.imageViewerImg} />
          </div>
        </div>
      )}
    </>
  );
}

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import s from './Dropdown.module.css';

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface DropdownProps {
  /** 드롭다운 옵션 목록 */
  options: DropdownOption[];
  /** 현재 선택된 값 */
  value: string;
  /** 값 변경 콜백 */
  onChange: (value: string) => void;
  /** 접근성 라벨 */
  ariaLabel?: string;
  /** 패널 정렬 방향 (기본: left) */
  align?: 'left' | 'right';
  /** full-width 모드 (폼 안에서 사용 시) */
  fullWidth?: boolean;
  /** 트리거 최소 너비 */
  minWidth?: number;
}

/**
 * 공용 커스텀 드롭다운 컴포넌트
 * - 정렬 드롭다운과 동일한 디자인 (트리거 버튼 + 패널 리스트)
 * - 외부 클릭, ESC 키 닫기 지원
 */
export default function Dropdown({
  options,
  value,
  onChange,
  ariaLabel = '드롭다운',
  align = 'left',
  fullWidth = false,
  minWidth,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 외부 클릭 닫기
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }, []);

  // ESC 키 닫기
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false);
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, handleClickOutside, handleKeyDown]);

  // 현재 선택된 옵션의 라벨
  const selectedLabel = options.find(o => o.value === value)?.label ?? '선택';

  return (
    <div
      ref={ref}
      className={`${s.container} ${fullWidth ? s.containerBlock : ''}`}
    >
      <button
        type="button"
        className={`${s.trigger} ${open ? s.triggerOpen : ''} ${fullWidth ? s.triggerFull : ''}`}
        onClick={() => setOpen(!open)}
        aria-label={ariaLabel}
        aria-expanded={open}
        style={minWidth ? { minWidth } : undefined}
      >
        {selectedLabel}
        <ChevronDown
          size={14}
          className={`${s.chevron} ${open ? s.chevronOpen : ''}`}
        />
      </button>

      {open && (
        <ul
          className={`${s.panel} ${align === 'right' ? s.panelRight : ''}`}
          role="listbox"
          aria-label={ariaLabel}
        >
          {options.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              className={`
                ${s.option}
                ${opt.value === value ? s.optionActive : ''}
                ${opt.disabled ? s.optionDisabled : ''}
              `}
              onClick={() => {
                if (opt.disabled) return;
                onChange(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

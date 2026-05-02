import { forwardRef, useEffect, useImperativeHandle, useRef, type ClipboardEvent, type KeyboardEvent } from 'react';
import { cn } from '@/utils';

export interface OtpInputHandle {
  focus: () => void;
  clear: () => void;
}

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  hasError?: boolean;
}

/**
 * Accessible 6-cell numeric OTP input.
 * - Auto-advances on digit entry; Backspace navigates backward.
 * - Paste of a 6-digit string fills all cells.
 * - Direction-agnostic: cell order matches the document direction.
 */
export const OtpInput = forwardRef<OtpInputHandle, OtpInputProps>(
  ({ length = 6, value, onChange, onComplete, disabled, autoFocus, hasError }, ref) => {
    const refs = useRef<Array<HTMLInputElement | null>>([]);

    useImperativeHandle(ref, () => ({
      focus: () => refs.current[0]?.focus(),
      clear: () => onChange(''),
    }));

    useEffect(() => {
      if (autoFocus) refs.current[0]?.focus();
    }, [autoFocus]);

    const cells = Array.from({ length }, (_, i) => value[i] ?? '');

    const update = (next: string) => {
      onChange(next);
      if (next.length === length) onComplete?.(next);
    };

    const handleChange = (index: number, raw: string) => {
      const digit = raw.replace(/\D/g, '').slice(-1);
      if (!digit && raw === '') {
        const next = cells.slice();
        next[index] = '';
        update(next.join('').slice(0, length));
        return;
      }
      if (!digit) return;
      const next = cells.slice();
      next[index] = digit;
      const trimmed = next.join('').slice(0, length);
      update(trimmed);
      if (index < length - 1) refs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        if (!cells[index] && index > 0) {
          refs.current[index - 1]?.focus();
        }
      } else if (e.key === 'ArrowLeft' && index > 0) {
        e.preventDefault();
        refs.current[index - 1]?.focus();
      } else if (e.key === 'ArrowRight' && index < length - 1) {
        e.preventDefault();
        refs.current[index + 1]?.focus();
      }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
      if (!pasted) return;
      e.preventDefault();
      update(pasted);
      const focusTarget = Math.min(pasted.length, length - 1);
      refs.current[focusTarget]?.focus();
    };

    return (
      <div className="flex items-center justify-center gap-2 sm:gap-3" role="group" aria-label="One-time code">
        {cells.map((c, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            value={c}
            disabled={disabled}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
            className={cn(
              'h-12 w-10 sm:h-14 sm:w-12 rounded-xl border bg-surface text-center text-xl font-semibold text-text-primary',
              'transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500',
              hasError ? 'border-error' : 'border-border',
              disabled && 'opacity-60 cursor-not-allowed'
            )}
          />
        ))}
      </div>
    );
  }
);

OtpInput.displayName = 'OtpInput';

import { forwardRef, useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/utils';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

interface DropdownPosition {
  top: number;
  left: number;
  width: number;
}

export const Select = forwardRef<HTMLDivElement, SelectProps>(
  ({ options, value, onChange, placeholder = 'Select...', label, error, disabled = false, className }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<DropdownPosition>({ top: 0, left: 0, width: 0 });
    const selectedOption = options.find((opt) => opt.value === value);

    const updatePosition = useCallback(() => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width,
      });
    }, []);

    // Close on click outside
    useEffect(() => {
      if (!isOpen) return;
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        if (
          buttonRef.current?.contains(target) ||
          dropdownRef.current?.contains(target)
        ) return;
        setIsOpen(false);
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Reposition on scroll/resize while open
    useEffect(() => {
      if (!isOpen) return;
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }, [isOpen, updatePosition]);

    // Close on Escape
    useEffect(() => {
      if (!isOpen) return;
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsOpen(false);
      };
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen]);

    return (
      <div ref={ref} className={cn('relative', className)}>
        {label && <label className="mb-1.5 block text-sm font-medium text-text-primary">{label}</label>}
        <div>
          <button
            ref={buttonRef}
            type="button"
            onClick={() => {
              if (disabled) return;
              if (!isOpen) updatePosition();
              setIsOpen(!isOpen);
            }}
            disabled={disabled}
            className={cn(
              'flex h-10 w-full items-center justify-between rounded-lg border bg-surface px-3 text-sm transition-colors',
              'text-start',
              isOpen
                ? 'border-primary-500 ring-2 ring-primary-500'
                : 'border-border hover:border-text-muted',
              error && 'border-red-500',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            <span className={cn('truncate', selectedOption ? 'text-text-primary' : 'text-text-muted')}>
              {selectedOption?.label || placeholder}
            </span>
            <ChevronDown
              className={cn(
                'h-4 w-4 shrink-0 text-text-muted transition-transform duration-200 ltr:ml-2 rtl:mr-2',
                isOpen && 'rotate-180'
              )}
            />
          </button>

          {isOpen && createPortal(
            <div
              ref={dropdownRef}
              className="fixed z-[9999] max-h-60 overflow-auto rounded-xl border border-border bg-surface py-1.5 shadow-soft-lg"
              style={{
                top: position.top,
                left: position.left,
                width: position.width,
              }}
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => { onChange?.(option.value); setIsOpen(false); }}
                  className={cn(
                    'flex w-full items-center justify-between px-3.5 py-2.5 text-sm transition-colors',
                    option.value === value
                      ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400'
                      : 'text-text-primary hover:bg-hover'
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {option.value === value && <Check className="h-4 w-4 shrink-0 ltr:ml-2 rtl:mr-2" />}
                </button>
              ))}
            </div>,
            document.body
          )}
        </div>
        {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

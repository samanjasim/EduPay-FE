import { forwardRef, useState, useRef, useEffect } from 'react';
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

export const Select = forwardRef<HTMLDivElement, SelectProps>(
  ({ options, value, onChange, placeholder = 'Select...', label, error, disabled = false, className }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const selectedOption = options.find((opt) => opt.value === value);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
      <div ref={ref} className={cn('relative', className)}>
        {label && <label className="mb-1.5 block text-sm font-medium text-text-primary">{label}</label>}
        <div ref={containerRef} className="relative">
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
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

          {isOpen && (
            <div className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-border bg-surface py-1.5 shadow-soft-lg">
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
            </div>
          )}
        </div>
        {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

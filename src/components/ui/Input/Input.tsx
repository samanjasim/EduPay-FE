import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-text-muted ltr:left-3 rtl:right-3">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'h-10 w-full rounded-lg border bg-surface px-3 text-sm text-text-primary',
              'placeholder:text-text-muted',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                : 'border-border hover:border-text-muted',
              leftIcon && 'ltr:pl-10 rtl:pr-10',
              rightIcon && 'ltr:pr-10 rtl:pl-10',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute top-1/2 -translate-y-1/2 text-text-muted ltr:right-3 rtl:left-3">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
        {hint && !error && (
          <p className="mt-1.5 text-sm text-text-muted">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };

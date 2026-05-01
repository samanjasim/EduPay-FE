import { forwardRef, type ButtonHTMLAttributes, type AnchorHTMLAttributes, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { cn } from '@/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'gradient';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed select-none whitespace-nowrap';

const variants: Record<Variant, string> = {
  primary:
    'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-soft-sm hover:shadow-soft-md',
  secondary:
    'bg-surface text-text-primary border border-border hover:bg-hover focus:ring-primary-500',
  ghost: 'text-text-secondary hover:text-text-primary hover:bg-hover focus:ring-primary-500',
  outline:
    'border border-primary-500 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-500/10 focus:ring-primary-500',
  gradient:
    'text-white shadow-soft-md hover:shadow-soft-lg focus:ring-primary-500 bg-[linear-gradient(135deg,#2563eb_0%,#10b981_100%)] hover:brightness-110',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
  children?: ReactNode;
};

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { as?: 'button' };
type AnchorProps = CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { as: 'a' };
type RouterLinkProps = CommonProps & Omit<LinkProps, 'className'> & { as: 'link' };
type Props = ButtonProps | AnchorProps | RouterLinkProps;

export const LandingButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, Props>(
  ({ variant = 'primary', size = 'md', leftIcon, rightIcon, className, children, ...rest }, ref) => {
    const cls = cn(base, variants[variant], sizes[size], className);

    const inner = (
      <>
        {leftIcon ? <span className="shrink-0">{leftIcon}</span> : null}
        {children}
        {rightIcon ? <span className="shrink-0">{rightIcon}</span> : null}
      </>
    );

    const tag = (rest as { as?: string }).as;

    if (tag === 'link') {
      const { as: _as, ...l } = rest as RouterLinkProps;
      void _as;
      return (
        <Link ref={ref as React.Ref<HTMLAnchorElement>} className={cls} {...l}>
          {inner}
        </Link>
      );
    }

    if (tag === 'a' || 'href' in rest) {
      const { as: _as, ...a } = rest as AnchorProps;
      void _as;
      return (
        <a ref={ref as React.Ref<HTMLAnchorElement>} className={cls} {...a}>
          {inner}
        </a>
      );
    }
    const { as: _as, ...b } = rest as ButtonProps;
    void _as;
    return (
      <button ref={ref as React.Ref<HTMLButtonElement>} className={cls} {...b}>
        {inner}
      </button>
    );
  }
);

LandingButton.displayName = 'LandingButton';

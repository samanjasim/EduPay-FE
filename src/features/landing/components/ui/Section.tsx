import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils';
import { useReveal } from '../../hooks/useReveal';

type Props = HTMLAttributes<HTMLElement> & {
  id?: string;
  children?: ReactNode;
  reveal?: boolean;
  contentVisibility?: boolean;
};

export function Section({
  id,
  className,
  children,
  reveal = true,
  contentVisibility = true,
  ...rest
}: Props) {
  const ref = useReveal<HTMLElement>();
  return (
    <section
      id={id}
      ref={reveal ? ref : undefined}
      className={cn('section-pad', contentVisibility && 'cv-auto', reveal && 'reveal', className)}
      {...rest}
    >
      {children}
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600 dark:text-primary-400">
      {children}
    </p>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = 'center',
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: 'center' | 'start';
}) {
  return (
    <header className={cn('mx-auto max-w-3xl', align === 'center' ? 'text-center' : 'text-start ms-0')}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">{title}</h2>
      {subtitle ? (
        <p className="mt-4 text-base sm:text-lg text-text-secondary leading-relaxed">{subtitle}</p>
      ) : null}
    </header>
  );
}

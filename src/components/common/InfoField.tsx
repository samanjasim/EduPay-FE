import type { ReactNode } from 'react';

interface InfoFieldProps {
  label: string;
  children: ReactNode;
}

export function InfoField({ label, children }: InfoFieldProps) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium uppercase tracking-wide text-text-muted">
        {label}
      </label>
      <div className="text-sm text-text-primary">{children}</div>
    </div>
  );
}

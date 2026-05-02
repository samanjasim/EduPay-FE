import { Plus } from 'lucide-react';
import { cn } from '@/utils';
import type { ParentHomeChild } from '../../api/parent-portal.api';

interface Props {
  children: ParentHomeChild[];
  activeChildId: string | null;
  onSelect: (childId: string) => void;
}

/**
 * Pill strip matching the mock — each chip shows the child's first name + grade.
 * The active chip is filled; the rest are outlined; trailing "+" is a passive placeholder
 * until the multi-school flow allows linking another child.
 */
export function ChildrenChipStrip({ children, activeChildId, onSelect }: Props) {
  if (children.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {children.map((c) => {
        const active = c.id === activeChildId;
        const initial = c.displayName ? c.displayName[0]!.toUpperCase() : '?';
        const firstName = c.displayName.split(' ')[0] ?? c.displayName;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(c.id)}
            className={cn(
              'inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors',
              active
                ? 'border-text-primary bg-text-primary text-text-inverse'
                : 'border-border bg-surface text-text-secondary hover:bg-hover'
            )}
            aria-pressed={active}
          >
            <span
              className={cn(
                'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                active
                  ? 'bg-text-inverse text-text-primary'
                  : 'bg-accent-100 text-accent-700 dark:bg-accent-500/20 dark:text-accent-300'
              )}
              aria-hidden
            >
              {initial}
            </span>
            <span className="font-semibold">{firstName}</span>
            <span className={cn('text-xs', active ? 'text-text-inverse/70' : 'text-text-muted')}>
              {c.grade}
            </span>
          </button>
        );
      })}
      <span
        aria-hidden
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-dashed border-border text-text-muted"
      >
        <Plus className="h-4 w-4" />
      </span>
    </div>
  );
}

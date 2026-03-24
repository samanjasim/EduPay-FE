import { cn } from '@/utils';

interface Tab<T extends string> {
  key: T;
  label: string;
}

interface TabSwitcherProps<T extends string> {
  tabs: Tab<T>[];
  activeTab: T;
  onChange: (tab: T) => void;
}

export function TabSwitcher<T extends string>({ tabs, activeTab, onChange }: TabSwitcherProps<T>) {
  return (
    <div className="flex gap-1 rounded-lg bg-surface-200 p-1 dark:bg-surface-elevated w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            'rounded-md px-4 py-2 text-sm font-medium transition-colors',
            activeTab === tab.key
              ? 'bg-surface text-text-primary shadow-sm'
              : 'text-text-muted hover:text-text-primary'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

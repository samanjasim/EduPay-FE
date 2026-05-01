import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils';
import { Badge } from '@/components/ui';

export interface WizardStep {
  key: string;
  title: string;
  description: string;
  required: boolean;
}

interface WizardStepperProps {
  steps: WizardStep[];
  currentStep: number;
  completedSteps: Set<number>;
}

export function WizardStepper({ steps, currentStep, completedSteps }: WizardStepperProps) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-3 md:grid-cols-4">
      {steps.map((step, index) => {
        const isCompleted = completedSteps.has(index);
        const isCurrent = index === currentStep;

        return (
          <div
            key={step.key}
            className={cn(
              'rounded-lg border p-3 transition-colors',
              isCurrent
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
                : isCompleted
                  ? 'border-emerald-200 bg-surface dark:border-emerald-500/30'
                  : 'border-border bg-surface'
            )}
          >
            <div className="flex min-w-0 items-start gap-3">
              <div
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors',
                  isCompleted
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : isCurrent
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                      : 'border-border bg-surface text-text-muted'
                )}
              >
                {isCompleted ? <Check className="h-5 w-5" /> : index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    'truncate text-sm font-medium',
                    isCurrent || isCompleted ? 'text-text-primary' : 'text-text-muted'
                  )}
                >
                  {step.title}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-text-muted">{step.description}</p>
                <Badge
                  variant={step.required ? 'warning' : 'default'}
                  className="mt-2 text-[10px]"
                >
                  {step.required ? t('schoolPortal.setup.required') : t('schoolPortal.setup.optional')}
                </Badge>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

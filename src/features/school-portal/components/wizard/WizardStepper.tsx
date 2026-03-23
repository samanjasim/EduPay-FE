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
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const isCompleted = completedSteps.has(index);
        const isCurrent = index === currentStep;
        const isPast = index < currentStep;

        return (
          <div key={step.key} className="flex flex-1 items-center">
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors',
                  isCompleted
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : isCurrent
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                      : 'border-border bg-surface text-text-muted'
                )}
              >
                {isCompleted ? <Check className="h-5 w-5" /> : index + 1}
              </div>
              <div className="mt-2 text-center">
                <p
                  className={cn(
                    'text-xs font-medium',
                    isCurrent || isCompleted ? 'text-text-primary' : 'text-text-muted'
                  )}
                >
                  {step.title}
                </p>
                <Badge
                  variant={step.required ? 'warning' : 'default'}
                  className="mt-1 text-[10px]"
                >
                  {step.required ? t('schoolPortal.setup.required') : t('schoolPortal.setup.optional')}
                </Badge>
              </div>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'mx-2 h-0.5 flex-1 transition-colors',
                  isPast || isCompleted ? 'bg-emerald-500' : 'bg-border'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

import { useTranslation } from 'react-i18next';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui';

interface WizardCompleteProps {
  onComplete: () => void;
  isCompleting?: boolean;
}

export function WizardComplete({ onComplete, isCompleting = false }: WizardCompleteProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20">
        <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
      </div>
      <h2 className="text-2xl font-bold text-text-primary">
        {t('schoolPortal.setup.complete.title')}
      </h2>
      <p className="mt-2 max-w-md text-text-muted">
        {t('schoolPortal.setup.complete.description')}
      </p>
      <Button className="mt-8" onClick={onComplete} disabled={isCompleting}>
        {isCompleting ? t('common.loading') : t('schoolPortal.setup.complete.goToDashboard')}
      </Button>
    </div>
  );
}

import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/common';

interface ComingSoonPageProps {
  title?: string;
  subtitle?: string;
  taskRef?: string;
}

/**
 * Stub page used while a slice is wiring routes ahead of UI.
 * Task 8 (FE plumbing) registers product catalog routes whose pages
 * are built in Task 9 (catalog mgmt) and Task 10 (purchase ops + parent flow).
 */
export default function ComingSoonPage({ title, subtitle, taskRef }: ComingSoonPageProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <PageHeader title={title ?? t('common.comingSoon', 'Coming soon')} subtitle={subtitle} />
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-500/20">
            <Sparkles className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <p className="text-text-secondary">
            {t(
              'common.comingSoonHint',
              'This page is being built. The route is registered so navigation works while the UI ships.'
            )}
          </p>
          {taskRef && <p className="text-xs text-text-muted">{taskRef}</p>}
        </CardContent>
      </Card>
    </div>
  );
}

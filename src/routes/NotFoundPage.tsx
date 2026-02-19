import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui';
import { ROUTES } from '@/config';

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="text-center">
        <h1 className="mb-2 text-8xl font-bold text-primary-500">404</h1>
        <h2 className="mb-4 text-2xl font-semibold text-text-primary">
          {t('common.pageNotFound')}
        </h2>
        <p className="mb-8 max-w-md text-text-secondary">
          {t('common.pageNotFoundDesc')}
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="secondary"
            onClick={() => window.history.back()}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            {t('common.goBack')}
          </Button>
          <Link to={ROUTES.DASHBOARD}>
            <Button leftIcon={<Home className="h-4 w-4" />}>
              {t('common.home')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

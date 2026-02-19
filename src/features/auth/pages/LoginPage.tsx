import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui';
import { LoginForm } from '../components';
import { ROUTES } from '@/config';

export default function LoginPage() {
  const { t } = useTranslation();

  return (
    <div>
      <div className="mb-8 text-center lg:text-left">
        <h2 className="text-2xl font-bold text-text-primary">{t('auth.welcomeBack')}</h2>
        <p className="mt-2 text-text-secondary">{t('auth.signInContinue')}</p>
      </div>

      <Card variant="elevated">
        <CardContent>
          <LoginForm />

          <div className="mt-6 text-center text-sm text-text-secondary">
            {t('auth.noAccount')}{' '}
            <Link to={ROUTES.REGISTER} className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
              {t('auth.createOne')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

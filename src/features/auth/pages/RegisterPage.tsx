import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui';
import { RegisterForm } from '../components';
import { ROUTES } from '@/config';

export default function RegisterPage() {
  const { t } = useTranslation();

  return (
    <div>
      <div className="mb-8 text-center lg:text-left">
        <h2 className="text-2xl font-bold text-text-primary">{t('auth.createAccount')}</h2>
        <p className="mt-2 text-text-secondary">{t('auth.joinEdupay')}</p>
      </div>

      <Card variant="elevated">
        <CardContent>
          <RegisterForm />

          <div className="mt-6 text-center text-sm text-text-secondary">
            {t('auth.hasAccount')}{' '}
            <Link to={ROUTES.LOGIN} className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
              {t('auth.signInLink')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

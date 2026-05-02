import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui';
import { LoginForm, PhoneOtpForm } from '../components';
import { ROUTES } from '@/config';
import { cn } from '@/utils';

type Tab = 'email' | 'phone';

export default function LoginPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('email');

  return (
    <div>
      <div className="mb-8 text-center lg:text-left">
        <h2 className="text-2xl font-bold text-text-primary">{t('auth.welcomeBack')}</h2>
        <p className="mt-2 text-text-secondary">{t('auth.signInContinue')}</p>
      </div>

      <Card variant="elevated">
        <CardContent>
          <div
            role="tablist"
            aria-label={t('auth.signInMethod')}
            className="mb-6 inline-flex w-full rounded-full border border-border bg-surface p-1"
          >
            <TabButton active={tab === 'email'} onClick={() => setTab('email')}>
              {t('auth.email')}
            </TabButton>
            <TabButton active={tab === 'phone'} onClick={() => setTab('phone')}>
              {t('auth.phone')}
            </TabButton>
          </div>

          {tab === 'email' ? <LoginForm /> : <PhoneOtpForm />}

          <div className="mt-6 text-center text-sm text-text-secondary">
            {t('auth.noAccount')}{' '}
            <Link
              to={ROUTES.REGISTER}
              className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            >
              {t('auth.createOne')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors',
        active
          ? 'bg-[linear-gradient(135deg,#2563eb,#10b981)] text-white shadow-soft-sm'
          : 'text-text-secondary hover:text-text-primary'
      )}
    >
      {children}
    </button>
  );
}

import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GraduationCap } from 'lucide-react';

export function AuthLayout() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 p-12">
        <div className="max-w-md text-center">
          <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 shadow-lg">
            <GraduationCap className="h-10 w-10 text-white" />
          </div>
          <h1 className="mb-4 text-4xl font-bold text-white">
            {t('auth.brandTitle')}
          </h1>
          <p className="text-lg text-primary-100">
            {t('auth.brandSubtitle')}
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 h-1/3 w-1/2 bg-gradient-to-t from-white/5 to-transparent" />
      </div>

      {/* Right side - Auth form */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

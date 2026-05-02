import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Globe,
  Lock,
  LogOut,
  Moon,
  Phone,
  RotateCcw,
  Sun,
  User as UserIcon,
} from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { OtpInput, type OtpInputHandle } from '@/features/auth/components/OtpInput';
import { changePasswordSchema, type ChangePasswordFormData } from '@/lib/validation';
import { useChangePassword, useLogout } from '@/features/auth/api';
import {
  useConfirmChangePhone,
  useRequestChangePhoneOtp,
} from '../api/parent-portal.queries';
import { useAuthStore, selectUser, useUIStore } from '@/stores';
import { ROUTES } from '@/config';
import { cn } from '@/utils';

const E164 = /^\+?[1-9]\d{6,14}$/;

type Language = 'en' | 'ar' | 'ku';

export default function ParentProfilePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore(selectUser);
  const { theme, setTheme, language, setLanguage } = useUIStore();
  const logout = useLogout();

  return (
    <div className="space-y-6 pb-6">
      <Link
        to={ROUTES.PARENT.DASHBOARD}
        className="inline-flex items-center gap-1 text-sm font-medium text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
        {t('parent.profile.back')}
      </Link>

      {/* Profile header */}
      <header className="flex items-center gap-4 rounded-3xl bg-surface p-5 shadow-soft-sm">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-accent-100 text-2xl font-bold text-accent-700 dark:bg-accent-500/20 dark:text-accent-300">
          {user?.firstName?.[0]?.toUpperCase() ?? '?'}
        </span>
        <div className="min-w-0">
          <p className="truncate text-lg font-bold text-text-primary">
            {user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : '—'}
          </p>
          <p className="truncate text-xs text-text-muted">
            {user?.phoneNumber ?? user?.email ?? ''}
          </p>
        </div>
      </header>

      <ChangePhonePanel currentPhone={user?.phoneNumber ?? null} />
      <ChangePasswordPanel />

      {/* Preferences */}
      <section aria-labelledby="prefs-heading" className="space-y-3">
        <h2 id="prefs-heading" className="flex items-center gap-2 text-base font-bold text-text-primary">
          <Globe className="h-4 w-4" aria-hidden />
          {t('parent.profile.prefsTitle')}
        </h2>

        <div className="space-y-3 rounded-2xl border border-border bg-surface p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              {t('parent.profile.language')}
            </p>
            <div className="mt-2 inline-flex w-full rounded-full border border-border bg-surface-100 p-1 dark:bg-white/5">
              {(['en', 'ar', 'ku'] as Language[]).map((lng) => (
                <button
                  key={lng}
                  type="button"
                  onClick={() => {
                    setLanguage(lng);
                    void i18n.changeLanguage(lng);
                  }}
                  className={cn(
                    'flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                    language === lng
                      ? 'bg-text-primary text-text-inverse shadow-soft-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  )}
                >
                  {lng === 'en' ? 'EN' : lng === 'ar' ? 'العربية' : 'کوردی'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              {t('parent.profile.theme')}
            </p>
            <div className="mt-2 inline-flex w-full rounded-full border border-border bg-surface-100 p-1 dark:bg-white/5">
              {(['light', 'dark', 'system'] as const).map((tk) => (
                <button
                  key={tk}
                  type="button"
                  onClick={() => setTheme(tk)}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                    theme === tk
                      ? 'bg-text-primary text-text-inverse shadow-soft-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  )}
                >
                  {tk === 'light' ? <Sun className="h-3 w-3" /> : tk === 'dark' ? <Moon className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
                  {t(`parent.profile.themes.${tk}`)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Button
        type="button"
        variant="ghost"
        className="w-full justify-center text-error hover:bg-error/10"
        onClick={() => {
          logout();
          navigate(ROUTES.LOGIN, { replace: true });
        }}
        leftIcon={<LogOut className="h-4 w-4 rtl:rotate-180" />}
      >
        {t('parent.profile.signOut')}
      </Button>
    </div>
  );
}

// ---------------- Change phone panel ----------------

function ChangePhonePanel({ currentPhone }: { currentPhone: string | null }) {
  const { t } = useTranslation();
  const [step, setStep] = useState<'idle' | 'phone' | 'code'>('idle');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const otpRef = useRef<OtpInputHandle>(null);

  const request = useRequestChangePhoneOtp();
  const confirm = useConfirmChangePhone();

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = window.setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(id);
  }, [resendIn]);

  const submitPhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!E164.test(phone.trim())) {
      setPhoneError(t('auth.otp.invalidPhone'));
      return;
    }
    setPhoneError(null);
    request.mutate(
      { newPhoneE164: phone.trim() },
      {
        onSuccess: (r) => {
          setStep('code');
          setResendIn(r.resendAvailableInSeconds);
          setCode('');
          setCodeError(null);
          window.setTimeout(() => otpRef.current?.focus(), 0);
        },
        onError: (err: unknown) => setPhoneError(message(err) ?? t('auth.otp.requestFailed')),
      }
    );
  };

  const submitCode = (current?: string) => {
    const c = current ?? code;
    if (c.length !== 6) {
      setCodeError(t('auth.otp.invalidCode'));
      return;
    }
    setCodeError(null);
    confirm.mutate(
      { newPhoneE164: phone.trim(), code: c },
      {
        onSuccess: () => {
          setStep('idle');
          setCode('');
          setPhone('');
        },
        onError: (err: unknown) => {
          setCodeError(message(err) ?? t('auth.otp.invalidCode'));
          otpRef.current?.clear();
          setCode('');
          window.setTimeout(() => otpRef.current?.focus(), 0);
        },
      }
    );
  };

  return (
    <section aria-labelledby="change-phone-heading" className="space-y-3">
      <h2 id="change-phone-heading" className="flex items-center gap-2 text-base font-bold text-text-primary">
        <Phone className="h-4 w-4" aria-hidden />
        {t('parent.profile.phoneTitle')}
      </h2>

      <div className="rounded-2xl border border-border bg-surface p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          {t('parent.profile.currentPhone')}
        </p>
        <p className="mt-1 text-sm font-medium text-text-primary">{currentPhone ?? '—'}</p>

        {step === 'idle' && (
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => setStep('phone')}>
            {t('parent.profile.changePhone')}
          </Button>
        )}

        {step === 'phone' && (
          <form onSubmit={submitPhone} className="mt-4 space-y-3">
            <Input
              label={t('parent.profile.newPhone')}
              type="tel"
              inputMode="tel"
              placeholder="+9647xxxxxxxxx"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={phoneError ?? undefined}
            />
            <div className="flex gap-2">
              <Button type="submit" isLoading={request.isPending}>
                {t('auth.otp.sendCode')}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setStep('idle');
                  setPhone('');
                  setPhoneError(null);
                }}
              >
                {t('common.cancel', 'Cancel')}
              </Button>
            </div>
          </form>
        )}

        {step === 'code' && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-text-secondary">{t('auth.otp.sentTo', { phone })}</p>
            <OtpInput
              ref={otpRef}
              value={code}
              onChange={setCode}
              onComplete={(c) => submitCode(c)}
              disabled={confirm.isPending}
              hasError={!!codeError}
              autoFocus
            />
            {codeError && (
              <p className="text-center text-sm text-error" role="alert">
                {codeError}
              </p>
            )}
            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setCode('');
                  setCodeError(null);
                }}
                className="inline-flex items-center gap-1 text-text-secondary hover:text-text-primary"
              >
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
                {t('auth.otp.changeNumber')}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (resendIn > 0) return;
                  request.mutate(
                    { newPhoneE164: phone.trim() },
                    { onSuccess: (r) => setResendIn(r.resendAvailableInSeconds) }
                  );
                }}
                disabled={resendIn > 0 || request.isPending}
                className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-primary-400"
              >
                <RotateCcw className="h-4 w-4" />
                {resendIn > 0 ? t('auth.otp.resendIn', { seconds: resendIn }) : t('auth.otp.resend')}
              </button>
            </div>
            <Button type="button" className="w-full" onClick={() => submitCode()} isLoading={confirm.isPending}>
              {t('parent.profile.verifyAndUpdate')}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

// ---------------- Change password panel ----------------

function ChangePasswordPanel() {
  const { t } = useTranslation();
  const change = useChangePassword();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmNewPassword: '' },
  });

  return (
    <section aria-labelledby="change-pwd-heading" className="space-y-3">
      <h2 id="change-pwd-heading" className="flex items-center gap-2 text-base font-bold text-text-primary">
        <Lock className="h-4 w-4" aria-hidden />
        {t('parent.profile.passwordTitle')}
      </h2>
      <form
        onSubmit={handleSubmit((data) =>
          change.mutate(data, { onSuccess: () => reset() })
        )}
        className="space-y-3 rounded-2xl border border-border bg-surface p-4"
      >
        <Input
          type="password"
          label={t('parent.profile.currentPassword')}
          autoComplete="current-password"
          error={errors.currentPassword?.message}
          {...register('currentPassword')}
        />
        <Input
          type="password"
          label={t('parent.profile.newPassword')}
          autoComplete="new-password"
          error={errors.newPassword?.message}
          {...register('newPassword')}
        />
        <Input
          type="password"
          label={t('parent.profile.confirmPassword')}
          autoComplete="new-password"
          error={errors.confirmNewPassword?.message}
          {...register('confirmNewPassword')}
        />
        <Button type="submit" isLoading={change.isPending}>
          {t('parent.profile.updatePassword')}
        </Button>
      </form>
    </section>
  );
}

function message(err: unknown): string | undefined {
  if (typeof err !== 'object' || err === null) return undefined;
  const a = err as { response?: { data?: { message?: string } } };
  return a.response?.data?.message;
}

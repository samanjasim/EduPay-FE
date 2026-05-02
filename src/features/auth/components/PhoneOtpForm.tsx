import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Phone, ArrowLeft, RotateCcw } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { OtpInput, type OtpInputHandle } from './OtpInput';
import { useRequestOtp, useVerifyOtp } from '../api';

type Step = 'phone' | 'code';

const E164 = /^\+?[1-9]\d{6,14}$/;

export function PhoneOtpForm() {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const otpRef = useRef<OtpInputHandle>(null);

  const requestOtp = useRequestOtp();
  const verifyOtp = useVerifyOtp();

  // Resend cooldown ticker
  useEffect(() => {
    if (resendIn <= 0) return;
    const id = window.setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(id);
  }, [resendIn]);

  const normalizedPhone = phone.trim();

  const submitPhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!E164.test(normalizedPhone)) {
      setPhoneError(t('auth.otp.invalidPhone'));
      return;
    }
    setPhoneError(null);
    requestOtp.mutate(
      { phoneE164: normalizedPhone },
      {
        onSuccess: (result) => {
          setStep('code');
          setResendIn(result.resendAvailableInSeconds);
          setCode('');
          setCodeError(null);
          // Defer focus so the cell is rendered before we focus it
          window.setTimeout(() => otpRef.current?.focus(), 0);
        },
        onError: (err: unknown) => {
          const msg = errorMessage(err) ?? t('auth.otp.requestFailed');
          setPhoneError(msg);
        },
      }
    );
  };

  const verifyCurrent = (current: string) => {
    setCodeError(null);
    verifyOtp.mutate(
      { phoneE164: normalizedPhone, code: current },
      {
        onError: (err: unknown) => {
          const msg = errorMessage(err) ?? t('auth.otp.invalidCode');
          setCodeError(msg);
          otpRef.current?.clear();
          setCode('');
          window.setTimeout(() => otpRef.current?.focus(), 0);
        },
      }
    );
  };

  const submitCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setCodeError(t('auth.otp.invalidCode'));
      return;
    }
    verifyCurrent(code);
  };

  const resend = () => {
    if (resendIn > 0) return;
    requestOtp.mutate(
      { phoneE164: normalizedPhone },
      {
        onSuccess: (result) => {
          setResendIn(result.resendAvailableInSeconds);
          setCodeError(null);
        },
      }
    );
  };

  if (step === 'phone') {
    return (
      <form onSubmit={submitPhone} className="space-y-4">
        <Input
          label={t('auth.phone')}
          type="tel"
          inputMode="tel"
          placeholder="+9647xxxxxxxxx"
          autoComplete="tel"
          leftIcon={<Phone className="h-4 w-4" />}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={phoneError ?? undefined}
        />
        <p className="text-xs text-text-muted">{t('auth.otp.phoneHint')}</p>
        <Button type="submit" className="w-full" isLoading={requestOtp.isPending}>
          {t('auth.otp.sendCode')}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={submitCode} className="space-y-5">
      <div className="text-center">
        <p className="text-sm text-text-secondary">
          {t('auth.otp.sentTo', { phone: normalizedPhone })}
        </p>
      </div>

      <OtpInput
        ref={otpRef}
        value={code}
        onChange={setCode}
        onComplete={(c) => verifyCurrent(c)}
        disabled={verifyOtp.isPending}
        hasError={!!codeError}
        autoFocus
      />

      {codeError && (
        <p className="text-center text-sm text-error" role="alert">
          {codeError}
        </p>
      )}

      <Button type="submit" className="w-full" isLoading={verifyOtp.isPending}>
        {t('auth.otp.verify')}
      </Button>

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
          onClick={resend}
          disabled={resendIn > 0 || requestOtp.isPending}
          className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-primary-400"
        >
          <RotateCcw className="h-4 w-4" />
          {resendIn > 0 ? t('auth.otp.resendIn', { seconds: resendIn }) : t('auth.otp.resend')}
        </button>
      </div>
    </form>
  );
}

function errorMessage(err: unknown): string | undefined {
  if (typeof err !== 'object' || err === null) return undefined;
  const anyErr = err as { response?: { data?: { message?: string; error?: string } } };
  return anyErr.response?.data?.message ?? anyErr.response?.data?.error;
}

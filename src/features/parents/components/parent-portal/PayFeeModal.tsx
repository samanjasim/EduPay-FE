import { useState } from 'react';
import { CreditCard, Wallet, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui';
import { cn } from '@/utils';
import { usePayFeeWithGateway, usePayFeeWithWallet } from '@/features/wallets/api/wallets.queries';
import { formatCurrency, formatDueDate } from '../../utils/format';

export interface PayFeeModalFee {
  feeInstanceId: string;
  title: string;
  schoolName: string;
  amount: number;
  currency: string;
  dueDate: string;
  schoolId?: string;
}

interface Props {
  fee: PayFeeModalFee | null;
  open: boolean;
  onClose: () => void;
  onPaid?: () => void;
}

type Method = 'wallet' | 'gateway';

export function PayFeeModal({ fee, open, onClose, onPaid }: Props) {
  const { t, i18n } = useTranslation();
  const [method, setMethod] = useState<Method>('wallet');

  const wallet = usePayFeeWithWallet();
  const gateway = usePayFeeWithGateway();
  const isPending = wallet.isPending || gateway.isPending;

  if (!open || !fee) return null;

  const submit = () => {
    if (method === 'wallet') {
      wallet.mutate(
        { feeInstanceId: fee.feeInstanceId, schoolId: fee.schoolId },
        {
          onSuccess: () => {
            onPaid?.();
            onClose();
          },
        }
      );
    } else {
      gateway.mutate(
        { feeInstanceId: fee.feeInstanceId, gateway: 'ZainCash', schoolId: fee.schoolId },
        {
          onSuccess: () => {
            // Existing hook opens the gateway in a new tab + toasts. Close the modal either way.
            onPaid?.();
            onClose();
          },
        }
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pay-fee-modal-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-3xl border border-border bg-surface p-6 shadow-soft-lg sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p id="pay-fee-modal-title" className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
              {t('parent.pay.title')}
            </p>
            <h2 className="mt-1 text-xl font-bold text-text-primary">{fee.title}</h2>
            <p className="text-xs text-text-muted">
              {fee.schoolName} · {t('parent.upcoming.due', { date: formatDueDate(fee.dueDate, i18n.resolvedLanguage) })}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close', 'Close')}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-text-secondary hover:bg-hover"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="mt-6 rounded-2xl bg-surface-200 p-4 dark:bg-white/5">
          <p className="text-xs uppercase tracking-wider text-text-muted">{t('parent.pay.amount')}</p>
          <p className="mt-1 text-2xl font-bold text-text-primary tabular-nums">
            {fee.currency} {formatCurrency(fee.amount, i18n.resolvedLanguage)}
          </p>
        </div>

        <fieldset className="mt-5">
          <legend className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
            {t('parent.pay.method')}
          </legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <MethodCard
              active={method === 'wallet'}
              onClick={() => setMethod('wallet')}
              icon={<Wallet className="h-5 w-5" aria-hidden />}
              label={t('parent.pay.wallet')}
              description={t('parent.pay.walletHint')}
            />
            <MethodCard
              active={method === 'gateway'}
              onClick={() => setMethod('gateway')}
              icon={<CreditCard className="h-5 w-5" aria-hidden />}
              label={t('parent.pay.gateway')}
              description={t('parent.pay.gatewayHint')}
            />
          </div>
        </fieldset>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button type="button" onClick={submit} isLoading={isPending}>
            {t('parent.pay.confirm', { amount: formatCurrency(fee.amount, i18n.resolvedLanguage), currency: fee.currency })}
          </Button>
        </div>
      </div>
    </div>
  );
}

function MethodCard({
  active,
  onClick,
  icon,
  label,
  description,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex flex-col items-start gap-2 rounded-2xl border p-3 text-start transition-colors',
        active
          ? 'border-primary-500 bg-primary-50 text-primary-700 ring-1 ring-primary-500/40 dark:bg-primary-500/10 dark:text-primary-300'
          : 'border-border bg-surface text-text-secondary hover:bg-hover'
      )}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-text-primary/5">
        {icon}
      </span>
      <span className="text-sm font-semibold">{label}</span>
      <span className="text-[11px] text-text-muted">{description}</span>
    </button>
  );
}

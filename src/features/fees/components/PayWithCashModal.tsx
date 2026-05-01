import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { InfoField } from '@/components/common';
import { Button, Input, Modal, ModalFooter, Textarea } from '@/components/ui';
import { usePayFeeWithCash } from '../api';

const cashPaymentSchema = (remainingAmount: number) => z.object({
  amount: z
    .number({ message: 'Amount is required' })
    .positive('Must be positive')
    .max(remainingAmount, `Cannot exceed remaining amount (${remainingAmount.toLocaleString()})`),
  note: z.string().max(500).optional(),
});

type CashPaymentFormData = {
  amount: number;
  note?: string;
};

function createCashPaymentIdempotencyKey() {
  return globalThis.crypto?.randomUUID?.() ?? `cash-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

interface PayWithCashModalProps {
  isOpen: boolean;
  onClose: () => void;
  feeInstanceId: string;
  schoolId: string;
  feeTypeName: string;
  remainingAmount: number;
}

export function PayWithCashModal({
  isOpen,
  onClose,
  feeInstanceId,
  schoolId,
  feeTypeName,
  remainingAmount,
}: PayWithCashModalProps) {
  const { t } = useTranslation();
  const { mutate, isPending } = usePayFeeWithCash();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CashPaymentFormData>({
    resolver: zodResolver(cashPaymentSchema(remainingAmount)),
    defaultValues: { amount: remainingAmount, note: '' },
  });

  const onSubmit = (data: CashPaymentFormData) => {
    mutate(
      {
        id: feeInstanceId,
        schoolId,
        data: {
          amount: data.amount,
          note: data.note?.trim() || undefined,
          clientIdempotencyKey: createCashPaymentIdempotencyKey(),
        },
      },
      { onSuccess: onClose }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('feeInstances.recordCashPayment')} size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-background p-3 text-sm">
          <InfoField label={t('feeInstances.feeType')}>{feeTypeName}</InfoField>
          <InfoField label={t('feeInstances.remaining')}>{remainingAmount.toLocaleString()}</InfoField>
        </div>
        <Input
          label={t('feeInstances.cashAmountLabel')}
          type="number"
          step="0.01"
          min="0"
          max={remainingAmount}
          error={errors.amount?.message}
          {...register('amount', { valueAsNumber: true })}
        />
        <Textarea
          label={t('feeInstances.cashNoteLabel')}
          rows={3}
          error={errors.note?.message}
          {...register('note')}
        />
        <ModalFooter>
          <Button variant="secondary" type="button" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" isLoading={isPending}>
            {t('feeInstances.recordCashPayment')}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

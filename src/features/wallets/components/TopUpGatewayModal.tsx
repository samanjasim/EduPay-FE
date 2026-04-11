import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Select, Modal, ModalFooter } from '@/components/ui';
import { useTopUpWalletGateway } from '../api';
import type { PaymentGateway } from '@/types';

const schema = z.object({
  amount: z.number({ message: 'Required' }).positive('Must be > 0'),
});

type FormData = z.infer<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  walletId: string;
}

export function TopUpGatewayModal({ isOpen, onClose, walletId }: Props) {
  const { t } = useTranslation();
  const [gateway, setGateway] = useState<PaymentGateway>('ZainCash');
  const { mutate, isPending } = useTopUpWalletGateway();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { amount: 0 },
  });

  const gatewayOptions = [{ value: 'ZainCash', label: 'ZainCash' }];

  const onSubmit = (data: FormData) => {
    mutate(
      { id: walletId, data: { amount: data.amount, gateway } },
      { onSuccess: onClose }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('wallets.topUpGateway')} size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Select
          label={t('wallets.gateway')}
          options={gatewayOptions}
          value={gateway}
          onChange={(v) => setGateway(v as PaymentGateway)}
        />
        <Input
          label={t('wallets.amount')}
          type="number"
          step="0.01"
          error={errors.amount?.message}
          {...register('amount', { valueAsNumber: true })}
        />
        <ModalFooter>
          <Button variant="secondary" type="button" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" isLoading={isPending}>
            {t('wallets.initiateTopUp')}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

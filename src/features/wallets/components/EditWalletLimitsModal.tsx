import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Modal, ModalFooter } from '@/components/ui';
import { useUpdateWallet } from '../api';
import type { WalletDto } from '@/types';

const schema = z.object({
  dailySpendingLimit: z.number({ message: 'Required' }).min(0, 'Must be ≥ 0'),
  perTransactionLimit: z.number({ message: 'Required' }).min(0, 'Must be ≥ 0'),
});

type FormData = z.infer<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  wallet: WalletDto;
}

export function EditWalletLimitsModal({ isOpen, onClose, wallet }: Props) {
  const { t } = useTranslation();
  const { mutate, isPending } = useUpdateWallet();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      dailySpendingLimit: wallet.dailySpendingLimit,
      perTransactionLimit: wallet.perTransactionLimit,
    },
  });

  const onSubmit = (data: FormData) => {
    mutate({ id: wallet.id, data }, { onSuccess: onClose });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('wallets.editLimits')} size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label={t('wallets.dailyLimit')}
          type="number"
          step="0.01"
          error={errors.dailySpendingLimit?.message}
          {...register('dailySpendingLimit', { valueAsNumber: true })}
        />
        <Input
          label={t('wallets.perTransactionLimit')}
          type="number"
          step="0.01"
          error={errors.perTransactionLimit?.message}
          {...register('perTransactionLimit', { valueAsNumber: true })}
        />
        <ModalFooter>
          <Button variant="secondary" type="button" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" isLoading={isPending}>
            {t('common.save')}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Textarea, Modal, ModalFooter } from '@/components/ui';
import { useTopUpWalletCash } from '../api';

const schema = z.object({
  amount: z.number({ message: 'Required' }).positive('Must be > 0'),
  note: z.string().max(500).optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  walletId: string;
}

export function TopUpCashModal({ isOpen, onClose, walletId }: Props) {
  const { t } = useTranslation();
  const { mutate, isPending } = useTopUpWalletCash();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { amount: 0, note: '' },
  });

  const onSubmit = (data: FormData) => {
    mutate({ id: walletId, data }, { onSuccess: onClose });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('wallets.topUpCash')} size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label={t('wallets.amount')}
          type="number"
          step="0.01"
          error={errors.amount?.message}
          {...register('amount', { valueAsNumber: true })}
        />
        <Textarea
          label={t('wallets.note')}
          rows={3}
          error={errors.note?.message}
          {...register('note')}
        />
        <ModalFooter>
          <Button variant="secondary" type="button" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" isLoading={isPending}>
            {t('wallets.topUp')}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

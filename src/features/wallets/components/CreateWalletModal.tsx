import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Select, Modal, ModalFooter, Spinner } from '@/components/ui';
import { useCreateWallet } from '../api';
import { useStudents, useStudent } from '@/features/students/api';

const schema = z.object({
  studentId: z.string().min(1, 'Student is required'),
  dailySpendingLimit: z
    .number({ message: 'Required' })
    .min(0, 'Must be ≥ 0'),
  perTransactionLimit: z
    .number({ message: 'Required' })
    .min(0, 'Must be ≥ 0'),
});

type FormData = z.infer<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateWalletModal({ isOpen, onClose }: Props) {
  const { t } = useTranslation();
  const [selectedStudentId, setSelectedStudentId] = useState('');

  const { data: studentsData, isLoading: studentsLoading } = useStudents({
    pageSize: 100,
  });
  const { data: studentDetail } = useStudent(selectedStudentId);

  const { mutate, isPending } = useCreateWallet();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      studentId: '',
      dailySpendingLimit: 0,
      perTransactionLimit: 0,
    },
  });

  const studentOptions = useMemo(() => {
    return (studentsData?.data ?? []).map((s) => ({
      value: s.id,
      label: `${s.fullNameEn} (${s.studentCode})`,
    }));
  }, [studentsData]);

  const onSubmit = (data: FormData) => {
    if (!studentDetail?.userId) {
      return;
    }
    mutate(
      {
        userId: studentDetail.userId,
        dailySpendingLimit: data.dailySpendingLimit,
        perTransactionLimit: data.perTransactionLimit,
      },
      { onSuccess: onClose }
    );
  };

  const noUserAccount = selectedStudentId && studentDetail && !studentDetail.userId;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('wallets.create')} size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {studentsLoading ? (
          <div className="flex justify-center py-4">
            <Spinner />
          </div>
        ) : (
          <Select
            label={t('wallets.student')}
            options={studentOptions}
            value={selectedStudentId}
            onChange={(v) => {
              setSelectedStudentId(v);
              setValue('studentId', v);
            }}
            error={errors.studentId?.message}
          />
        )}
        {noUserAccount && (
          <p className="text-sm text-red-500">{t('wallets.studentNoUserAccount')}</p>
        )}
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
          <Button type="submit" isLoading={isPending} disabled={!!noUserAccount}>
            {t('common.create')}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Modal, ModalFooter, Button, Input } from '@/components/ui';
import { useUpdateGrade } from '@/features/grades/api';
import type { GradeWithStatsDto } from '@/types';

interface EditGradeForm {
  name: string;
  sortOrder: number;
}

interface EditGradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  grade: GradeWithStatsDto;
}

export function EditGradeModal({ isOpen, onClose, grade }: EditGradeModalProps) {
  const { t } = useTranslation();
  const updateGrade = useUpdateGrade();

  const { register, handleSubmit, formState: { errors } } = useForm<EditGradeForm>({
    defaultValues: {
      name: grade.name,
      sortOrder: grade.sortOrder,
    },
  });

  const onSubmit = (data: EditGradeForm) => {
    updateGrade.mutate(
      { id: grade.id, data },
      { onSuccess: () => onClose() }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('schoolPortal.grades.editGrade')} size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label={t('schoolPortal.grades.gradeName')}
          {...register('name', { required: t('validation.required') })}
          error={errors.name?.message}
        />
        <Input
          label={t('schoolPortal.grades.sortOrder')}
          type="number"
          {...register('sortOrder', { required: true, valueAsNumber: true })}
        />
        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" isLoading={updateGrade.isPending}>
            {t('common.save')}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Modal, ModalFooter, Button, Input } from '@/components/ui';
import { useAddSection } from '@/features/grades/api';

interface AddSectionForm {
  name: string;
  capacity: string;
}

interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  gradeId: string;
}

export function AddSectionModal({ isOpen, onClose, gradeId }: AddSectionModalProps) {
  const { t } = useTranslation();
  const addSection = useAddSection();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddSectionForm>({
    defaultValues: { name: '', capacity: '' },
  });

  const onSubmit = (data: AddSectionForm) => {
    addSection.mutate(
      {
        gradeId,
        data: {
          name: data.name.trim(),
          capacity: data.capacity ? parseInt(data.capacity, 10) : null,
        },
      },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('schoolPortal.grades.addSection')} size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label={t('schoolPortal.grades.sectionName')}
          {...register('name', { required: t('validation.required') })}
          error={errors.name?.message}
          placeholder="e.g. A, B, C"
        />
        <Input
          label={t('schoolPortal.grades.capacity')}
          type="number"
          {...register('capacity')}
          placeholder={t('schoolPortal.grades.capacityPlaceholder')}
        />
        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" isLoading={addSection.isPending}>
            {t('common.create')}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Modal, ModalFooter, Button, Input } from '@/components/ui';
import { useUpdateSection } from '@/features/grades/api';
import type { SectionWithStatsDto } from '@/types';

interface EditSectionForm {
  name: string;
  capacity: string;
}

interface EditSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  gradeId: string;
  section: SectionWithStatsDto;
}

export function EditSectionModal({ isOpen, onClose, gradeId, section }: EditSectionModalProps) {
  const { t } = useTranslation();
  const updateSection = useUpdateSection();

  const { register, handleSubmit, formState: { errors } } = useForm<EditSectionForm>({
    defaultValues: {
      name: section.name,
      capacity: section.capacity?.toString() ?? '',
    },
  });

  const onSubmit = (data: EditSectionForm) => {
    updateSection.mutate(
      {
        gradeId,
        sectionId: section.id,
        data: {
          name: data.name.trim(),
          capacity: data.capacity ? parseInt(data.capacity, 10) : null,
        },
      },
      { onSuccess: () => onClose() }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('schoolPortal.grades.editSection')} size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label={t('schoolPortal.grades.sectionName')}
          {...register('name', { required: t('validation.required') })}
          error={errors.name?.message}
        />
        <Input
          label={t('schoolPortal.grades.capacity')}
          type="number"
          {...register('capacity')}
        />
        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" isLoading={updateSection.isPending}>
            {t('common.save')}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

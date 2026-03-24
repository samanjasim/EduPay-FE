import { useForm, useFieldArray } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Plus, X } from 'lucide-react';
import { Modal, ModalFooter, Button, Input } from '@/components/ui';
import { useCreateGrade } from '@/features/grades/api';

interface CreateGradeForm {
  name: string;
  sortOrder: number;
  sections: { name: string; capacity: string }[];
}

interface CreateGradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateGradeModal({ isOpen, onClose }: CreateGradeModalProps) {
  const { t } = useTranslation();
  const createGrade = useCreateGrade();

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<CreateGradeForm>({
    defaultValues: {
      name: '',
      sortOrder: 1,
      sections: [{ name: 'A', capacity: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'sections' });

  const onSubmit = (data: CreateGradeForm) => {
    createGrade.mutate(
      {
        name: data.name,
        sortOrder: data.sortOrder,
        sections: data.sections
          .filter((s) => s.name.trim())
          .map((s) => ({
            name: s.name.trim(),
            capacity: s.capacity ? parseInt(s.capacity, 10) : null,
          })),
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
    <Modal isOpen={isOpen} onClose={onClose} title={t('schoolPortal.grades.addGrade')} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label={t('schoolPortal.grades.gradeName')}
          {...register('name', { required: t('validation.required') })}
          error={errors.name?.message}
          placeholder={t('schoolPortal.grades.gradeNamePlaceholder')}
        />

        <Input
          label={t('schoolPortal.grades.sortOrder')}
          type="number"
          {...register('sortOrder', { required: true, valueAsNumber: true })}
          error={errors.sortOrder?.message}
        />

        {/* Sections */}
        <div>
          <label className="mb-2 block text-sm font-medium text-text-primary">
            {t('schoolPortal.grades.sections')}
          </label>
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <Input
                  {...register(`sections.${index}.name`, { required: true })}
                  placeholder={t('schoolPortal.grades.sectionName')}
                  className="flex-1"
                />
                <Input
                  {...register(`sections.${index}.capacity`)}
                  placeholder={t('schoolPortal.grades.capacity')}
                  type="number"
                  className="w-24"
                />
                {fields.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => append({ name: '', capacity: '' })}
          >
            <Plus className="h-3.5 w-3.5 ltr:mr-1 rtl:ml-1" />
            {t('schoolPortal.grades.addSection')}
          </Button>
        </div>

        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" isLoading={createGrade.isPending}>
            {t('common.create')}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

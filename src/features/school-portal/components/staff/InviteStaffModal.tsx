import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Modal, ModalFooter, Button, Input } from '@/components/ui';
import { useInviteStaff } from '../../api/school-portal.queries';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';

interface InviteStaffForm {
  email: string;
  fullName: string;
}

interface InviteStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolId: string;
}

export function InviteStaffModal({ isOpen, onClose, schoolId }: InviteStaffModalProps) {
  const { t } = useTranslation();
  const inviteStaff = useInviteStaff(schoolId || undefined);

  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<InviteStaffForm>({
    defaultValues: { email: '', fullName: '' },
  });

  const onSubmit = (data: InviteStaffForm) => {
    inviteStaff.mutate(data, {
      onSuccess: () => {
        reset();
        onClose();
      },
      onError: (error) => {
        if (isAxiosError(error)) {
          const code = error.response?.data?.error?.code;
          if (code === 'School.StaffAlreadyExists') {
            setError('email', { message: t('schoolPortal.staff.alreadyExists') });
          } else if (code === 'School.StaffBelongsToAnotherSchool') {
            setError('email', { message: t('schoolPortal.staff.belongsToAnotherSchool') });
          } else {
            toast.error(error.response?.data?.error?.message || 'Failed to invite staff');
          }
        }
      },
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('schoolPortal.staff.invite')} size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label={t('schoolPortal.staff.fullName')}
          {...register('fullName', { required: t('validation.required') })}
          error={errors.fullName?.message}
          placeholder={t('schoolPortal.staff.fullNamePlaceholder')}
        />
        <Input
          label={t('schoolPortal.staff.email')}
          type="email"
          {...register('email', { required: t('validation.required') })}
          error={errors.email?.message}
          placeholder={t('schoolPortal.staff.emailPlaceholder')}
        />
        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" isLoading={inviteStaff.isPending}>
            {t('schoolPortal.staff.sendInvite')}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Tag, Ban, XCircle } from 'lucide-react';
import { Card, CardContent, Badge, Spinner, Button, Input, Textarea, Modal, ModalFooter } from '@/components/ui';
import { PageHeader, InfoField } from '@/components/common';
import { useFeeInstance, useApplyDiscount, useWaiveFee, useCancelFee } from '../api';
import { usePermissions } from '@/hooks';
import { PERMISSIONS } from '@/constants';
import { ROUTES } from '@/config';
import { format } from 'date-fns';
import type { FeeInstanceStatus } from '@/types';

const STATUS_BADGE_VARIANT: Record<FeeInstanceStatus, 'default' | 'success' | 'warning' | 'error'> = {
  Pending: 'warning',
  Paid: 'success',
  Overdue: 'error',
  Waived: 'default',
  Cancelled: 'default',
};

const discountSchema = z.object({
  discountAmount: z.number({ message: 'Amount is required' }).positive('Must be positive'),
  reason: z.string().min(1, 'Reason is required').max(500),
});
type DiscountFormData = z.infer<typeof discountSchema>;

const reasonSchema = z.object({
  reason: z.string().min(1, 'Reason is required').max(500),
});
type ReasonFormData = z.infer<typeof reasonSchema>;

export default function FeeInstanceDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { hasPermission } = usePermissions();
  const { data: feeInstance, isLoading } = useFeeInstance(id!);

  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showWaiveModal, setShowWaiveModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const canUpdate = hasPermission(PERMISSIONS.Fees.Update);

  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  if (!feeInstance) return <div className="py-12 text-center text-text-muted">{t('common.noResults')}</div>;

  const canTakeAction = canUpdate && (feeInstance.status === 'Pending' || feeInstance.status === 'Overdue');

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${feeInstance.feeTypeName} - ${feeInstance.studentName}`}
        subtitle={t('feeInstances.detailSubtitle')}
        backTo={ROUTES.FEE_INSTANCES.LIST}
        backLabel={t('feeInstances.backToList')}
      />

      <Card>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoField label={t('common.status')}>
            <Badge variant={STATUS_BADGE_VARIANT[feeInstance.status]} size="sm">
              {t(`feeInstances.${feeInstance.status.toLowerCase()}`)}
            </Badge>
          </InfoField>
          <InfoField label={t('feeInstances.student')}>{feeInstance.studentName}</InfoField>
          <InfoField label={t('feeInstances.feeStructure')}>{feeInstance.feeStructureName}</InfoField>
          <InfoField label={t('feeInstances.feeType')}>{feeInstance.feeTypeName}</InfoField>
          <InfoField label={t('feeInstances.amount')}>{feeInstance.amount.toLocaleString()}</InfoField>
          <InfoField label={t('feeInstances.discount')}>{feeInstance.discountAmount.toLocaleString()}</InfoField>
          <InfoField label={t('feeInstances.netAmount')}>{feeInstance.netAmount.toLocaleString()}</InfoField>
          <InfoField label={t('feeInstances.paidAmount')}>{feeInstance.paidAmount.toLocaleString()}</InfoField>
          <InfoField label={t('feeInstances.remaining')}>{feeInstance.remainingAmount.toLocaleString()}</InfoField>
          <InfoField label={t('feeInstances.dueDate')}>{feeInstance.dueDate}</InfoField>
          {feeInstance.paidAt && <InfoField label={t('feeInstances.paidAt')}>{format(new Date(feeInstance.paidAt), 'MMM d, yyyy')}</InfoField>}
          {feeInstance.discountReason && <div className="sm:col-span-2"><InfoField label={t('feeInstances.discountReason')}>{feeInstance.discountReason}</InfoField></div>}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {canTakeAction && (
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowDiscountModal(true)}
            leftIcon={<Tag className="h-4 w-4" />}
          >
            {t('feeInstances.applyDiscount')}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowWaiveModal(true)}
            leftIcon={<Ban className="h-4 w-4" />}
          >
            {t('feeInstances.waiveFee')}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowCancelModal(true)}
            leftIcon={<XCircle className="h-4 w-4" />}
          >
            {t('feeInstances.cancelFee')}
          </Button>
        </div>
      )}

      {/* Status History */}
      {feeInstance.statusHistory.length > 0 && (
        <Card>
          <CardContent>
            <h3 className="text-sm font-medium text-text-primary mb-4">{t('feeInstances.statusHistory')}</h3>
            <div className="space-y-3">
              {feeInstance.statusHistory.map((h) => (
                <div key={h.id} className="flex items-start gap-3 text-sm border-l-2 border-border pl-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" size="sm">{h.oldStatus}</Badge>
                      <span className="text-text-muted">→</span>
                      <Badge variant="default" size="sm">{h.newStatus}</Badge>
                    </div>
                    {h.reason && <p className="mt-1 text-text-secondary">{h.reason}</p>}
                  </div>
                  <span className="text-text-muted text-xs shrink-0">{format(new Date(h.createdAt), 'MMM d, yyyy HH:mm')}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Apply Discount Modal */}
      {showDiscountModal && (
        <ApplyDiscountModal
          isOpen={showDiscountModal}
          onClose={() => setShowDiscountModal(false)}
          feeInstanceId={id!}
        />
      )}

      {/* Waive Fee Modal */}
      {showWaiveModal && (
        <WaiveFeeModal
          isOpen={showWaiveModal}
          onClose={() => setShowWaiveModal(false)}
          feeInstanceId={id!}
        />
      )}

      {/* Cancel Fee Modal */}
      {showCancelModal && (
        <CancelFeeModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          feeInstanceId={id!}
        />
      )}
    </div>
  );
}

/* ─── Apply Discount Modal ─── */

function ApplyDiscountModal({
  isOpen,
  onClose,
  feeInstanceId,
}: {
  isOpen: boolean;
  onClose: () => void;
  feeInstanceId: string;
}) {
  const { t } = useTranslation();
  const { mutate, isPending } = useApplyDiscount();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DiscountFormData>({
    resolver: zodResolver(discountSchema),
    defaultValues: { discountAmount: 0, reason: '' },
  });

  const onSubmit = (data: DiscountFormData) => {
    mutate({ id: feeInstanceId, data }, { onSuccess: onClose });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('feeInstances.applyDiscount')} size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label={t('feeInstances.discountAmountLabel')}
          type="number"
          step="0.01"
          error={errors.discountAmount?.message}
          {...register('discountAmount', { valueAsNumber: true })}
        />
        <Textarea
          label={t('feeInstances.reason')}
          rows={3}
          error={errors.reason?.message}
          {...register('reason')}
        />
        <ModalFooter>
          <Button variant="secondary" type="button" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" isLoading={isPending}>
            {t('feeInstances.applyDiscount')}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

/* ─── Waive Fee Modal ─── */

function WaiveFeeModal({
  isOpen,
  onClose,
  feeInstanceId,
}: {
  isOpen: boolean;
  onClose: () => void;
  feeInstanceId: string;
}) {
  const { t } = useTranslation();
  const { mutate, isPending } = useWaiveFee();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReasonFormData>({
    resolver: zodResolver(reasonSchema),
    defaultValues: { reason: '' },
  });

  const onSubmit = (data: ReasonFormData) => {
    mutate({ id: feeInstanceId, data }, { onSuccess: onClose });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('feeInstances.waiveFee')} size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <p className="text-sm text-text-secondary">{t('feeInstances.waiveConfirmation')}</p>
        <Textarea
          label={t('feeInstances.reason')}
          rows={3}
          error={errors.reason?.message}
          {...register('reason')}
        />
        <ModalFooter>
          <Button variant="secondary" type="button" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" isLoading={isPending} variant="danger">
            {t('feeInstances.waiveFee')}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

/* ─── Cancel Fee Modal ─── */

function CancelFeeModal({
  isOpen,
  onClose,
  feeInstanceId,
}: {
  isOpen: boolean;
  onClose: () => void;
  feeInstanceId: string;
}) {
  const { t } = useTranslation();
  const { mutate, isPending } = useCancelFee();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReasonFormData>({
    resolver: zodResolver(reasonSchema),
    defaultValues: { reason: '' },
  });

  const onSubmit = (data: ReasonFormData) => {
    mutate({ id: feeInstanceId, data }, { onSuccess: onClose });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('feeInstances.cancelFee')} size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <p className="text-sm text-text-secondary">{t('feeInstances.cancelConfirmation')}</p>
        <Textarea
          label={t('feeInstances.reason')}
          rows={3}
          error={errors.reason?.message}
          {...register('reason')}
        />
        <ModalFooter>
          <Button variant="secondary" type="button" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" isLoading={isPending} variant="danger">
            {t('feeInstances.cancelFee')}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

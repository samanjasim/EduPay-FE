import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Tag, Ban, XCircle, Wallet as WalletIcon, CreditCard, Banknote, Download } from 'lucide-react';
import { Card, CardContent, Badge, Spinner, Button, Input, Textarea, Modal, ModalFooter } from '@/components/ui';
import { PageHeader, InfoField, ConfirmModal } from '@/components/common';
import { useFeeInstance, useApplyDiscount, useWaiveFee, useCancelFee } from '../api';
import { PayWithCashModal } from '../components/PayWithCashModal';
import { usePayFeeWithWallet, usePayFeeWithGateway } from '@/features/wallets/api';
import { ordersApi } from '@/features/orders/api';
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
  const location = useLocation();
  const { hasPermission, hasAnyPermission } = usePermissions();
  const isSchoolPortal = location.pathname.startsWith('/school/');
  const backTo = isSchoolPortal ? ROUTES.SCHOOL.FEES : ROUTES.FEE_INSTANCES.LIST;
  const backLabel = isSchoolPortal ? t('schoolPortal.nav.fees') : t('feeInstances.backToList');
  const { data: feeInstance, isLoading } = useFeeInstance(id!);

  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showWaiveModal, setShowWaiveModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showPayWithCashModal, setShowPayWithCashModal] = useState(false);
  const [showPayWithWalletModal, setShowPayWithWalletModal] = useState(false);

  const canUpdate = hasPermission(PERMISSIONS.Fees.Update);
  const canPayOnline = hasPermission(PERMISSIONS.Payments.Create);
  const canRecordCash = hasPermission(PERMISSIONS.CashCollections.Create);
  const canViewOrderDetail = hasPermission(PERMISSIONS.Orders.View);
  const canDownloadReceipt = hasAnyPermission([
    PERMISSIONS.Orders.View,
    PERMISSIONS.CashCollections.View,
    PERMISSIONS.CashCollections.Create,
  ]);
  const { mutate: payWithWallet, isPending: walletPaying } = usePayFeeWithWallet();
  const { mutate: payWithGateway, isPending: gatewayPaying } = usePayFeeWithGateway();

  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  if (!feeInstance) return <div className="py-12 text-center text-text-muted">{t('common.noResults')}</div>;

  const canTakeAction = canUpdate && (feeInstance.status === 'Pending' || feeInstance.status === 'Overdue');
  const canPayFeeOnline = canPayOnline && (feeInstance.status === 'Pending' || feeInstance.status === 'Overdue');
  const canRecordCashPayment = canRecordCash && (feeInstance.status === 'Pending' || feeInstance.status === 'Overdue');

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${feeInstance.feeTypeName} - ${feeInstance.studentName}`}
        subtitle={t('feeInstances.detailSubtitle')}
        backTo={backTo}
        backLabel={backLabel}
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

      {/* Payment Details (when paid) */}
      {feeInstance.paidOrderId && (
        <Card>
          <CardContent>
            <h3 className="text-sm font-medium text-text-primary mb-4">{t('feeInstances.paymentDetails')}</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <InfoField label={t('feeInstances.receiptNumber')}>
                {canViewOrderDetail ? (
                  <Link
                    to={ROUTES.ORDERS.getDetail(feeInstance.paidOrderId)}
                    className="text-primary hover:underline"
                  >
                    {feeInstance.paidOrderReceiptNumber ?? feeInstance.paidOrderId}
                  </Link>
                ) : (
                  <span className="font-mono text-xs">{feeInstance.paidOrderReceiptNumber ?? feeInstance.paidOrderId}</span>
                )}
              </InfoField>
              {feeInstance.paidOrderPaymentMethod && (
                <InfoField label={t('feeInstances.paymentMethod')}>
                  {feeInstance.paidOrderPaymentMethod}
                </InfoField>
              )}
              {feeInstance.paidByUserName && (
                <InfoField label={t('feeInstances.paidBy')}>
                  {feeInstance.paidByUserName}
                </InfoField>
              )}
            </div>
            {canDownloadReceipt && (
              <div className="mt-4">
                <Button
                  size="sm"
                  variant="secondary"
                  leftIcon={<Download className="h-4 w-4" />}
                  onClick={() => ordersApi.downloadReceipt(feeInstance.paidOrderId!, feeInstance.paidOrderReceiptNumber ?? undefined)}
                >
                  {t('orders.downloadReceipt')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payment Buttons */}
      {(canRecordCashPayment || canPayFeeOnline) && (
        <div className="flex items-center gap-2 flex-wrap">
          {canRecordCashPayment && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowPayWithCashModal(true)}
              leftIcon={<Banknote className="h-4 w-4" />}
            >
              {t('feeInstances.recordCashPayment')}
            </Button>
          )}
          {canPayFeeOnline && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowPayWithWalletModal(true)}
                isLoading={walletPaying}
                leftIcon={<WalletIcon className="h-4 w-4" />}
              >
                {t('wallets.payWithWallet')}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => payWithGateway({ feeInstanceId: id!, gateway: 'ZainCash', schoolId: feeInstance.schoolId })}
                isLoading={gatewayPaying}
                leftIcon={<CreditCard className="h-4 w-4" />}
              >
                {t('wallets.payWithGateway')}
              </Button>
            </>
          )}
        </div>
      )}

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

      {/* Pay With Cash Modal */}
      {showPayWithCashModal && (
        <PayWithCashModal
          isOpen={showPayWithCashModal}
          onClose={() => setShowPayWithCashModal(false)}
          feeInstanceId={id!}
          schoolId={feeInstance.schoolId}
          feeTypeName={feeInstance.feeTypeName}
          remainingAmount={feeInstance.remainingAmount}
        />
      )}

      {/* Pay With Wallet Confirm Modal */}
      <ConfirmModal
        isOpen={showPayWithWalletModal}
        onClose={() => setShowPayWithWalletModal(false)}
        onConfirm={() =>
          payWithWallet(
            { feeInstanceId: id!, schoolId: feeInstance.schoolId },
            {
              onSuccess: () => setShowPayWithWalletModal(false),
              onError: () => setShowPayWithWalletModal(false),
            }
          )
        }
        title={t('wallets.confirmPayWithWalletTitle')}
        description={t('wallets.confirmPayWithWalletMessage', {
          amount: feeInstance.remainingAmount.toLocaleString(),
          feeType: feeInstance.feeTypeName,
        })}
        confirmLabel={t('wallets.confirmPayWithWalletAction')}
        cancelLabel={t('common.cancel')}
        variant="primary"
        isLoading={walletPaying}
      />
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

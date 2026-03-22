import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, Badge, Spinner } from '@/components/ui';
import { PageHeader, InfoField } from '@/components/common';
import { useFeeInstance } from '../api';
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

export default function FeeInstanceDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: feeInstance, isLoading } = useFeeInstance(id!);

  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  if (!feeInstance) return <div className="py-12 text-center text-text-muted">{t('common.notFound')}</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${feeInstance.feeTypeName} - ${feeInstance.studentName}`}
        subtitle={t('feeInstances.detailSubtitle')}
        backButton={{ label: t('feeInstances.backToList'), onClick: () => navigate(ROUTES.FEE_INSTANCES.LIST) }}
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
          {feeInstance.discountReason && <InfoField label={t('feeInstances.discountReason')} className="sm:col-span-2">{feeInstance.discountReason}</InfoField>}
        </CardContent>
      </Card>

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
    </div>
  );
}

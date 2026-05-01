import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, CreditCard, Settings, Trash2, Snowflake, Play, Ban } from 'lucide-react';
import { Card, CardContent, Badge, Spinner, Button } from '@/components/ui';
import { PageHeader, InfoField, ConfirmModal } from '@/components/common';
import { format } from 'date-fns';
import { useWallet, useDeleteWallet, useUpdateWalletStatus } from '../api';
import { usePermissions } from '@/hooks';
import { PERMISSIONS } from '@/constants';
import { ROUTES } from '@/config';
import { TopUpCashModal } from '../components/TopUpCashModal';
import { TopUpGatewayModal } from '../components/TopUpGatewayModal';
import { EditWalletLimitsModal } from '../components/EditWalletLimitsModal';
import { WalletTransactionsTable } from '../components/WalletTransactionsTable';
import type { WalletStatus } from '@/types';

const STATUS_BADGE_VARIANT: Record<WalletStatus, 'default' | 'success' | 'warning' | 'error'> = {
  Active: 'success',
  Frozen: 'warning',
  Closed: 'error',
};

export default function WalletDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();

  const { data: wallet, isLoading } = useWallet(id!);
  const { mutate: deleteWallet, isPending: isDeleting } = useDeleteWallet();
  const { mutate: updateStatus, isPending: isStatusUpdating } = useUpdateWalletStatus();

  const [showTopUpCash, setShowTopUpCash] = useState(false);
  const [showTopUpGateway, setShowTopUpGateway] = useState(false);
  const [showEditLimits, setShowEditLimits] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [statusConfirm, setStatusConfirm] = useState<WalletStatus | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!wallet) {
    return <div className="py-12 text-center text-text-muted">{t('common.noResults')}</div>;
  }

  const canManage = hasPermission(PERMISSIONS.Wallets.Manage);
  const canTopUp = hasPermission(PERMISSIONS.Wallets.TopUp);
  const isActive = wallet.status === 'Active';
  const isClosed = wallet.status === 'Closed';

  const handleDelete = () => {
    deleteWallet(wallet.id, {
      onSuccess: () => navigate(ROUTES.WALLETS.LIST),
    });
  };

  const handleStatusChange = (target: WalletStatus) => {
    updateStatus(
      { id: wallet.id, data: { status: target } },
      { onSuccess: () => setStatusConfirm(null) }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('wallets.detailTitle')}
        subtitle={t('wallets.detailSubtitle')}
        backTo={ROUTES.WALLETS.LIST}
        backLabel={t('wallets.backToList')}
      />

      <Card>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoField label={t('common.status')}>
            <Badge variant={STATUS_BADGE_VARIANT[wallet.status]} size="sm">
              {t(`wallets.${wallet.status.toLowerCase()}`)}
            </Badge>
          </InfoField>
          <InfoField label={t('wallets.balance')}>
            <span className="text-lg font-semibold text-text-primary">
              {wallet.balance.toLocaleString()} {wallet.currency}
            </span>
          </InfoField>
          <InfoField label={t('wallets.userId')}>
            <span className="font-mono text-xs">{wallet.userId}</span>
          </InfoField>
          <InfoField label={t('wallets.dailyLimit')}>
            {wallet.dailySpendingLimit.toLocaleString()} {wallet.currency}
          </InfoField>
          <InfoField label={t('wallets.perTransactionLimit')}>
            {wallet.perTransactionLimit.toLocaleString()} {wallet.currency}
          </InfoField>
          <InfoField label={t('wallets.createdAt')}>
            {format(new Date(wallet.createdAt), 'MMM d, yyyy')}
          </InfoField>
        </CardContent>
      </Card>

      {/* Actions */}
      {!isClosed && (
        <div className="flex flex-wrap items-center gap-2">
          {canManage && isActive && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowTopUpCash(true)}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              {t('wallets.topUpCash')}
            </Button>
          )}
          {canTopUp && isActive && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowTopUpGateway(true)}
              leftIcon={<CreditCard className="h-4 w-4" />}
            >
              {t('wallets.topUpGateway')}
            </Button>
          )}
          {canManage && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowEditLimits(true)}
              leftIcon={<Settings className="h-4 w-4" />}
            >
              {t('wallets.editLimits')}
            </Button>
          )}
          {canManage && wallet.status === 'Active' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setStatusConfirm('Frozen')}
              leftIcon={<Snowflake className="h-4 w-4" />}
            >
              {t('wallets.freeze')}
            </Button>
          )}
          {canManage && wallet.status === 'Frozen' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setStatusConfirm('Active')}
              leftIcon={<Play className="h-4 w-4" />}
            >
              {t('wallets.activate')}
            </Button>
          )}
          {canManage && wallet.status !== 'Closed' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setStatusConfirm('Closed')}
              leftIcon={<Ban className="h-4 w-4" />}
            >
              {t('wallets.close')}
            </Button>
          )}
          {canManage && wallet.balance === 0 && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              leftIcon={<Trash2 className="h-4 w-4" />}
            >
              {t('common.delete')}
            </Button>
          )}
        </div>
      )}

      {/* Transactions */}
      <WalletTransactionsTable walletId={wallet.id} currency={wallet.currency} />

      {/* Modals */}
      {showTopUpCash && (
        <TopUpCashModal
          isOpen={showTopUpCash}
          onClose={() => setShowTopUpCash(false)}
          walletId={wallet.id}
        />
      )}
      {showTopUpGateway && (
        <TopUpGatewayModal
          isOpen={showTopUpGateway}
          onClose={() => setShowTopUpGateway(false)}
          walletId={wallet.id}
        />
      )}
      {showEditLimits && (
        <EditWalletLimitsModal
          isOpen={showEditLimits}
          onClose={() => setShowEditLimits(false)}
          wallet={wallet}
        />
      )}
      {showDeleteConfirm && (
        <ConfirmModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          title={t('wallets.confirmDeleteTitle')}
          description={t('wallets.confirmDeleteMessage')}
          confirmLabel={t('common.delete')}
          variant="danger"
          isLoading={isDeleting}
        />
      )}
      {statusConfirm && (
        <ConfirmModal
          isOpen={!!statusConfirm}
          onClose={() => setStatusConfirm(null)}
          onConfirm={() => handleStatusChange(statusConfirm)}
          title={t('wallets.confirmStatusTitle')}
          description={t('wallets.confirmStatusMessage', {
            status: t(`wallets.${statusConfirm.toLowerCase()}`),
          })}
          confirmLabel={t('common.confirm')}
          variant={statusConfirm === 'Closed' ? 'danger' : 'primary'}
          isLoading={isStatusUpdating}
        />
      )}
    </div>
  );
}

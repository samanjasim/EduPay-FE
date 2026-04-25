import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, History } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, Badge, Spinner, Pagination, Select } from '@/components/ui';
import { EmptyState } from '@/components/common';
import { useWalletTransactions } from '../api';
import { ROUTES } from '@/config';
import type {
  WalletTransactionType,
  WalletReferenceType,
  WalletTransactionListParams,
} from '@/types';

const PAGE_SIZE = 10;

interface Props {
  walletId: string;
  currency: string;
}

export function WalletTransactionsTable({ walletId, currency }: Props) {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [refFilter, setRefFilter] = useState<string>('');

  const params: WalletTransactionListParams = {
    pageNumber: page,
    pageSize: PAGE_SIZE,
    sortDescending: true,
    ...(typeFilter && { type: typeFilter as WalletTransactionType }),
    ...(refFilter && { referenceType: refFilter as WalletReferenceType }),
  };

  const { data, isLoading } = useWalletTransactions(walletId, params);
  const transactions = data?.data ?? [];
  const pagination = data?.pagination;

  const typeOptions = [
    { value: '', label: t('wallets.allTypes') },
    { value: 'Credit', label: t('wallets.credit') },
    { value: 'Debit', label: t('wallets.debit') },
  ];

  const refTypeOptions = [
    { value: '', label: t('wallets.allReferences') },
    { value: 'TopUp', label: t('wallets.refTopUp') },
    { value: 'Payment', label: t('wallets.refPayment') },
    { value: 'Reversal', label: t('wallets.refReversal') },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">
          {t('wallets.transactions')}
        </h2>
        <div className="flex gap-2">
          <Select
            options={typeOptions}
            value={typeFilter}
            onChange={(v) => {
              setTypeFilter(v);
              setPage(1);
            }}
            className="w-[140px]"
          />
          <Select
            options={refTypeOptions}
            value={refFilter}
            onChange={(v) => {
              setRefFilter(v);
              setPage(1);
            }}
            className="w-[150px]"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      ) : transactions.length === 0 ? (
        <EmptyState icon={History} title={t('wallets.noTransactions')} />
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('wallets.txType')}
                      </th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('wallets.txAmount')}
                      </th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('wallets.txBalanceAfter')}
                      </th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('wallets.txReference')}
                      </th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('wallets.txDescription')}
                      </th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('wallets.txDate')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {transactions.map((tx) => {
                      const isCredit = tx.type === 'Credit';
                      return (
                        <tr key={tx.id} className="hover:bg-hover/50 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              {isCredit ? (
                                <ArrowDownLeft className="h-4 w-4 text-green-600 dark:text-green-400" />
                              ) : (
                                <ArrowUpRight className="h-4 w-4 text-red-500" />
                              )}
                              <Badge
                                variant={isCredit ? 'success' : 'error'}
                                size="sm"
                              >
                                {t(`wallets.${tx.type.toLowerCase()}`)}
                              </Badge>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={
                                isCredit
                                  ? 'font-medium text-green-600 dark:text-green-400'
                                  : 'font-medium text-red-600 dark:text-red-400'
                              }
                            >
                              {isCredit ? '+' : '−'}
                              {tx.amount.toLocaleString()} {currency}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-text-secondary">
                            {tx.balanceAfter.toLocaleString()} {currency}
                          </td>
                          <td className="px-4 py-3.5">
                            <Badge variant="default" size="sm">
                              {t(`wallets.ref${tx.referenceType}`)}
                            </Badge>
                          </td>
                          <td className="px-4 py-3.5 text-text-secondary max-w-xs truncate">
                            <Link
                              to={ROUTES.ORDERS.getDetail(tx.orderId)}
                              className="hover:text-primary-600 hover:underline"
                            >
                              {tx.description || `Order ${tx.orderId.slice(0, 8)}…`}
                            </Link>
                          </td>
                          <td className="px-4 py-3.5 text-text-muted text-xs whitespace-nowrap">
                            {format(new Date(tx.createdAt), 'MMM d, yyyy HH:mm')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          {pagination && <Pagination pagination={pagination} onPageChange={setPage} />}
        </>
      )}
    </div>
  );
}

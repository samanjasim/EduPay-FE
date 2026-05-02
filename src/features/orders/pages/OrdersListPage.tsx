import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { Receipt, Search } from 'lucide-react';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  Badge,
  Input,
  Select,
  Spinner,
  Pagination,
} from '@/components/ui';
import { PageHeader, EmptyState } from '@/components/common';
import { useOrders } from '../api';
import { useSchools } from '@/features/schools/api';
import { useDebounce } from '@/hooks';
import { useAuthStore } from '@/stores';
import { useUIStore } from '@/stores/ui.store';
import { ROUTES } from '@/config';
import type { OrderListParams, OrderStatus, OrderType } from '@/types';

const PAGE_SIZE = 10;

const STATUS_BADGE: Record<OrderStatus, 'default' | 'success' | 'warning' | 'error'> = {
  Pending: 'warning',
  Paid: 'success',
  PartiallyPaid: 'warning',
  Cancelled: 'error',
};

const TYPE_BADGE: Record<OrderType, 'default' | 'success' | 'warning' | 'error'> = {
  Purchase: 'default',
  WalletTopUp: 'success',
  FeePay: 'warning',
  Mixed: 'default',
};

export default function OrdersListPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const activeSchoolId = useUIStore((s) => s.activeSchoolId);
  const setActiveSchoolId = useUIStore((s) => s.setActiveSchoolId);
  const isPlatformAdmin =
    user?.roles?.includes('SuperAdmin') || user?.roles?.includes('Admin');

  // Allow deep-linking to a pre-filtered view, e.g. /orders?type=Purchase from
  // the product purchase history page.
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') ?? '';

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>(initialType);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: schoolsData } = useSchools({ pageSize: 100 });
  const schools = schoolsData?.data ?? [];

  useEffect(() => {
    if (!isPlatformAdmin && schools.length > 0 && !activeSchoolId) {
      setActiveSchoolId(schools[0].id);
    }
  }, [isPlatformAdmin, schools, activeSchoolId, setActiveSchoolId]);

  const schoolOptions = useMemo(() => {
    const opts = schools.map((s) => ({ value: s.id, label: s.name }));
    if (isPlatformAdmin) opts.unshift({ value: '', label: t('orders.allSchools') });
    return opts;
  }, [schools, isPlatformAdmin, t]);

  const typeOptions = [
    { value: '', label: t('orders.allTypes') },
    { value: 'Purchase', label: t('orders.typePurchase') },
    { value: 'WalletTopUp', label: t('orders.typeWalletTopUp') },
    { value: 'FeePay', label: t('orders.typeFeePay') },
    { value: 'Mixed', label: t('orders.typeMixed') },
  ];

  const statusOptions = [
    { value: '', label: t('orders.allStatuses') },
    { value: 'Pending', label: t('orders.pending') },
    { value: 'Paid', label: t('orders.paid') },
    { value: 'PartiallyPaid', label: t('orders.partiallyPaid') },
    { value: 'Cancelled', label: t('orders.cancelled') },
  ];

  const params: OrderListParams = {
    pageNumber: page,
    pageSize: PAGE_SIZE,
    ...(debouncedSearch && { searchTerm: debouncedSearch }),
    ...(typeFilter && { type: typeFilter as OrderType }),
    ...(statusFilter && { status: statusFilter as OrderStatus }),
  };

  const { data, isLoading } = useOrders(params);
  const orders = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <PageHeader title={t('orders.title')} subtitle={t('orders.subtitle')} />

      <div className="flex flex-col gap-3 sm:flex-row">
        {schoolOptions.length > 0 && (
          <Select
            options={schoolOptions}
            value={activeSchoolId ?? ''}
            onChange={(v) => {
              setActiveSchoolId(v || null);
              setPage(1);
            }}
            className="sm:max-w-[250px]"
          />
        )}
        <div className="sm:max-w-xs flex-1">
          <Input
            placeholder={t('orders.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <Select
          options={typeOptions}
          value={typeFilter}
          onChange={(v) => {
            setTypeFilter(v);
            setPage(1);
          }}
          className="sm:max-w-[180px]"
        />
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
          className="sm:max-w-[180px]"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState icon={Receipt} title={t('common.noResults')} />
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('orders.receipt')}
                      </th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('orders.student')}
                      </th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('orders.type')}
                      </th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('orders.total')}
                      </th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('common.status')}
                      </th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('orders.createdAt')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-hover/50 transition-colors">
                        <td className="px-4 py-3.5">
                          <Link
                            to={ROUTES.ORDERS.getDetail(o.id)}
                            className="font-mono text-xs text-primary-600 hover:underline"
                          >
                            {o.receiptNumber}
                          </Link>
                        </td>
                        <td className="px-4 py-3.5 text-text-primary">{o.studentName}</td>
                        <td className="px-4 py-3.5">
                          <Badge variant={TYPE_BADGE[o.type]} size="sm">
                            {t(`orders.type${o.type}`)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5 text-text-secondary">
                          {o.totalAmount.toLocaleString()} {o.currency}
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge variant={STATUS_BADGE[o.status]} size="sm">
                            {t(`orders.${o.status.charAt(0).toLowerCase() + o.status.slice(1)}`)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5 text-text-muted text-xs whitespace-nowrap">
                          {format(new Date(o.createdAt), 'MMM d, yyyy HH:mm')}
                        </td>
                      </tr>
                    ))}
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

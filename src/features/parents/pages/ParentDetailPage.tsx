import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Users, Receipt, ShoppingCart, LayoutDashboard,
  AlertTriangle, Clock, CheckCircle2, GraduationCap,
  Calendar, XCircle, Filter, TrendingUp, Download,
} from 'lucide-react';
import {
  Card, CardContent, CardHeader, CardTitle,
  Badge, Spinner, Select, Pagination, Button,
} from '@/components/ui';
import { PageHeader, EmptyState } from '@/components/common';
import { useParentDashboard, useParentChildren, useParentFees, useParentOrders } from '../api';
import { useUser } from '@/features/users/api';
import { ROUTES } from '@/config';
import { cn } from '@/utils';
import { format } from 'date-fns';
import { ordersApi } from '@/features/orders/api';

type Tab = 'overview' | 'children' | 'fees' | 'orders';

export default function ParentDetailPage() {
  const { t } = useTranslation();
  const { parentUserId } = useParams<{ parentUserId: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const { data: user } = useUser(parentUserId!);

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'overview', label: t('parent.tabOverview'), icon: LayoutDashboard },
    { key: 'children', label: t('parent.tabChildren'), icon: Users },
    { key: 'fees', label: t('parent.tabFees'), icon: Receipt },
    { key: 'orders', label: t('parent.tabOrders'), icon: ShoppingCart },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        backTo={ROUTES.PARENTS.LIST}
        backLabel={t('parent.backToParents')}
      />

      {/* Parent Header */}
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-100 text-lg font-bold text-primary-700 dark:bg-primary-500/20 dark:text-primary-300">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-text-primary">
                {user ? `${user.firstName} ${user.lastName}` : '...'}
              </h1>
              <p className="text-text-secondary">{user?.email}</p>
            </div>
            {user?.status && (
              <Badge variant={user.status === 'Active' ? 'success' : 'warning'}>
                {user.status}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-0 -mb-px overflow-x-auto">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                'flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                activeTab === key
                  ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                  : 'border-transparent text-text-muted hover:text-text-primary hover:border-border'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab parentUserId={parentUserId!} />}
      {activeTab === 'children' && <ChildrenTab parentUserId={parentUserId!} />}
      {activeTab === 'fees' && <FeesTab parentUserId={parentUserId!} />}
      {activeTab === 'orders' && <OrdersTab parentUserId={parentUserId!} />}
    </div>
  );
}

// ─── Overview Tab ───────────────────────────────────

function OverviewTab({ parentUserId }: { parentUserId: string }) {
  const { t } = useTranslation();
  const { data: dashboard, isLoading } = useParentDashboard(parentUserId);

  if (isLoading) return <div className="flex justify-center py-8"><Spinner size="lg" /></div>;
  if (!dashboard) return <EmptyState icon={LayoutDashboard} title={t('common.noResults')} />;

  const fmt = (n: number) => new Intl.NumberFormat('en-IQ', { minimumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-500/20">
              <Users className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{dashboard.totalChildren}</p>
              <p className="text-xs text-text-muted">{t('parent.totalChildren')}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/20">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{dashboard.totalPendingFees}</p>
              <p className="text-xs text-text-muted">{t('parent.pendingFees')}</p>
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400">{fmt(dashboard.totalPendingAmount)} {dashboard.currency}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-500/20">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{dashboard.totalOverdueFees}</p>
              <p className="text-xs text-text-muted">{t('parent.overdueFees')}</p>
              <p className="text-xs font-medium text-red-600 dark:text-red-400">{fmt(dashboard.totalOverdueAmount)} {dashboard.currency}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{dashboard.totalPaidFees}</p>
              <p className="text-xs text-text-muted">{t('parent.paidFees')}</p>
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{fmt(dashboard.totalPaidAmount)} {dashboard.currency}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Per-child summary */}
      {dashboard.children.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t('parent.childrenOverview')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {dashboard.children.map((child) => (
                <div key={child.studentId} className="rounded-lg border border-border p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-text-primary">{child.fullNameEn}</h4>
                      <p className="text-xs text-text-muted">{child.studentCode} &middot; {child.gradeName}</p>
                    </div>
                    <Badge variant={child.status === 'Active' ? 'success' : 'warning'} size="sm">{child.status}</Badge>
                  </div>
                  <div className="space-y-1.5">
                    {child.pendingFees > 0 && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1"><Clock className="h-3 w-3" />{child.pendingFees} {t('parent.pending')}</span>
                        <span className="font-medium text-text-primary">{fmt(child.pendingAmount)} {dashboard.currency}</span>
                      </div>
                    )}
                    {child.overdueFees > 0 && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-red-500 dark:text-red-400 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{child.overdueFees} {t('parent.overdue')}</span>
                        <span className="font-medium text-text-primary">{fmt(child.overdueAmount)} {dashboard.currency}</span>
                      </div>
                    )}
                    {child.pendingFees === 0 && child.overdueFees === 0 && (
                      <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />{t('parent.allPaid')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Children Tab ───────────────────────────────────

function ChildrenTab({ parentUserId }: { parentUserId: string }) {
  const { t } = useTranslation();
  const { data: children, isLoading } = useParentChildren(parentUserId);

  if (isLoading) return <div className="flex justify-center py-8"><Spinner size="lg" /></div>;
  if (!children || children.length === 0) return <EmptyState icon={Users} title={t('parent.noChildren')} />;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {children.map((child) => (
        <Card key={child.studentId} className="h-full">
          <CardContent className="py-5 px-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-500/20">
                <GraduationCap className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" size="sm">{child.relation}</Badge>
                <Badge variant={child.status === 'Active' ? 'success' : 'warning'} size="sm">{child.status}</Badge>
              </div>
            </div>
            <h3 className="font-semibold text-text-primary">{child.fullNameEn}</h3>
            <p className="text-sm text-text-muted mt-0.5">{child.fullNameAr}</p>
            <div className="mt-4 space-y-2 border-t border-border pt-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">{t('parent.studentCode')}</span>
                <span className="font-medium text-text-primary">{child.studentCode}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">{t('parent.grade')}</span>
                <span className="font-medium text-text-primary">{child.gradeName}</span>
              </div>
              {child.sectionName && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted">{t('parent.section')}</span>
                  <span className="font-medium text-text-primary">{child.sectionName}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted flex items-center gap-1"><Calendar className="h-3 w-3" />{t('parent.linkedAt')}</span>
                <span className="font-medium text-text-primary">{format(new Date(child.linkedAt), 'MMM d, yyyy')}</span>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between rounded-md bg-amber-50 px-2.5 py-2 text-xs dark:bg-amber-500/10">
              <span className="text-text-muted">{t('parent.outstandingAmount')}</span>
              <span className="font-semibold text-amber-700 dark:text-amber-300">
                {child.outstandingAmountIqd.toLocaleString()} {child.currency}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Fees Tab ───────────────────────────────────────

const feeStatusVariant = (s: string) => ({ Pending: 'warning', Paid: 'success', Overdue: 'error', Waived: 'info', Cancelled: 'default', PartiallyPaid: 'warning' } as const)[s] ?? 'default';
const feeStatusIcon = (s: string) => {
  switch (s) { case 'Pending': return <Clock className="h-3.5 w-3.5" />; case 'Paid': return <CheckCircle2 className="h-3.5 w-3.5" />; case 'Overdue': return <AlertTriangle className="h-3.5 w-3.5" />; case 'Cancelled': return <XCircle className="h-3.5 w-3.5" />; default: return null; }
};

function FeesTab({ parentUserId }: { parentUserId: string }) {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [childFilter, setChildFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: children } = useParentChildren(parentUserId);
  const { data: feesData, isLoading } = useParentFees(parentUserId, {
    pageNumber: page, pageSize: 10,
    studentId: childFilter || undefined,
    status: statusFilter || undefined,
  });

  const fees = feesData?.data ?? [];
  const pagination = feesData?.pagination;
  const fmt = (n: number) => new Intl.NumberFormat('en-IQ', { minimumFractionDigits: 0 }).format(n);

  const childOptions = [{ value: '', label: t('parent.allChildren') }, ...(children ?? []).map((c) => ({ value: c.studentId, label: c.fullNameEn }))];
  const statusOptions = [{ value: '', label: t('parent.allStatuses') }, { value: 'Pending', label: 'Pending' }, { value: 'Paid', label: 'Paid' }, { value: 'Overdue', label: 'Overdue' }, { value: 'Waived', label: 'Waived' }, { value: 'Cancelled', label: 'Cancelled' }];

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Filter className="h-4 w-4 text-text-muted shrink-0" />
            <Select options={childOptions} value={childFilter} onChange={(v) => { setChildFilter(v); setPage(1); }} className="max-w-[220px]" />
            <Select options={statusOptions} value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1); }} className="max-w-[180px]" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Spinner size="md" /></div>
          ) : fees.length === 0 ? (
            <EmptyState icon={Receipt} title={t('parent.noFees')} />
          ) : (
            <>
              <div className="-mx-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 pb-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">{t('parent.feeName')}</th>
                      <th className="px-4 pb-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">{t('parent.student')}</th>
                      <th className="px-4 pb-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">{t('parent.amount')}</th>
                      <th className="px-4 pb-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">{t('parent.dueDate')}</th>
	                      <th className="px-4 pb-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">{t('common.status')}</th>
	                      <th className="px-4 pb-3 text-end text-xs font-medium uppercase tracking-wide text-text-muted">{t('common.actions')}</th>
	                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {fees.map((fee) => (
                      <tr key={fee.feeInstanceId} className="hover:bg-hover/50 transition-colors">
                        <td className="px-4 py-3.5 font-medium text-text-primary">{fee.feeName}</td>
                        <td className="px-4 py-3.5 text-text-secondary">{fee.studentName}</td>
                        <td className="px-4 py-3.5">
                          <span className="font-medium text-text-primary">{fmt(fee.amount)} {fee.currency}</span>
                          {fee.discountAmount > 0 && <span className="block text-xs text-emerald-600 dark:text-emerald-400">-{fmt(fee.discountAmount)} discount</span>}
                        </td>
                        <td className="px-4 py-3.5 text-text-muted">{format(new Date(fee.dueDate), 'MMM d, yyyy')}</td>
                        <td className="px-4 py-3.5">
                          <Badge variant={feeStatusVariant(fee.status)} size="sm">
                            <span className="flex items-center gap-1">{feeStatusIcon(fee.status)}{fee.status}</span>
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-4 flex justify-center"><Pagination pagination={pagination} onPageChange={setPage} /></div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Orders Tab ─────────────────────────────────────

const orderStatusVariant = (s: string) => ({ Pending: 'warning', Paid: 'success', Cancelled: 'error' } as const)[s] ?? 'default';
const orderStatusIcon = (s: string) => {
  switch (s) { case 'Pending': return <Clock className="h-3.5 w-3.5" />; case 'Paid': return <CheckCircle2 className="h-3.5 w-3.5" />; case 'Cancelled': return <XCircle className="h-3.5 w-3.5" />; default: return null; }
};

function OrdersTab({ parentUserId }: { parentUserId: string }) {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [childFilter, setChildFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: children } = useParentChildren(parentUserId);
  const { data: ordersData, isLoading } = useParentOrders(parentUserId, {
    pageNumber: page, pageSize: 10,
    studentId: childFilter || undefined,
    status: statusFilter || undefined,
  });

  const orders = ordersData?.data ?? [];
  const pagination = ordersData?.pagination;
  const fmt = (n: number) => new Intl.NumberFormat('en-IQ', { minimumFractionDigits: 0 }).format(n);

  const childOptions = [{ value: '', label: t('parent.allChildren') }, ...(children ?? []).map((c) => ({ value: c.studentId, label: c.fullNameEn }))];
  const statusOptions = [{ value: '', label: t('parent.allStatuses') }, { value: 'Pending', label: 'Pending' }, { value: 'Paid', label: 'Paid' }, { value: 'Cancelled', label: 'Cancelled' }];

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Filter className="h-4 w-4 text-text-muted shrink-0" />
            <Select options={childOptions} value={childFilter} onChange={(v) => { setChildFilter(v); setPage(1); }} className="max-w-[220px]" />
            <Select options={statusOptions} value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1); }} className="max-w-[180px]" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Spinner size="md" /></div>
          ) : orders.length === 0 ? (
            <EmptyState icon={ShoppingCart} title={t('parent.noOrders')} />
          ) : (
            <>
              <div className="-mx-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 pb-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">{t('parent.receiptNumber')}</th>
                      <th className="px-4 pb-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">{t('parent.student')}</th>
                      <th className="px-4 pb-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">{t('parent.type')}</th>
                      <th className="px-4 pb-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">{t('parent.amount')}</th>
                      <th className="px-4 pb-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">{t('parent.date')}</th>
                      <th className="px-4 pb-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">{t('common.status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orders.map((order) => (
                      <tr key={order.orderId} className="hover:bg-hover/50 transition-colors">
                        <td className="px-4 py-3.5"><span className="font-mono text-xs font-medium text-primary-600 dark:text-primary-400">{order.receiptNumber}</span></td>
                        <td className="px-4 py-3.5 text-text-secondary">{order.studentName}</td>
                        <td className="px-4 py-3.5"><Badge variant="outline" size="sm">{order.type}</Badge></td>
                        <td className="px-4 py-3.5 font-medium text-text-primary">{fmt(order.totalAmount)} {order.currency}</td>
                        <td className="px-4 py-3.5 text-text-muted">{format(new Date(order.paidAt ?? order.createdAt), 'MMM d, yyyy')}</td>
	                        <td className="px-4 py-3.5">
	                          <Badge variant={orderStatusVariant(order.status)} size="sm">
	                            <span className="flex items-center gap-1">{orderStatusIcon(order.status)}{order.status}</span>
	                          </Badge>
	                        </td>
	                        <td className="px-4 py-3.5 text-end">
	                          <Button
	                            variant="ghost"
	                            size="sm"
	                            aria-label={t('orders.downloadReceipt')}
	                            onClick={() => ordersApi.downloadReceipt(order.orderId, order.receiptNumber)}
	                          >
	                            <Download className="h-4 w-4" />
	                          </Button>
	                        </td>
	                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-4 flex justify-center"><Pagination pagination={pagination} onPageChange={setPage} /></div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

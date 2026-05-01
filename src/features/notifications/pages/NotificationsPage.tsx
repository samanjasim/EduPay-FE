import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Bell, CheckCheck, Mail, MailOpen, Smartphone, Monitor, Send, Search,
  CreditCard, Wallet, School, ShoppingCart, Clock, AlertCircle, Inbox, Users,
  ChevronDown, ChevronUp, Eye, EyeOff,
} from 'lucide-react';
import { Card, CardContent, Badge, Spinner, Button, Pagination, Input, Select } from '@/components/ui';
import { PageHeader, EmptyState } from '@/components/common';
import {
  useNotifications, useSentNotifications, useUnreadCount,
  useMarkAsRead, useMarkAllAsRead,
} from '../api';
import { usePermissions } from '@/hooks';
import { PERMISSIONS } from '@/constants';
import { ROUTES } from '@/config';
import { cn } from '@/utils';
import { formatDistanceToNow, format } from 'date-fns';
import type { NotificationDto, NotificationChannel, NotificationReferenceType } from '@/types';

type MainTab = 'inbox' | 'sent';
type ReadFilter = 'all' | 'unread' | 'read';
type TypeFilter = 'all' | NotificationReferenceType;

const channelConfig: Record<NotificationChannel, { icon: typeof Bell; label: string; variant: 'info' | 'primary' | 'warning' }> = {
  InApp: { icon: Monitor, label: 'channelInApp', variant: 'info' },
  Push: { icon: Smartphone, label: 'channelPush', variant: 'primary' },
  Email: { icon: Mail, label: 'channelEmail', variant: 'warning' },
};

const refConfig: Record<NotificationReferenceType, { icon: typeof Bell; label: string; variant: 'error' | 'success' | 'warning' | 'info' | 'primary' }> = {
  Fee: { icon: AlertCircle, label: 'refFee', variant: 'error' },
  Payment: { icon: CreditCard, label: 'refPayment', variant: 'success' },
  Order: { icon: ShoppingCart, label: 'refOrder', variant: 'warning' },
  Wallet: { icon: Wallet, label: 'refWallet', variant: 'info' },
  School: { icon: School, label: 'refSchool', variant: 'primary' },
};

export default function NotificationsPage() {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const canSend = hasPermission(PERMISSIONS.Notifications.Send);
  const [mainTab, setMainTab] = useState<MainTab>('inbox');

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('notifications.title')}
        subtitle={t('notifications.subtitle')}
        actions={
          canSend ? (
            <Link to={ROUTES.NOTIFICATIONS.SEND}>
              <Button size="sm" leftIcon={<Send className="h-4 w-4" />}>{t('send.title')}</Button>
            </Link>
          ) : undefined
        }
      />

      {/* Main Tab Switcher */}
      {canSend && (
        <div className="border-b border-border">
          <nav className="flex gap-0 -mb-px">
            <button
              onClick={() => setMainTab('inbox')}
              className={cn(
                'flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors',
                mainTab === 'inbox'
                  ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                  : 'border-transparent text-text-muted hover:text-text-primary hover:border-border'
              )}
            >
              <Inbox className="h-4 w-4" />
              {t('notifications.tabInbox')}
            </button>
            <button
              onClick={() => setMainTab('sent')}
              className={cn(
                'flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors',
                mainTab === 'sent'
                  ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                  : 'border-transparent text-text-muted hover:text-text-primary hover:border-border'
              )}
            >
              <Users className="h-4 w-4" />
              {t('notifications.tabSent')}
            </button>
          </nav>
        </div>
      )}

      {mainTab === 'inbox' && <InboxTab />}
      {mainTab === 'sent' && <SentTab />}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   INBOX TAB (existing notifications for current user)
   ═══════════════════════════════════════════════ */

function InboxTab() {
  const { t } = useTranslation();
  const [readFilter, setReadFilter] = useState<ReadFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [page, setPage] = useState(1);

  const queryParams = useMemo(() => {
    const p: Record<string, unknown> = { pageNumber: page, pageSize: 10 };
    if (readFilter === 'unread') p.isRead = false;
    if (readFilter === 'read') p.isRead = true;
    if (typeFilter !== 'all') p.referenceType = typeFilter;
    return p;
  }, [readFilter, typeFilter, page]);

  const { data, isLoading } = useNotifications(queryParams);
  const { data: unreadCount = 0 } = useUnreadCount();
  const { mutate: markAsRead, isPending: isMarkingRead } = useMarkAsRead();
  const { mutate: markAllAsRead, isPending: isMarkingAllRead } = useMarkAllAsRead();
  const notifications = data?.data ?? [];
  const pagination = data?.pagination;

  const typeFilters: { key: TypeFilter; label: string; icon: typeof Bell }[] = [
    { key: 'all', label: t('notifications.typeAll'), icon: Bell },
    { key: 'Fee', label: t('notifications.typeFee'), icon: AlertCircle },
    { key: 'Payment', label: t('notifications.typePayment'), icon: CreditCard },
    { key: 'Order', label: t('notifications.typeOrder'), icon: ShoppingCart },
    { key: 'Wallet', label: t('notifications.typeWallet'), icon: Wallet },
    { key: 'School', label: t('notifications.typeSchool'), icon: School },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="flex items-center gap-3 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-500/20"><Bell className="h-5 w-5 text-primary-600 dark:text-primary-400" /></div>
          <div><p className="text-2xl font-bold text-text-primary">{pagination?.totalCount ?? 0}</p><p className="text-xs text-text-muted">{t('notifications.tabAll')}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/20"><Mail className="h-5 w-5 text-amber-600 dark:text-amber-400" /></div>
          <div><p className="text-2xl font-bold text-text-primary">{unreadCount}</p><p className="text-xs text-text-muted">{t('notifications.tabUnread')}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/20"><MailOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /></div>
          <div><p className="text-2xl font-bold text-text-primary">{(pagination?.totalCount ?? 0) - unreadCount}</p><p className="text-xs text-text-muted">{t('notifications.tabRead')}</p></div>
        </CardContent></Card>
      </div>

      {/* Filters */}
      <Card><CardContent className="py-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-hover/30 p-1 w-fit">
            {(['all', 'unread', 'read'] as ReadFilter[]).map((f) => (
              <button key={f} onClick={() => { setReadFilter(f); setPage(1); }} className={cn('rounded-md px-4 py-2 text-sm font-medium transition-all', readFilter === f ? 'bg-surface text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary')}>
                {t(`notifications.tab${f.charAt(0).toUpperCase() + f.slice(1)}`)}
                {f === 'unread' && unreadCount > 0 && <span className={cn('ml-1.5 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-xs font-semibold', readFilter === 'unread' ? 'bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-400' : 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400')}>{unreadCount}</span>}
              </button>
            ))}
          </div>
          <Button variant="secondary" size="sm" onClick={() => markAllAsRead()} isLoading={isMarkingAllRead} disabled={unreadCount === 0} leftIcon={<CheckCheck className="h-4 w-4" />}>{t('notifications.markAllAsRead')}</Button>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {typeFilters.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => { setTypeFilter(key); setPage(1); }} className={cn('flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-all', typeFilter === key ? 'border-primary-300 bg-primary-50 text-primary-700 dark:border-primary-500/30 dark:bg-primary-500/10 dark:text-primary-400' : 'border-border text-text-muted hover:border-primary-200 dark:hover:border-primary-500/30')}>
              <Icon className="h-3 w-3" />{label}
            </button>
          ))}
        </div>
      </CardContent></Card>

      {/* List */}
      {isLoading ? <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        : notifications.length === 0 ? <EmptyState icon={Bell} title={t('notifications.emptyTitle')} />
        : <div className="space-y-3">{notifications.map((n) => <NotificationCard key={n.id} notification={n} onMarkAsRead={() => markAsRead(n.id)} isMarkingRead={isMarkingRead} />)}</div>}

      {pagination && pagination.totalPages > 1 && <div className="flex justify-center"><Pagination pagination={pagination} onPageChange={setPage} /></div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SENT TAB (admin: all notifications with user details)
   ═══════════════════════════════════════════════ */

function SentTab() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [readFilter, setReadFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading } = useSentNotifications({
    pageNumber: page,
    pageSize: 15,
    isRead: readFilter === '' ? undefined : readFilter === 'true',
    referenceType: (typeFilter || undefined) as NotificationReferenceType | undefined,
    searchTerm: search || undefined,
  });

  const items = data?.data ?? [];
  const pagination = data?.pagination;

  const readOptions = [
    { value: '', label: t('notifications.tabAll') },
    { value: 'false', label: t('notifications.tabUnread') },
    { value: 'true', label: t('notifications.tabRead') },
  ];

  const typeOptions = [
    { value: '', label: t('notifications.typeAll') },
    { value: 'Fee', label: t('notifications.typeFee') },
    { value: 'Payment', label: t('notifications.typePayment') },
    { value: 'Order', label: t('notifications.typeOrder') },
    { value: 'Wallet', label: t('notifications.typeWallet') },
    { value: 'School', label: t('notifications.typeSchool') },
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card><CardContent className="py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <div className="sm:max-w-xs flex-1">
            <Input placeholder={t('notifications.searchSent')} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} leftIcon={<Search className="h-4 w-4" />} />
          </div>
          <Select options={readOptions} value={readFilter} onChange={(v) => { setReadFilter(v); setPage(1); }} className="sm:max-w-[160px]" />
          <Select options={typeOptions} value={typeFilter} onChange={(v) => { setTypeFilter(v); setPage(1); }} className="sm:max-w-[160px]" />
        </div>
      </CardContent></Card>

      {/* Table */}
      <Card><CardContent>
        {isLoading ? <div className="flex justify-center py-8"><Spinner size="md" /></div>
          : items.length === 0 ? <EmptyState icon={Send} title={t('notifications.noSent')} />
          : (
          <>
            <div className="-mx-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 pb-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">{t('notifications.recipient')}</th>
                    <th className="px-4 pb-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">{t('notifications.notifTitle')}</th>
                    <th className="px-4 pb-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">{t('notifications.sentChannel')}</th>
                    <th className="px-4 pb-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">{t('notifications.sentType')}</th>
                    <th className="px-4 pb-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">{t('notifications.readStatus')}</th>
                    <th className="px-4 pb-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">{t('notifications.sentDate')}</th>
                    <th className="px-4 pb-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((item) => {
                    const isExpanded = expandedId === item.id;
                    const ch = channelConfig[item.channel];
                    const ChIcon = ch.icon;
                    const ref = item.referenceType ? refConfig[item.referenceType] : null;
                    const RefIcon = ref?.icon;
                    return (
                      <tr key={item.id} className={cn('transition-colors cursor-pointer', isExpanded ? 'bg-hover/30' : 'hover:bg-hover/50')} onClick={() => navigate(ROUTES.NOTIFICATIONS.getDetail(item.id))}>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-medium text-primary-700 dark:bg-primary-500/20 dark:text-primary-300">
                              {item.userFullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-text-primary truncate">{item.userFullName}</p>
                              <p className="text-xs text-text-muted truncate">{item.userEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-medium text-text-primary truncate max-w-[200px]">{item.title}</p>
                          {isExpanded && <p className="mt-1 text-xs text-text-secondary whitespace-pre-wrap">{item.body}</p>}
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge variant={ch.variant} size="sm"><ChIcon className="h-3 w-3 ltr:mr-1 rtl:ml-1" />{t(`notifications.${ch.label}`)}</Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          {ref && RefIcon ? <Badge variant={ref.variant} size="sm"><RefIcon className="h-3 w-3 ltr:mr-1 rtl:ml-1" />{t(`notifications.${ref.label}`)}</Badge> : <span className="text-xs text-text-muted">—</span>}
                        </td>
                        <td className="px-4 py-3.5">
                          {item.isRead ? (
                            <div className="flex items-center gap-1.5">
                              <Badge variant="success" size="sm"><Eye className="h-3 w-3 ltr:mr-0.5 rtl:ml-0.5" />{t('notifications.tabRead')}</Badge>
                              {item.readAt && <span className="text-xs text-text-muted">{formatDistanceToNow(new Date(item.readAt), { addSuffix: true })}</span>}
                            </div>
                          ) : (
                            <Badge variant="warning" size="sm"><EyeOff className="h-3 w-3 ltr:mr-0.5 rtl:ml-0.5" />{t('notifications.tabUnread')}</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-text-muted text-xs">{format(new Date(item.createdAt), 'MMM d, HH:mm')}</td>
                        <td className="px-4 py-3.5">
                          <button onClick={(e) => { e.stopPropagation(); setExpandedId(isExpanded ? null : item.id); }} className="p-1 rounded hover:bg-hover transition-colors">
                            {isExpanded ? <ChevronUp className="h-4 w-4 text-text-muted" /> : <ChevronDown className="h-4 w-4 text-text-muted" />}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {pagination && pagination.totalPages > 1 && <div className="mt-4 flex justify-center"><Pagination pagination={pagination} onPageChange={setPage} /></div>}
          </>
        )}
      </CardContent></Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   NOTIFICATION CARD (inbox)
   ═══════════════════════════════════════════════ */

function NotificationCard({ notification, onMarkAsRead, isMarkingRead }: { notification: NotificationDto; onMarkAsRead: () => void; isMarkingRead: boolean }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const ch = channelConfig[notification.channel];
  const ref = notification.referenceType ? refConfig[notification.referenceType] : null;
  const ChIcon = ch.icon;
  const RefIcon = ref?.icon;

  return (
    <Card
      className={cn('transition-all hover:shadow-soft-sm cursor-pointer', !notification.isRead && 'ltr:border-l-4 rtl:border-r-4 border-l-primary-500 rtl:border-r-primary-500 bg-primary-50/40 dark:bg-primary-500/5')}
      onClick={() => navigate(ROUTES.NOTIFICATIONS.getDetail(notification.id))}
    >
      <CardContent className="flex items-start gap-4 py-4">
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full mt-0.5', notification.isRead ? 'bg-hover' : 'bg-primary-100 dark:bg-primary-500/20')}>
          {notification.isRead ? <MailOpen className="h-5 w-5 text-text-muted" /> : <Mail className="h-5 w-5 text-primary-600 dark:text-primary-400" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className={cn('text-sm', notification.isRead ? 'font-medium text-text-primary' : 'font-semibold text-text-primary')}>
                {notification.title}
                {!notification.isRead && <span className="ml-2 inline-block h-2 w-2 rounded-full bg-primary-500" />}
              </h3>
              <p className="mt-1 text-sm text-text-secondary line-clamp-2">{notification.body}</p>
            </div>
            {!notification.isRead && (
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onMarkAsRead(); }} disabled={isMarkingRead} className="shrink-0 text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-500/10">{t('notifications.markAsRead')}</Button>
            )}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant={ch.variant} size="sm"><ChIcon className="h-3 w-3 ltr:mr-1 rtl:ml-1" />{t(`notifications.${ch.label}`)}</Badge>
            {ref && RefIcon && <Badge variant={ref.variant} size="sm"><RefIcon className="h-3 w-3 ltr:mr-1 rtl:ml-1" />{t(`notifications.${ref.label}`)}</Badge>}
            <span className="flex items-center gap-1 text-xs text-text-muted"><Clock className="h-3 w-3" />{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
            {notification.isRead && notification.readAt && <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400"><CheckCheck className="h-3 w-3" />{t('notifications.readAt', { time: formatDistanceToNow(new Date(notification.readAt), { addSuffix: true }) })}</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

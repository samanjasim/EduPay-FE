import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Bell, Mail, MailOpen, Monitor, Smartphone, Eye, EyeOff,
  CreditCard, Wallet, School, ShoppingCart, AlertCircle,
  Users, CheckCircle2, Clock, Search,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Spinner, Button, Input } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { useNotification, useNotificationRecipients, useMarkAsRead } from '../api';
import { localizeNotificationText } from '../utils/localizeNotification';
import { ROUTES } from '@/config';
import { cn } from '@/utils';
import { format, formatDistanceToNow } from 'date-fns';
import type { NotificationChannel, NotificationReferenceType, RecipientDto } from '@/types';

type RecipientTab = 'all' | 'read' | 'unread';

const channelConfig: Record<NotificationChannel, { icon: typeof Bell; label: string; variant: 'info' | 'primary' | 'warning' }> = {
  InApp: { icon: Monitor, label: 'In-App', variant: 'info' },
  Push: { icon: Smartphone, label: 'Push', variant: 'primary' },
  Email: { icon: Mail, label: 'Email', variant: 'warning' },
};

const refConfig: Record<NotificationReferenceType, { icon: typeof Bell; label: string; variant: 'error' | 'success' | 'warning' | 'info' | 'primary' }> = {
  Fee: { icon: AlertCircle, label: 'Fee', variant: 'error' },
  Payment: { icon: CreditCard, label: 'Payment', variant: 'success' },
  Order: { icon: ShoppingCart, label: 'Order', variant: 'warning' },
  Wallet: { icon: Wallet, label: 'Wallet', variant: 'info' },
  School: { icon: School, label: 'School', variant: 'primary' },
};

export default function NotificationDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data: notification, isLoading: isLoadingNotif } = useNotification(id!);
  const { data: recipientsData, isLoading: isLoadingRecipients } = useNotificationRecipients(id!);
  const { mutate: markAsRead, isPending } = useMarkAsRead();

  const [recipientTab, setRecipientTab] = useState<RecipientTab>('all');
  const [search, setSearch] = useState('');

  const filteredRecipients = useMemo(() => {
    if (!recipientsData) return [];
    let list = recipientsData.recipients;
    if (recipientTab === 'read') list = list.filter((r) => r.isRead);
    if (recipientTab === 'unread') list = list.filter((r) => !r.isRead);
    if (search) {
      const term = search.toLowerCase();
      list = list.filter((r) => r.userFullName.toLowerCase().includes(term) || r.userEmail.toLowerCase().includes(term));
    }
    return list;
  }, [recipientsData, recipientTab, search]);

  if (isLoadingNotif) {
    return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  }

  if (!notification) {
    return <div className="text-text-secondary">{t('common.noResults')}</div>;
  }

  const ch = channelConfig[notification.channel];
  const ChIcon = ch.icon;
  const ref = notification.referenceType ? refConfig[notification.referenceType] : null;
  const RefIcon = ref?.icon;

  return (
    <div className="space-y-6">
      <PageHeader
        backTo={ROUTES.NOTIFICATIONS.LIST}
        backLabel={t('notifications.backToList')}
      />

      {/* Header Card */}
      <Card>
        <CardContent className="space-y-5 py-6">
          <div className="flex items-start gap-4">
            <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', notification.isRead ? 'bg-hover' : 'bg-primary-100 dark:bg-primary-500/20')}>
              {notification.isRead ? <MailOpen className="h-6 w-6 text-text-muted" /> : <Mail className="h-6 w-6 text-primary-600 dark:text-primary-400" />}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-text-primary">
                {localizeNotificationText(notification.title, t)}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant={ch.variant} size="sm"><ChIcon className="h-3 w-3 ltr:mr-1 rtl:ml-1" />{ch.label}</Badge>
                {ref && RefIcon && <Badge variant={ref.variant} size="sm"><RefIcon className="h-3 w-3 ltr:mr-1 rtl:ml-1" />{ref.label}</Badge>}
                <span className="text-xs text-text-muted">{format(new Date(notification.createdAt), 'MMM d, yyyy HH:mm')}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {notification.isRead ? (
                <Badge variant="success"><Eye className="h-3.5 w-3.5 ltr:mr-1 rtl:ml-1" />{t('notifications.tabRead')}</Badge>
              ) : (
                <>
                  <Badge variant="warning"><EyeOff className="h-3.5 w-3.5 ltr:mr-1 rtl:ml-1" />{t('notifications.tabUnread')}</Badge>
                  <Button size="sm" variant="secondary" onClick={() => markAsRead(notification.id)} isLoading={isPending}>{t('notifications.markAsRead')}</Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message Body */}
      <Card>
        <CardHeader><CardTitle>{t('notifications.messageBody')}</CardTitle></CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border bg-hover/20 p-5">
            <p className="text-text-primary whitespace-pre-wrap leading-relaxed">
              {localizeNotificationText(notification.body, t)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recipients Section */}
      <Card>
        <CardContent className="py-6">
          {/* Stats Row */}
          {recipientsData && (
            <div className="grid gap-4 sm:grid-cols-3 mb-6">
              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-500/20">
                  <Users className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="text-xl font-bold text-text-primary">{recipientsData.totalRecipients}</p>
                  <p className="text-xs text-text-muted">{t('notifications.totalRecipients')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
                  <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xl font-bold text-text-primary">{recipientsData.readCount}</p>
                  <p className="text-xs text-text-muted">{t('notifications.readRecipients')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/20">
                  <EyeOff className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-xl font-bold text-text-primary">{recipientsData.unreadCount}</p>
                  <p className="text-xs text-text-muted">{t('notifications.unreadRecipients')}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tabs + Search */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="flex items-center gap-1 rounded-lg border border-border bg-hover/30 p-1 w-fit">
              {(['all', 'read', 'unread'] as RecipientTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setRecipientTab(tab)}
                  className={cn(
                    'rounded-md px-4 py-2 text-sm font-medium transition-all',
                    recipientTab === tab
                      ? 'bg-surface text-text-primary shadow-sm'
                      : 'text-text-muted hover:text-text-primary'
                  )}
                >
                  {t(`notifications.tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`)}
                  {recipientsData && (
                    <span className={cn(
                      'ml-1.5 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-xs font-semibold',
                      recipientTab === tab
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-400'
                        : 'bg-hover text-text-muted'
                    )}>
                      {tab === 'all' ? recipientsData.totalRecipients : tab === 'read' ? recipientsData.readCount : recipientsData.unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="sm:max-w-xs">
              <Input
                placeholder={t('notifications.searchRecipients')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
          </div>

          {/* Recipients List */}
          {isLoadingRecipients ? (
            <div className="flex justify-center py-8"><Spinner size="md" /></div>
          ) : filteredRecipients.length === 0 ? (
            <div className="py-8 text-center text-sm text-text-muted">{t('notifications.noRecipients')}</div>
          ) : (
            <div className="space-y-2">
              {filteredRecipients.map((recipient) => (
                <RecipientRow key={recipient.notificationId} recipient={recipient} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function RecipientRow({ recipient }: { recipient: RecipientDto }) {
  const { t } = useTranslation();

  return (
    <div className={cn(
      'flex items-center gap-3 rounded-lg border p-3 transition-colors',
      recipient.isRead
        ? 'border-border hover:bg-hover/30'
        : 'border-amber-200 bg-amber-50/50 dark:border-amber-500/20 dark:bg-amber-500/5'
    )}>
      {/* Avatar */}
      <div className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
        recipient.isRead
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
          : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
      )}>
        {recipient.userFullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
      </div>

      {/* User Info */}
      <div className="min-w-0 flex-1">
        <p className="font-medium text-text-primary">{recipient.userFullName}</p>
        <p className="text-xs text-text-muted">{recipient.userEmail}</p>
      </div>

      {/* Status */}
      <div className="shrink-0 text-end">
        {recipient.isRead ? (
          <div className="flex items-center gap-2">
            <Badge variant="success" size="sm">
              <CheckCircle2 className="h-3 w-3 ltr:mr-0.5 rtl:ml-0.5" />
              {t('notifications.tabRead')}
            </Badge>
            {recipient.readAt && (
              <span className="text-xs text-text-muted">
                {formatDistanceToNow(new Date(recipient.readAt), { addSuffix: true })}
              </span>
            )}
          </div>
        ) : (
          <Badge variant="warning" size="sm">
            <Clock className="h-3 w-3 ltr:mr-0.5 rtl:ml-0.5" />
            {t('notifications.tabUnread')}
          </Badge>
        )}
      </div>
    </div>
  );
}

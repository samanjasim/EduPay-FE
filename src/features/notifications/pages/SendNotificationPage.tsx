import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Send, Users, Shield, School, UserCheck, Bell,
  Monitor, Smartphone, Mail, AlertCircle, CreditCard,
  ShoppingCart, Wallet, Search, Check, ChevronRight,
} from 'lucide-react';
import { Card, CardContent, Button, Input, Textarea, Spinner, Badge } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { useBulkSendNotification } from '../api';
import { useUsers } from '@/features/users/api';
import { useSchools } from '@/features/schools/api';
import { useRoles } from '@/features/roles/api';
import { useDebounce } from '@/hooks';
import { ROUTES } from '@/config';
import { cn } from '@/utils';
import type { NotificationAudienceType, NotificationChannel, NotificationReferenceType } from '@/types';

type Step = 'audience' | 'content' | 'review';

const AUDIENCE_TYPES: { key: NotificationAudienceType; icon: typeof Users; label: string; desc: string }[] = [
  { key: 'Users', icon: Users, label: 'send.audienceUsers', desc: 'send.audienceUsersDesc' },
  { key: 'Roles', icon: Shield, label: 'send.audienceRoles', desc: 'send.audienceRolesDesc' },
  { key: 'School', icon: School, label: 'send.audienceSchool', desc: 'send.audienceSchoolDesc' },
  { key: 'Parents', icon: UserCheck, label: 'send.audienceParents', desc: 'send.audienceParentsDesc' },
];

const CHANNELS: { value: NotificationChannel; icon: typeof Bell; label: string }[] = [
  { value: 'InApp', icon: Monitor, label: 'send.channelInApp' },
  { value: 'Push', icon: Smartphone, label: 'send.channelPush' },
  { value: 'Email', icon: Mail, label: 'send.channelEmail' },
];

const REF_TYPES: { value: NotificationReferenceType; icon: typeof Bell; label: string }[] = [
  { value: 'Fee', icon: AlertCircle, label: 'notifications.refFee' },
  { value: 'Payment', icon: CreditCard, label: 'notifications.refPayment' },
  { value: 'Order', icon: ShoppingCart, label: 'notifications.refOrder' },
  { value: 'Wallet', icon: Wallet, label: 'notifications.refWallet' },
  { value: 'School', icon: School, label: 'notifications.refSchool' },
];

export default function SendNotificationPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mutateAsync: bulkSend, isPending } = useBulkSendNotification();

  const [step, setStep] = useState<Step>('audience');
  const [audienceType, setAudienceType] = useState<NotificationAudienceType>('Users');
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [channel, setChannel] = useState<NotificationChannel>('InApp');
  const [refType, setRefType] = useState<NotificationReferenceType | ''>('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const steps: { key: Step; label: string; num: number }[] = [
    { key: 'audience', label: t('send.stepAudience'), num: 1 },
    { key: 'content', label: t('send.stepContent'), num: 2 },
    { key: 'review', label: t('send.stepReview'), num: 3 },
  ];

  const canProceedAudience = () => {
    if (audienceType === 'Users' || audienceType === 'Parents') return selectedUserIds.size > 0;
    if (audienceType === 'Roles') return selectedRoles.size > 0;
    if (audienceType === 'School') return !!selectedSchoolId;
    return false;
  };

  const canProceedContent = () => !!title.trim() && !!body.trim();

  const handleSend = async () => {
    try {
      await bulkSend({
        title,
        body,
        channel,
        referenceType: refType || undefined,
        audienceType,
        userIds: (audienceType === 'Users' || audienceType === 'Parents') ? [...selectedUserIds] : undefined,
        roleNames: audienceType === 'Roles' ? [...selectedRoles] : undefined,
        schoolId: audienceType === 'School' ? selectedSchoolId : undefined,
      });
      navigate(ROUTES.NOTIFICATIONS.LIST);
    } catch {
      // handled by mutation
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('send.title')}
        subtitle={t('send.subtitle')}
        backTo={ROUTES.NOTIFICATIONS.LIST}
        backLabel={t('send.backToNotifications')}
      />

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-0">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center">
            <button
              onClick={() => {
                if (s.key === 'audience') setStep('audience');
                if (s.key === 'content' && canProceedAudience()) setStep('content');
                if (s.key === 'review' && canProceedAudience() && canProceedContent()) setStep('review');
              }}
              className={cn(
                'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all',
                step === s.key
                  ? 'bg-primary-600 text-white shadow-sm dark:bg-primary-500'
                  : steps.indexOf(steps.find(x => x.key === step)!) >= i
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-400'
                    : 'bg-hover text-text-muted'
              )}
            >
              <span className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                step === s.key ? 'bg-white/20' : 'bg-black/5 dark:bg-white/10'
              )}>{s.num}</span>
              {s.label}
            </button>
            {i < steps.length - 1 && <ChevronRight className="h-4 w-4 mx-2 text-text-muted" />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      {step === 'audience' && (
        <AudienceStep
          audienceType={audienceType}
          setAudienceType={setAudienceType}
          selectedUserIds={selectedUserIds}
          setSelectedUserIds={setSelectedUserIds}
          selectedRoles={selectedRoles}
          setSelectedRoles={setSelectedRoles}
          selectedSchoolId={selectedSchoolId}
          setSelectedSchoolId={setSelectedSchoolId}
        />
      )}

      {step === 'content' && (
        <ContentStep
          title={title}
          setTitle={setTitle}
          body={body}
          setBody={setBody}
          channel={channel}
          setChannel={setChannel}
          refType={refType}
          setRefType={setRefType}
        />
      )}

      {step === 'review' && (
        <ReviewStep
          audienceType={audienceType}
          selectedUserIds={selectedUserIds}
          selectedRoles={selectedRoles}
          channel={channel}
          refType={refType}
          title={title}
          body={body}
        />
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3">
        <div>
          {step !== 'audience' && (
            <Button variant="secondary" onClick={() => setStep(step === 'review' ? 'content' : 'audience')}>
              {t('send.back')}
            </Button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => navigate(ROUTES.NOTIFICATIONS.LIST)}>
            {t('common.cancel')}
          </Button>
          {step === 'audience' && (
            <Button onClick={() => setStep('content')} disabled={!canProceedAudience()}>
              {t('send.next')}
            </Button>
          )}
          {step === 'content' && (
            <Button onClick={() => setStep('review')} disabled={!canProceedContent()}>
              {t('send.next')}
            </Button>
          )}
          {step === 'review' && (
            <Button onClick={handleSend} isLoading={isPending} leftIcon={<Send className="h-4 w-4" />}>
              {t('send.sendNow')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Step 1: Audience ─── */

function AudienceStep({
  audienceType, setAudienceType,
  selectedUserIds, setSelectedUserIds,
  selectedRoles, setSelectedRoles,
  selectedSchoolId, setSelectedSchoolId,
}: {
  audienceType: NotificationAudienceType;
  setAudienceType: (v: NotificationAudienceType) => void;
  selectedUserIds: Set<string>;
  setSelectedUserIds: (v: Set<string>) => void;
  selectedRoles: Set<string>;
  setSelectedRoles: (v: Set<string>) => void;
  selectedSchoolId: string;
  setSelectedSchoolId: (v: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Audience Type Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {AUDIENCE_TYPES.map(({ key, icon: Icon, label, desc }) => (
          <button
            key={key}
            onClick={() => setAudienceType(key)}
            className={cn(
              'rounded-lg border p-4 text-start transition-all',
              audienceType === key
                ? 'border-primary-300 bg-primary-50 ring-2 ring-primary-200 dark:border-primary-500/40 dark:bg-primary-500/10 dark:ring-primary-500/20'
                : 'border-border hover:border-primary-200 hover:shadow-soft-sm dark:hover:border-primary-500/30'
            )}
          >
            <div className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg mb-3',
              audienceType === key
                ? 'bg-primary-100 dark:bg-primary-500/20'
                : 'bg-hover'
            )}>
              <Icon className={cn('h-5 w-5', audienceType === key ? 'text-primary-600 dark:text-primary-400' : 'text-text-muted')} />
            </div>
            <h4 className="font-semibold text-text-primary text-sm">{t(label)}</h4>
            <p className="text-xs text-text-muted mt-1">{t(desc)}</p>
            {audienceType === key && (
              <div className="mt-2 flex items-center gap-1 text-xs font-medium text-primary-600 dark:text-primary-400">
                <Check className="h-3 w-3" /> {t('send.selected')}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Audience Selection */}
      {(audienceType === 'Users' || audienceType === 'Parents') && (
        <UserPicker
          selectedIds={selectedUserIds}
          onChange={setSelectedUserIds}
          roleFilter={audienceType === 'Parents' ? 'Parent' : undefined}
          label={audienceType === 'Parents' ? t('send.selectParents') : t('send.selectUsers')}
        />
      )}
      {audienceType === 'Roles' && (
        <RolePicker selectedRoles={selectedRoles} onChange={setSelectedRoles} />
      )}
      {audienceType === 'School' && (
        <SchoolPicker selectedSchoolId={selectedSchoolId} onChange={setSelectedSchoolId} />
      )}
    </div>
  );
}

/* ─── User Picker ─── */

function UserPicker({
  selectedIds, onChange, roleFilter, label,
}: {
  selectedIds: Set<string>;
  onChange: (v: Set<string>) => void;
  roleFilter?: string;
  label: string;
}) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const { data: usersData, isLoading } = useUsers();
  const users = usersData?.data ?? [];

  const filtered = useMemo(() => {
    let list = users;
    if (roleFilter) list = list.filter((u) => u.roles?.some((r) => r.toLowerCase() === roleFilter.toLowerCase()));
    if (debouncedSearch) {
      const term = debouncedSearch.toLowerCase();
      list = list.filter((u) => u.firstName.toLowerCase().includes(term) || u.lastName.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));
    }
    return list;
  }, [users, roleFilter, debouncedSearch]);

  const toggle = (id: string) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    onChange(next);
  };

  const selectAll = () => onChange(new Set(filtered.map((u) => u.id)));
  const clearAll = () => onChange(new Set());

  return (
    <Card>
      <CardContent className="py-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-text-primary">{label}</h4>
          <div className="flex items-center gap-2">
            <Badge variant="primary" size="sm">{selectedIds.size} {t('send.selected')}</Badge>
            <Button variant="ghost" size="sm" onClick={selectAll}>{t('send.selectAll')}</Button>
            <Button variant="ghost" size="sm" onClick={clearAll}>{t('send.clearAll')}</Button>
          </div>
        </div>
        <Input
          placeholder={t('send.searchUsers')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
          className="mb-3"
        />
        {isLoading ? (
          <div className="flex justify-center py-6"><Spinner size="md" /></div>
        ) : (
          <div className="max-h-64 overflow-y-auto space-y-1">
            {filtered.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => toggle(user.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors text-start',
                  selectedIds.has(user.id)
                    ? 'bg-primary-50 dark:bg-primary-500/10'
                    : 'hover:bg-hover'
                )}
              >
                <div className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors',
                  selectedIds.has(user.id)
                    ? 'border-primary-600 bg-primary-600 dark:border-primary-400 dark:bg-primary-500'
                    : 'border-border'
                )}>
                  {selectedIds.has(user.id) && <Check className="h-3 w-3 text-white" />}
                </div>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-medium text-primary-700 dark:bg-primary-500/20 dark:text-primary-300">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-text-primary truncate">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-text-muted truncate">{user.email}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── Role Picker ─── */

function RolePicker({ selectedRoles, onChange }: { selectedRoles: Set<string>; onChange: (v: Set<string>) => void }) {
  const { t } = useTranslation();
  const { data } = useRoles();
  const roles = data?.data ?? [];

  const toggle = (name: string) => {
    const next = new Set(selectedRoles);
    next.has(name) ? next.delete(name) : next.add(name);
    onChange(next);
  };

  return (
    <Card>
      <CardContent className="py-5">
        <h4 className="text-sm font-semibold text-text-primary mb-4">{t('send.selectRoles')}</h4>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => toggle(role.name)}
              className={cn(
                'flex items-center gap-3 rounded-lg border p-3 text-start transition-all',
                selectedRoles.has(role.name)
                  ? 'border-primary-300 bg-primary-50 dark:border-primary-500/40 dark:bg-primary-500/10'
                  : 'border-border hover:border-primary-200 dark:hover:border-primary-500/30'
              )}
            >
              <div className={cn(
                'flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors',
                selectedRoles.has(role.name)
                  ? 'border-primary-600 bg-primary-600 dark:border-primary-400 dark:bg-primary-500'
                  : 'border-border'
              )}>
                {selectedRoles.has(role.name) && <Check className="h-3 w-3 text-white" />}
              </div>
              <div>
                <p className="font-medium text-sm text-text-primary">{role.name}</p>
                <p className="text-xs text-text-muted">{role.userCount} {t('send.usersInRole')}</p>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── School Picker ─── */

function SchoolPicker({ selectedSchoolId, onChange }: { selectedSchoolId: string; onChange: (v: string) => void }) {
  const { t } = useTranslation();
  const { data: schoolsData } = useSchools();
  const schools = schoolsData?.data ?? [];

  return (
    <Card>
      <CardContent className="py-5">
        <h4 className="text-sm font-semibold text-text-primary mb-4">{t('send.selectSchool')}</h4>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {schools.map((school) => (
            <button
              key={school.id}
              onClick={() => onChange(school.id)}
              className={cn(
                'flex items-center gap-3 rounded-lg border p-3 text-start transition-all',
                selectedSchoolId === school.id
                  ? 'border-primary-300 bg-primary-50 dark:border-primary-500/40 dark:bg-primary-500/10'
                  : 'border-border hover:border-primary-200 dark:hover:border-primary-500/30'
              )}
            >
              <div className={cn(
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors',
                selectedSchoolId === school.id
                  ? 'border-primary-600 bg-primary-600 dark:border-primary-400 dark:bg-primary-500'
                  : 'border-border'
              )}>
                {selectedSchoolId === school.id && <Check className="h-3 w-3 text-white" />}
              </div>
              <div>
                <p className="font-medium text-sm text-text-primary">{school.name}</p>
                <p className="text-xs text-text-muted">{school.code} &middot; {school.city}</p>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Step 2: Content ─── */

function ContentStep({
  title, setTitle, body, setBody, channel, setChannel, refType, setRefType,
}: {
  title: string; setTitle: (v: string) => void;
  body: string; setBody: (v: string) => void;
  channel: NotificationChannel; setChannel: (v: NotificationChannel) => void;
  refType: NotificationReferenceType | ''; setRefType: (v: NotificationReferenceType | '') => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Channel Selection */}
      <Card>
        <CardContent className="py-5">
          <h4 className="text-sm font-semibold text-text-primary mb-4">{t('send.chooseChannel')}</h4>
          <div className="flex flex-wrap gap-2">
            {CHANNELS.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setChannel(value)}
                className={cn(
                  'flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all',
                  channel === value
                    ? 'border-primary-300 bg-primary-50 text-primary-700 dark:border-primary-500/40 dark:bg-primary-500/10 dark:text-primary-400'
                    : 'border-border text-text-muted hover:border-primary-200 dark:hover:border-primary-500/30'
                )}
              >
                <Icon className="h-4 w-4" />
                {t(label)}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reference Type */}
      <Card>
        <CardContent className="py-5">
          <h4 className="text-sm font-semibold text-text-primary mb-1">{t('send.notificationType')}</h4>
          <p className="text-xs text-text-muted mb-4">{t('send.notificationTypeHint')}</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setRefType('')}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                !refType
                  ? 'border-primary-300 bg-primary-50 text-primary-700 dark:border-primary-500/40 dark:bg-primary-500/10 dark:text-primary-400'
                  : 'border-border text-text-muted hover:border-primary-200'
              )}
            >
              {t('send.typeGeneral')}
            </button>
            {REF_TYPES.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setRefType(value)}
                className={cn(
                  'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                  refType === value
                    ? 'border-primary-300 bg-primary-50 text-primary-700 dark:border-primary-500/40 dark:bg-primary-500/10 dark:text-primary-400'
                    : 'border-border text-text-muted hover:border-primary-200'
                )}
              >
                <Icon className="h-3 w-3" />
                {t(label)}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Message */}
      <Card>
        <CardContent className="py-5">
          <h4 className="text-sm font-semibold text-text-primary mb-4">{t('send.composeMessage')}</h4>
          <div className="space-y-4 max-w-xl">
            <Input
              label={t('send.notifTitle')}
              placeholder={t('send.titlePlaceholder')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <Textarea
              label={t('send.notifBody')}
              placeholder={t('send.bodyPlaceholder')}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              required
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Step 3: Review ─── */

function ReviewStep({
  audienceType, selectedUserIds, selectedRoles,
  channel, refType, title, body,
}: {
  audienceType: NotificationAudienceType;
  selectedUserIds: Set<string>;
  selectedRoles: Set<string>;
  channel: NotificationChannel;
  refType: NotificationReferenceType | '';
  title: string;
  body: string;
}) {
  const { t } = useTranslation();

  const audienceLabel = () => {
    switch (audienceType) {
      case 'Users': return `${selectedUserIds.size} ${t('send.usersSelected')}`;
      case 'Parents': return `${selectedUserIds.size} ${t('send.parentsSelected')}`;
      case 'Roles': return `${[...selectedRoles].join(', ')}`;
      case 'School': return t('send.allSchoolUsers');
    }
  };

  return (
    <Card>
      <CardContent className="py-6">
        <h4 className="text-lg font-semibold text-text-primary mb-6">{t('send.reviewTitle')}</h4>
        <div className="space-y-4 max-w-xl">
          <div className="flex items-center justify-between py-3 border-b border-border">
            <span className="text-sm text-text-muted">{t('send.audience')}</span>
            <span className="text-sm font-medium text-text-primary">{audienceLabel()}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-border">
            <span className="text-sm text-text-muted">{t('send.channel')}</span>
            <Badge variant="info" size="sm">{channel}</Badge>
          </div>
          {refType && (
            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-sm text-text-muted">{t('send.type')}</span>
              <Badge variant="outline" size="sm">{refType}</Badge>
            </div>
          )}
          <div className="py-3 border-b border-border">
            <span className="text-sm text-text-muted block mb-2">{t('send.preview')}</span>
            <div className="rounded-lg border border-border p-4 bg-hover/30">
              <h5 className="font-semibold text-text-primary">{title}</h5>
              <p className="mt-1 text-sm text-text-secondary whitespace-pre-wrap">{body}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

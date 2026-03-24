import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Button, Select, Input, Badge } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { useSchoolContext } from '@/features/school-portal/hooks/useSchoolContext';
import { schoolsApi } from '@/features/schools/api';
import { ROUTES } from '@/config';

const CURRENCIES = [
  { value: 'IQD', label: 'IQD - Iraqi Dinar' },
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
];

const TIMEZONES = [
  { value: 'Asia/Baghdad', label: 'Asia/Baghdad (UTC+3)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (UTC+4)' },
  { value: 'Europe/London', label: 'Europe/London (UTC+0)' },
  { value: 'America/New_York', label: 'America/New_York (UTC-5)' },
];

const LANGUAGES = [
  { value: 'ar', label: 'العربية (Arabic)' },
  { value: 'en', label: 'English' },
  { value: 'ku', label: 'کوردی (Kurdish)' },
];

type Tab = 'general' | 'configuration' | 'admins' | 'setup';

export default function SchoolSettingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { school, schoolId } = useSchoolContext();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('general');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'general', label: t('schoolPortal.settings.general') },
    { key: 'configuration', label: t('schoolPortal.settings.configuration') },
    { key: 'admins', label: t('schoolPortal.settings.admins') },
    { key: 'setup', label: t('schoolPortal.settings.setupWizard') },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={t('schoolPortal.nav.settings')} />

      {/* Tab switcher */}
      <div className="flex gap-1 rounded-lg bg-surface-200 p-1 dark:bg-surface-elevated w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-surface text-text-primary shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'general' && <GeneralTab school={school} schoolId={schoolId} queryClient={queryClient} />}
      {activeTab === 'configuration' && <ConfigTab school={school} schoolId={schoolId} queryClient={queryClient} />}
      {activeTab === 'admins' && <AdminsTab school={school} />}
      {activeTab === 'setup' && <SetupTab navigate={navigate} />}
    </div>
  );
}

function GeneralTab({ school, schoolId, queryClient }: { school: any; schoolId: string | null | undefined; queryClient: any }) {
  const { t } = useTranslation();
  const [name, setName] = useState(school?.name || '');
  const [city, setCity] = useState(school?.city || '');
  const [address, setAddress] = useState(school?.address || '');
  const [phone, setPhone] = useState(school?.phone || '');
  const [contactEmail, setContactEmail] = useState(school?.contactEmail || '');
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: () => schoolsApi.updateSchool(schoolId!, { name, city, address, phone, contactEmail }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-portal'] });
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  return (
    <Card>
      <div className="p-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label={t('schools.name')} value={name} onChange={(e) => setName(e.target.value)} />
          <Input label={t('schools.city')} value={city} onChange={(e) => setCity(e.target.value)} />
          <Input label={t('schools.address')} value={address} onChange={(e) => setAddress(e.target.value)} />
          <Input label={t('schools.phone')} value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input label={t('schools.contactEmail')} value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? t('common.loading') : t('common.save')}
          </Button>
          {success && <span className="text-sm text-emerald-600">Saved!</span>}
        </div>
      </div>
    </Card>
  );
}

function ConfigTab({ school, schoolId, queryClient }: { school: any; schoolId: string | null | undefined; queryClient: any }) {
  const { t } = useTranslation();
  const [currency, setCurrency] = useState(school?.settings?.currency || 'IQD');
  const [timezone, setTimezone] = useState(school?.settings?.timezone || 'Asia/Baghdad');
  const [defaultLanguage, setDefaultLanguage] = useState(school?.settings?.defaultLanguage || 'ar');
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: () => schoolsApi.updateSchoolSettings(schoolId!, { currency, timezone, defaultLanguage }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-portal'] });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  return (
    <Card>
      <div className="p-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label={t('schools.currency')} options={CURRENCIES} value={currency} onChange={setCurrency} />
          <Select label={t('schools.timezone')} options={TIMEZONES} value={timezone} onChange={setTimezone} />
        </div>
        <Select label={t('schools.defaultLanguage')} options={LANGUAGES} value={defaultLanguage} onChange={setDefaultLanguage} />
        <div className="flex items-center gap-3">
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? t('common.loading') : t('common.save')}
          </Button>
          {success && <span className="text-sm text-emerald-600">Saved!</span>}
        </div>
      </div>
    </Card>
  );
}

function AdminsTab({ school: _school }: { school: any }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Card>
      <div className="p-5 text-center">
        <p className="text-sm text-text-muted mb-4">{t('schoolPortal.staff.subtitle')}</p>
        <Button onClick={() => navigate(ROUTES.SCHOOL.STAFF)}>
          {t('schoolPortal.staff.title')}
        </Button>
      </div>
    </Card>
  );
}

function SetupTab({ navigate }: { navigate: (path: string) => void }) {
  const { t } = useTranslation();

  return (
    <Card>
      <div className="p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-2">{t('schoolPortal.settings.rerunSetup')}</h3>
        <p className="text-sm text-text-muted mb-4">{t('schoolPortal.settings.rerunSetupDesc')}</p>
        <Button variant="outline" onClick={() => navigate(ROUTES.SCHOOL.SETUP)}>
          {t('schoolPortal.settings.rerunSetup')}
        </Button>
      </div>
    </Card>
  );
}

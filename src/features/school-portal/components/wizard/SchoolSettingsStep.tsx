import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Select, Button } from '@/components/ui';
import { useSchoolContext } from '@/features/school-portal/hooks/useSchoolContext';
import { schoolsApi } from '@/features/schools/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

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

interface SchoolSettingsStepProps {
  onNext: () => void;
}

export function SchoolSettingsStep({ onNext }: SchoolSettingsStepProps) {
  const { t } = useTranslation();
  const { school, schoolId } = useSchoolContext();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const [currency, setCurrency] = useState(school?.settings?.currency || 'IQD');
  const [timezone, setTimezone] = useState(school?.settings?.timezone || 'Asia/Baghdad');
  const [defaultLanguage, setDefaultLanguage] = useState(school?.settings?.defaultLanguage || 'ar');

  const mutation = useMutation({
    mutationFn: () =>
      schoolsApi.updateSchoolSettings(schoolId!, { currency, timezone, defaultLanguage }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-portal'] });
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      onNext();
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to update settings');
    },
  });

  const handleSubmit = () => {
    setError(null);
    mutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label={t('schools.currency')}
          options={CURRENCIES}
          value={currency}
          onChange={setCurrency}
        />
        <Select
          label={t('schools.timezone')}
          options={TIMEZONES}
          value={timezone}
          onChange={setTimezone}
        />
      </div>

      <Select
        label={t('schools.defaultLanguage')}
        options={LANGUAGES}
        value={defaultLanguage}
        onChange={setDefaultLanguage}
      />

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={mutation.isPending}>
          {mutation.isPending ? t('common.loading') : t('schoolPortal.setup.next')}
        </Button>
      </div>
    </div>
  );
}

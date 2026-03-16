import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CreditCard, DollarSign, Settings, Info } from 'lucide-react';
import { Card, CardContent, Button, Input, Textarea, Select } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { useCreatePlan } from '../api';
import { ROUTES } from '@/config';
import type { BillingCycle } from '@/types';

const BILLING_CYCLES: { value: BillingCycle; label: string }[] = [
  { value: 'Monthly', label: 'Monthly' },
  { value: 'Quarterly', label: 'Quarterly' },
  { value: 'Annual', label: 'Annual' },
  { value: 'Lifetime', label: 'Lifetime' },
];

export default function PlanCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mutateAsync: createPlan, isPending } = useCreatePlan();

  const [form, setForm] = useState({
    name: '',
    description: '',
    isDefault: false,
    isPublic: true,
    isCustom: false,
    price: '',
    billingCycle: 'Monthly' as BillingCycle,
    maxStudents: '0',
    allowPartialPayments: false,
    allowInstallments: false,
    maxInstallments: '1',
    lateFeePercentage: '0',
    sortOrder: '0',
  });

  const set = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) return;
    try {
      await createPlan({
        name: form.name,
        description: form.description || undefined,
        isDefault: form.isDefault,
        isPublic: form.isPublic,
        isCustom: form.isCustom,
        price: parseFloat(form.price),
        billingCycle: form.billingCycle,
        maxStudents: parseInt(form.maxStudents) || 0,
        allowPartialPayments: form.allowPartialPayments,
        allowInstallments: form.allowInstallments,
        maxInstallments: parseInt(form.maxInstallments) || 1,
        lateFeePercentage: parseFloat(form.lateFeePercentage) || 0,
        sortOrder: parseInt(form.sortOrder) || 0,
      });
      navigate(ROUTES.PLANS.LIST);
    } catch { /* handled */ }
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t('plans.createPlan')} backTo={ROUTES.PLANS.LIST} backLabel={t('plans.backToPlans')} />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-500/20">
                <CreditCard className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary">{t('plans.basicInfo')}</h3>
            </div>
            <div className="space-y-4 max-w-lg">
              <Input label={t('plans.name')} placeholder="e.g. Premium Plan" value={form.name} onChange={(e) => set('name', e.target.value)} required />
              <Textarea label={t('plans.description')} placeholder="Describe what this plan includes..." value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} />
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
                <DollarSign className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary">{t('plans.pricing')}</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 max-w-2xl">
              <Input label={t('plans.price')} type="number" step="0.01" min="0" placeholder="0.00" value={form.price} onChange={(e) => set('price', e.target.value)} required />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-primary">{t('plans.billingCycle')}</label>
                <Select options={BILLING_CYCLES} value={form.billingCycle} onChange={(v) => set('billingCycle', v)} />
              </div>
              <Input label={t('plans.maxStudents')} type="number" min="0" placeholder="0 = unlimited" value={form.maxStudents} onChange={(e) => set('maxStudents', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/20">
                <Settings className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary">{t('plans.features')}</h3>
            </div>
            <div className="space-y-4 max-w-2xl">
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
                <label className="flex items-center gap-2 text-sm text-text-primary">
                  <input type="checkbox" checked={form.isDefault} onChange={(e) => set('isDefault', e.target.checked)} className="rounded border-border accent-primary-600" />
                  {t('plans.default')}
                </label>
                <label className="flex items-center gap-2 text-sm text-text-primary">
                  <input type="checkbox" checked={form.isPublic} onChange={(e) => set('isPublic', e.target.checked)} className="rounded border-border accent-primary-600" />
                  {t('plans.public')}
                </label>
                <label className="flex items-center gap-2 text-sm text-text-primary">
                  <input type="checkbox" checked={form.isCustom} onChange={(e) => set('isCustom', e.target.checked)} className="rounded border-border accent-primary-600" />
                  {t('plans.custom')}
                </label>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
                <label className="flex items-center gap-2 text-sm text-text-primary">
                  <input type="checkbox" checked={form.allowPartialPayments} onChange={(e) => set('allowPartialPayments', e.target.checked)} className="rounded border-border accent-primary-600" />
                  {t('plans.partialPayments')}
                </label>
                <label className="flex items-center gap-2 text-sm text-text-primary">
                  <input type="checkbox" checked={form.allowInstallments} onChange={(e) => set('allowInstallments', e.target.checked)} className="rounded border-border accent-primary-600" />
                  {t('plans.installments')}
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Input label={t('plans.maxInstallments')} type="number" min="1" value={form.maxInstallments} onChange={(e) => set('maxInstallments', e.target.value)} />
                <Input label={t('plans.lateFee')} type="number" step="0.1" min="0" value={form.lateFeePercentage} onChange={(e) => set('lateFeePercentage', e.target.value)} />
                <Input label={t('plans.sortOrder')} type="number" min="0" value={form.sortOrder} onChange={(e) => set('sortOrder', e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end rounded-lg border border-border bg-surface px-4 py-3 gap-3">
          <Link to={ROUTES.PLANS.LIST}><Button variant="secondary" type="button">{t('common.cancel')}</Button></Link>
          <Button type="submit" isLoading={isPending} disabled={!form.name || !form.price}>{t('common.create')}</Button>
        </div>
      </form>
    </div>
  );
}

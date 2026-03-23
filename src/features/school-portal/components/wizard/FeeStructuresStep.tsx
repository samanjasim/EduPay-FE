import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { Button, Input, Select, Card } from '@/components/ui';
import { useSchoolContext } from '@/features/school-portal/hooks/useSchoolContext';
import { useSchoolSetupStatus } from '@/features/school-portal/api';
import { useFeeTypes } from '@/features/fee-types/api';
import { useCreateFeeStructure } from '@/features/fees/api';
import type { FeeFrequency } from '@/types';

interface FeeInput {
  name: string;
  feeTypeId: string;
  amount: string;
  frequency: FeeFrequency;
  dueDate: string;
}

const FREQUENCY_OPTIONS = [
  { value: 'OneTime', label: 'One Time' },
  { value: 'Monthly', label: 'Monthly' },
  { value: 'Quarterly', label: 'Quarterly' },
  { value: 'Semester', label: 'Semester' },
  { value: 'Annual', label: 'Annual' },
];

interface FeeStructuresStepProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export function FeeStructuresStep({ onNext, onBack, onSkip }: FeeStructuresStepProps) {
  const { t } = useTranslation();
  const { schoolId, school } = useSchoolContext();
  const { data: setupStatus } = useSchoolSetupStatus(schoolId ?? undefined);
  const { data: feeTypesData } = useFeeTypes();
  const createFeeStructure = useCreateFeeStructure();
  const [fees, setFees] = useState<FeeInput[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const feeTypes = feeTypesData?.data ?? [];
  const feeTypeOptions = feeTypes.map((ft) => ({ value: ft.id, label: ft.name }));
  const hasAcademicYear = setupStatus?.academicYearLinked;

  const addFee = () => {
    setFees([
      ...fees,
      {
        name: '',
        feeTypeId: feeTypes[0]?.id ?? '',
        amount: '',
        frequency: 'Annual',
        dueDate: '',
      },
    ]);
  };

  const removeFee = (index: number) => {
    setFees(fees.filter((_, i) => i !== index));
  };

  const updateFee = <K extends keyof FeeInput>(index: number, field: K, value: FeeInput[K]) => {
    const updated = [...fees];
    updated[index] = { ...updated[index], [field]: value };
    setFees(updated);
  };

  const handleSave = async () => {
    if (fees.length === 0) {
      onNext();
      return;
    }

    const invalid = fees.filter((f) => !f.name.trim() || !f.feeTypeId || !f.amount || !f.dueDate);
    if (invalid.length > 0) {
      setError('All fee structures must have a name, type, amount, and due date.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      for (const fee of fees) {
        await createFeeStructure.mutateAsync({
          name: fee.name,
          feeTypeId: fee.feeTypeId,
          amount: parseFloat(fee.amount) || 0,
          currency: school?.settings?.currency || 'IQD',
          academicYearId: '',
          frequency: fee.frequency,
          dueDate: fee.dueDate,
        });
      }
      onNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create fee structures');
    } finally {
      setSaving(false);
    }
  };

  if (!hasAcademicYear) {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">No academic year linked</p>
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
              Fee structures require an academic year. Please ask your platform admin to create and link an academic year to your school.
            </p>
          </div>
        </div>
        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>{t('schoolPortal.setup.back')}</Button>
          <Button variant="outline" onClick={onSkip}>{t('schoolPortal.setup.skip')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {feeTypes.length === 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            No fee types available. Ask your platform admin to create fee types first.
          </p>
        </div>
      )}

      <Button variant="outline" size="sm" onClick={addFee} disabled={feeTypes.length === 0}>
        <Plus className="h-4 w-4 ltr:mr-1 rtl:ml-1" />
        Add Fee Structure
      </Button>

      <div className="space-y-3">
        {fees.map((fee, i) => (
          <Card key={i}>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  value={fee.name}
                  onChange={(e) => updateFee(i, 'name', e.target.value)}
                  placeholder="Fee name (e.g., Annual Tuition)"
                  className="flex-1"
                />
                <Button variant="ghost" size="sm" onClick={() => removeFee(i)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Select
                  options={feeTypeOptions}
                  value={fee.feeTypeId}
                  onChange={(v) => updateFee(i, 'feeTypeId', v)}
                  placeholder={t('feeStructures.allFeeTypes')}
                />
                <Input
                  type="number"
                  value={fee.amount}
                  onChange={(e) => updateFee(i, 'amount', e.target.value)}
                  placeholder={t('feeStructures.amount')}
                />
                <Select
                  options={FREQUENCY_OPTIONS}
                  value={fee.frequency}
                  onChange={(v) => updateFee(i, 'frequency', v as FeeFrequency)}
                />
                <Input
                  type="date"
                  value={fee.dueDate}
                  onChange={(e) => updateFee(i, 'dueDate', e.target.value)}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {fees.length === 0 && (
        <p className="text-center text-sm text-text-muted py-8">
          No fee structures added. You can add them now or skip and do it later.
        </p>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>{t('schoolPortal.setup.back')}</Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onSkip}>{t('schoolPortal.setup.skip')}</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? t('common.loading') : t('schoolPortal.setup.next')}
          </Button>
        </div>
      </div>
    </div>
  );
}

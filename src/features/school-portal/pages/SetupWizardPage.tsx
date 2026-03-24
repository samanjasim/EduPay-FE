import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui';
import { Spinner } from '@/components/ui';
import { WizardStepper, type WizardStep } from '../components/wizard/WizardStepper';
import { SchoolSettingsStep } from '../components/wizard/SchoolSettingsStep';
import { GradesSectionsStep } from '../components/wizard/GradesSectionsStep';
import { FeeStructuresStep } from '../components/wizard/FeeStructuresStep';
import { StudentsStep } from '../components/wizard/StudentsStep';
import { WizardComplete } from '../components/wizard/WizardComplete';
import { useSchoolContext } from '../hooks/useSchoolContext';
import { useSchoolSetupStatus, useCompleteSetup } from '../api/school-portal.queries';

export default function SetupWizardPage() {
  const { t } = useTranslation();
  const { schoolId } = useSchoolContext();
  const { data: setupStatus, isLoading } = useSchoolSetupStatus(schoolId ?? undefined);
  const completeSetupMutation = useCompleteSetup(schoolId ?? undefined);

  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const steps: WizardStep[] = useMemo(
    () => [
      {
        key: 'settings',
        title: t('schoolPortal.setup.settings.title'),
        description: t('schoolPortal.setup.settings.description'),
        required: true,
      },
      {
        key: 'grades',
        title: t('schoolPortal.setup.grades.title'),
        description: t('schoolPortal.setup.grades.description'),
        required: true,
      },
      {
        key: 'fees',
        title: t('schoolPortal.setup.fees.title'),
        description: t('schoolPortal.setup.fees.description'),
        required: false,
      },
      {
        key: 'students',
        title: t('schoolPortal.setup.students.title'),
        description: t('schoolPortal.setup.students.description'),
        required: false,
      },
    ],
    [t]
  );

  // Derive completed steps from backend data on initial load
  useEffect(() => {
    if (!setupStatus || currentStep !== null) return;

    const derived = new Set<number>();
    if (setupStatus.settingsConfigured) derived.add(0);
    if (setupStatus.gradesCount > 0) derived.add(1);
    if (setupStatus.feeStructuresCount > 0) derived.add(2);
    if (setupStatus.studentsCount > 0) derived.add(3);

    setCompletedSteps(derived);

    // Find first incomplete required step, then first incomplete optional
    const firstIncompleteRequired = steps.findIndex((s, i) => s.required && !derived.has(i));
    if (firstIncompleteRequired !== -1) {
      setCurrentStep(firstIncompleteRequired);
    } else {
      const firstIncompleteOptional = steps.findIndex((_s, i) => !derived.has(i));
      setCurrentStep(firstIncompleteOptional !== -1 ? firstIncompleteOptional : steps.length);
    }
  }, [setupStatus, currentStep, steps]);

  const markComplete = (stepIndex: number) => {
    setCompletedSteps((prev) => new Set(prev).add(stepIndex));
  };

  const goToNext = () => {
    if (currentStep === null) return;
    markComplete(currentStep);
    setCurrentStep((prev) => (prev ?? 0) + 1);
  };

  const goToBack = () => {
    setCurrentStep((prev) => Math.max(0, (prev ?? 0) - 1));
  };

  const skipStep = () => {
    setCurrentStep((prev) => (prev ?? 0) + 1);
  };

  const handleComplete = () => {
    completeSetupMutation.mutate();
  };

  if (isLoading || currentStep === null) {
    return (
      <div className="mx-auto max-w-4xl flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  const isComplete = currentStep >= steps.length;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{t('schoolPortal.setup.title')}</h1>
        <p className="mt-1 text-text-muted">{t('schoolPortal.setup.subtitle')}</p>
      </div>

      {/* Stepper */}
      {!isComplete && (
        <WizardStepper
          steps={steps}
          currentStep={currentStep}
          completedSteps={completedSteps}
        />
      )}

      {/* Step content */}
      <Card>
        <div className="p-6">
          {!isComplete && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-text-primary">
                {steps[currentStep].title}
              </h2>
              <p className="text-sm text-text-muted">{steps[currentStep].description}</p>
            </div>
          )}

          {currentStep === 0 && <SchoolSettingsStep onNext={goToNext} />}
          {currentStep === 1 && <GradesSectionsStep onNext={goToNext} onBack={goToBack} />}
          {currentStep === 2 && <FeeStructuresStep onNext={goToNext} onBack={goToBack} onSkip={skipStep} />}
          {currentStep === 3 && <StudentsStep onNext={goToNext} onBack={goToBack} onSkip={skipStep} />}
          {isComplete && <WizardComplete onComplete={handleComplete} />}
        </div>
      </Card>
    </div>
  );
}

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui';
import { WizardStepper, type WizardStep } from '../components/wizard/WizardStepper';
import { SchoolSettingsStep } from '../components/wizard/SchoolSettingsStep';
import { GradesSectionsStep } from '../components/wizard/GradesSectionsStep';
import { FeeStructuresStep } from '../components/wizard/FeeStructuresStep';
import { StudentsStep } from '../components/wizard/StudentsStep';
import { WizardComplete } from '../components/wizard/WizardComplete';

export default function SetupWizardPage() {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
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

  const markComplete = (stepIndex: number) => {
    setCompletedSteps((prev) => new Set(prev).add(stepIndex));
  };

  const goToNext = () => {
    markComplete(currentStep);
    setCurrentStep((prev) => prev + 1);
  };

  const goToBack = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const skipStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

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
          {isComplete && <WizardComplete />}
        </div>
      </Card>
    </div>
  );
}

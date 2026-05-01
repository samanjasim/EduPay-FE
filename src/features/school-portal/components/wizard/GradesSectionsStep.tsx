import { useTranslation } from 'react-i18next';
import { useState, useMemo } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { Button, Input, Card, Badge } from '@/components/ui';
import { useGrades, useCreateGrade } from '@/features/grades/api';

interface SectionInput {
  name: string;
  capacity: number | null;
}

interface GradeInput {
  name: string;
  sortOrder: number;
  sections: SectionInput[];
  expanded: boolean;
  existsInDb: boolean; // true = already saved, skip on save
}

interface GradesSectionsStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function GradesSectionsStep({ onNext, onBack }: GradesSectionsStepProps) {
  const { t } = useTranslation();
  const createGrade = useCreateGrade();
  const { data: existingGradesData } = useGrades({ pageSize: 100 });
  const existingGrades = useMemo(() => existingGradesData?.data ?? [], [existingGradesData?.data]);

  const [draftGrades, setDraftGrades] = useState<GradeInput[]>([]);
  const [expandedExistingGrades, setExpandedExistingGrades] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const existingGradeInputs = useMemo<GradeInput[]>(() =>
    existingGrades.map((g) => ({
      name: g.name,
      sortOrder: g.sortOrder ?? 0,
      sections: Array.from({ length: g.sectionCount ?? 0 }, (_, i) => ({
        name: String.fromCharCode(65 + i), // A, B, C...
        capacity: null,
      })),
      expanded: expandedExistingGrades.has(g.name),
      existsInDb: true,
    })),
    [existingGrades, expandedExistingGrades]
  );
  const grades = useMemo(() => [...existingGradeInputs, ...draftGrades], [draftGrades, existingGradeInputs]);
  const existingGradeCount = existingGradeInputs.length;

  const updateDraftGrade = (index: number, updater: (grade: GradeInput) => GradeInput) => {
    const draftIndex = index - existingGradeCount;
    if (draftIndex < 0) return;
    setDraftGrades((prev) => prev.map((grade, i) => (i === draftIndex ? updater(grade) : grade)));
  };

  // Summary counts
  const totalSections = useMemo(() => grades.reduce((sum, g) => sum + g.sections.length, 0), [grades]);
  const newGradesCount = useMemo(() => grades.filter((g) => !g.existsInDb).length, [grades]);

  const addGrade = () => {
    setDraftGrades((prev) => [
      ...prev,
      {
        name: '',
        sortOrder: grades.length + 1,
        sections: [{ name: 'A', capacity: null }],
        expanded: true,
        existsInDb: false,
      },
    ]);
  };

  const removeGrade = (index: number) => {
    if (grades[index].existsInDb) return; // Can't remove existing grades from wizard
    const draftIndex = index - existingGradeCount;
    setDraftGrades(draftGrades.filter((_, i) => i !== draftIndex));
  };

  const updateGradeName = (index: number, name: string) => {
    if (grades[index].existsInDb) return;
    updateDraftGrade(index, (grade) => ({ ...grade, name }));
  };

  const updateGradeSortOrder = (index: number, sortOrder: number) => {
    if (grades[index].existsInDb) return;
    updateDraftGrade(index, (grade) => ({ ...grade, sortOrder }));
  };

  const toggleExpand = (index: number) => {
    if (grades[index].existsInDb) {
      const gradeName = grades[index].name;
      setExpandedExistingGrades((prev) => {
        const next = new Set(prev);
        if (next.has(gradeName)) {
          next.delete(gradeName);
        } else {
          next.add(gradeName);
        }
        return next;
      });
      return;
    }

    updateDraftGrade(index, (grade) => ({ ...grade, expanded: !grade.expanded }));
  };

  const addSection = (gradeIndex: number) => {
    if (grades[gradeIndex].existsInDb) return;
    updateDraftGrade(gradeIndex, (grade) => {
      const nextLetter = String.fromCharCode(65 + grade.sections.length);
      return {
        ...grade,
        sections: [...grade.sections, { name: nextLetter, capacity: null }],
      };
    });
  };

  const removeSection = (gradeIndex: number, sectionIndex: number) => {
    if (grades[gradeIndex].existsInDb) return;
    updateDraftGrade(gradeIndex, (grade) => ({
      ...grade,
      sections: grade.sections.filter((_, i) => i !== sectionIndex),
    }));
  };

  const updateSectionName = (gradeIndex: number, sectionIndex: number, name: string) => {
    if (grades[gradeIndex].existsInDb) return;
    updateDraftGrade(gradeIndex, (grade) => {
      const sections = [...grade.sections];
      sections[sectionIndex] = { ...sections[sectionIndex], name };
      return { ...grade, sections };
    });
  };

  const updateSectionCapacity = (gradeIndex: number, sectionIndex: number, capacity: number | null) => {
    if (grades[gradeIndex].existsInDb) return;
    updateDraftGrade(gradeIndex, (grade) => {
      const sections = [...grade.sections];
      sections[sectionIndex] = { ...sections[sectionIndex], capacity };
      return { ...grade, sections };
    });
  };

  const generateTemplate = () => {
    const existingNames = new Set(grades.filter((g) => g.existsInDb).map((g) => g.name.toLowerCase()));
    let addedCount = 0;

    const newGrades: GradeInput[] = [];
    for (let i = 1; i <= 12; i++) {
      const name = t('schoolPortal.setup.grades.templateName', { number: i });
      if (existingNames.has(name.toLowerCase())) continue;
      // Also skip if already in local state
      if (grades.some((g) => g.name.toLowerCase() === name.toLowerCase())) continue;
      newGrades.push({
        name,
        sortOrder: i,
        sections: [{ name: 'A', capacity: null }, { name: 'B', capacity: null }],
        expanded: i <= 3, // Expand first 3
        existsInDb: false,
      });
      addedCount++;
    }

    if (addedCount === 0) {
      setInfo(t('schoolPortal.setup.grades.allGradesAlreadyExist'));
    } else {
      setDraftGrades((prev) => [...prev, ...newGrades]);
      setInfo(
        [
          t('schoolPortal.setup.grades.generatedGrades', { count: addedCount }),
          existingNames.size > 0
            ? t('schoolPortal.setup.grades.existingGradesSkipped', { count: existingNames.size })
            : '',
        ].filter(Boolean).join(' ')
      );
    }
  };

  const [saveProgress, setSaveProgress] = useState('');

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleSave = async () => {
    const newGrades = draftGrades.filter((g) => !g.existsInDb);

    if (grades.length === 0) {
      setError(t('schoolPortal.setup.grades.addAtLeastOneGrade'));
      return;
    }

    // If all grades already exist, just proceed
    if (newGrades.length === 0) {
      onNext();
      return;
    }

    const invalidGrades = newGrades.filter((g) => !g.name.trim());
    if (invalidGrades.length > 0) {
      setError(t('schoolPortal.setup.grades.gradeNameRequired'));
      return;
    }

    setSaving(true);
    setError(null);

    let created = 0;
    let failed = 0;

    for (const grade of newGrades) {
      setSaveProgress(t('schoolPortal.setup.grades.creatingGrade', {
        name: grade.name,
        current: created + 1,
        total: newGrades.length,
      }));
      try {
        await createGrade.mutateAsync({
          name: grade.name,
          sortOrder: grade.sortOrder,
          sections: grade.sections
            .filter((s) => s.name.trim())
            .map((s) => ({ name: s.name, capacity: s.capacity })),
        });
        created++;
        setDraftGrades((prev) => prev.filter((g) => g.name !== grade.name));
      } catch {
        failed++;
      }
      // Delay between requests to avoid rate limiting (10 req/s limit)
      if (created < newGrades.length) {
        await delay(150);
      }
    }

    setSaving(false);
    setSaveProgress('');

    if (failed > 0) {
      setError(t('schoolPortal.setup.grades.partialGradeFailure', { created, failed }));
    } else {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      {grades.length > 0 && (
        <div className="text-sm text-text-muted">
          {t('schoolPortal.setup.grades.summary', { grades: grades.length, sections: totalSections })}
          {newGradesCount > 0 && (
            <span className="text-emerald-600 dark:text-emerald-400">
              {' '}
              {t('schoolPortal.setup.grades.newGradesCount', { count: newGradesCount })}
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" onClick={generateTemplate}>
          {t('schoolPortal.setup.grades.generateTemplate')}
        </Button>
        <Button variant="outline" size="sm" onClick={addGrade}>
          <Plus className="h-4 w-4 ltr:mr-1 rtl:ml-1" />
          {t('grades.createGrade')}
        </Button>
      </div>

      {info && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">{info}</p>
      )}

      {/* Grade list */}
      <div className="space-y-3">
        {grades.map((grade, gi) => (
          <Card key={gi} className={grade.existsInDb ? 'opacity-75' : ''}>
            <div className="p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <button type="button" onClick={() => toggleExpand(gi)} className="text-text-muted hover:text-text-primary">
                  {grade.expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {grade.existsInDb ? (
                  <>
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span className="truncate text-sm font-medium text-text-primary">{grade.name}</span>
                      <span className="truncate text-xs text-text-muted">
                        {grade.sections.map((s) => s.name).join(', ')}
                      </span>
                    </div>
                    <Badge variant="success">{t('common.saved')}</Badge>
                  </>
                ) : (
                  <>
                    <Input
                      value={grade.name}
                      onChange={(e) => updateGradeName(gi, e.target.value)}
                      placeholder={t('grades.name')}
                      className="w-full lg:flex-1"
                    />
                    <Input
                      type="number"
                      value={grade.sortOrder}
                      onChange={(e) => updateGradeSortOrder(gi, parseInt(e.target.value) || 0)}
                      placeholder={t('grades.sortOrder')}
                      className="w-full sm:w-24"
                    />
                    <span className="whitespace-nowrap text-xs text-text-muted">
                      {grade.sections.length} {t('grades.sections').toLowerCase()}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => removeGrade(gi)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </>
                )}
              </div>

              {grade.expanded && !grade.existsInDb && (
                <div className="mt-3 ltr:ml-8 rtl:mr-8 space-y-2">
                  {grade.sections.map((section, si) => (
                    <div key={si} className="flex items-center gap-2">
                      <Input
                        value={section.name}
                        onChange={(e) => updateSectionName(gi, si, e.target.value)}
                        placeholder={t('grades.sectionName')}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={section.capacity ?? ''}
                        onChange={(e) => updateSectionCapacity(gi, si, e.target.value ? parseInt(e.target.value) : null)}
                        placeholder={t('grades.capacity')}
                        className="w-24"
                      />
                      <Button variant="ghost" size="sm" onClick={() => removeSection(gi, si)}>
                        <Trash2 className="h-3.5 w-3.5 text-red-400" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" onClick={() => addSection(gi)} className="text-emerald-600">
                    <Plus className="h-3.5 w-3.5 ltr:mr-1 rtl:ml-1" />
                    {t('grades.addSection')}
                  </Button>
                </div>
              )}

              {grade.expanded && grade.existsInDb && (
                <div className="mt-3 ltr:ml-8 rtl:mr-8">
                  <p className="text-xs text-text-muted">
                    {t('schoolPortal.setup.grades.sectionsList', {
                      sections: grade.sections.map((s) => s.name).join(', ') || t('common.no'),
                    })}
                  </p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {grades.length === 0 && (
        <p className="text-center text-sm text-text-muted py-8">
          {t('schoolPortal.setup.grades.noGradesYet')}
        </p>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} disabled={saving}>{t('schoolPortal.setup.back')}</Button>
        <div className="flex items-center gap-3">
          {saveProgress && <span className="text-sm text-text-muted">{saveProgress}</span>}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? t('common.loading') : t('schoolPortal.setup.next')}
          </Button>
        </div>
      </div>
    </div>
  );
}

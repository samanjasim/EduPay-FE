import { useTranslation } from 'react-i18next';
import { useState, useEffect, useMemo } from 'react';
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
  const existingGrades = existingGradesData?.data ?? [];

  const [grades, setGrades] = useState<GradeInput[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Pre-populate with existing grades from DB
  useEffect(() => {
    if (existingGrades.length > 0 && !initialized) {
      const existing: GradeInput[] = existingGrades.map((g) => ({
        name: g.name,
        sortOrder: g.sortOrder ?? 0,
        sections: Array.from({ length: g.sectionCount ?? 0 }, (_, i) => ({
          name: String.fromCharCode(65 + i), // A, B, C...
          capacity: null,
        })),
        expanded: false,
        existsInDb: true,
      }));
      setGrades(existing);
      setInitialized(true);
    } else if (existingGrades.length === 0 && existingGradesData) {
      setInitialized(true);
    }
  }, [existingGrades, existingGradesData, initialized]);

  // Summary counts
  const totalSections = useMemo(() => grades.reduce((sum, g) => sum + g.sections.length, 0), [grades]);
  const newGradesCount = useMemo(() => grades.filter((g) => !g.existsInDb).length, [grades]);

  const addGrade = () => {
    setGrades([
      ...grades,
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
    setGrades(grades.filter((_, i) => i !== index));
  };

  const updateGradeName = (index: number, name: string) => {
    if (grades[index].existsInDb) return;
    const updated = [...grades];
    updated[index] = { ...updated[index], name };
    setGrades(updated);
  };

  const updateGradeSortOrder = (index: number, sortOrder: number) => {
    if (grades[index].existsInDb) return;
    const updated = [...grades];
    updated[index] = { ...updated[index], sortOrder };
    setGrades(updated);
  };

  const toggleExpand = (index: number) => {
    const updated = [...grades];
    updated[index] = { ...updated[index], expanded: !updated[index].expanded };
    setGrades(updated);
  };

  const addSection = (gradeIndex: number) => {
    if (grades[gradeIndex].existsInDb) return;
    const updated = [...grades];
    const nextLetter = String.fromCharCode(65 + updated[gradeIndex].sections.length);
    updated[gradeIndex] = {
      ...updated[gradeIndex],
      sections: [...updated[gradeIndex].sections, { name: nextLetter, capacity: null }],
    };
    setGrades(updated);
  };

  const removeSection = (gradeIndex: number, sectionIndex: number) => {
    if (grades[gradeIndex].existsInDb) return;
    const updated = [...grades];
    updated[gradeIndex] = {
      ...updated[gradeIndex],
      sections: updated[gradeIndex].sections.filter((_, i) => i !== sectionIndex),
    };
    setGrades(updated);
  };

  const updateSectionName = (gradeIndex: number, sectionIndex: number, name: string) => {
    if (grades[gradeIndex].existsInDb) return;
    const updated = [...grades];
    const sections = [...updated[gradeIndex].sections];
    sections[sectionIndex] = { ...sections[sectionIndex], name };
    updated[gradeIndex] = { ...updated[gradeIndex], sections };
    setGrades(updated);
  };

  const updateSectionCapacity = (gradeIndex: number, sectionIndex: number, capacity: number | null) => {
    if (grades[gradeIndex].existsInDb) return;
    const updated = [...grades];
    const sections = [...updated[gradeIndex].sections];
    sections[sectionIndex] = { ...sections[sectionIndex], capacity };
    updated[gradeIndex] = { ...updated[gradeIndex], sections };
    setGrades(updated);
  };

  const generateTemplate = () => {
    const existingNames = new Set(grades.filter((g) => g.existsInDb).map((g) => g.name.toLowerCase()));
    let addedCount = 0;

    const newGrades: GradeInput[] = [];
    for (let i = 1; i <= 12; i++) {
      const name = `Grade ${i}`;
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
      setInfo('All Grade 1-12 already exist.');
    } else {
      setGrades([...grades, ...newGrades]);
      setInfo(`Added ${addedCount} new grade${addedCount > 1 ? 's' : ''}.${existingNames.size > 0 ? ` ${existingNames.size} already existed.` : ''}`);
    }
  };

  const [saveProgress, setSaveProgress] = useState('');

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleSave = async () => {
    const newGrades = grades.filter((g) => !g.existsInDb);

    if (grades.length === 0) {
      setError('Please add at least one grade.');
      return;
    }

    // If all grades already exist, just proceed
    if (newGrades.length === 0) {
      onNext();
      return;
    }

    const invalidGrades = newGrades.filter((g) => !g.name.trim());
    if (invalidGrades.length > 0) {
      setError('All new grades must have a name.');
      return;
    }

    setSaving(true);
    setError(null);

    let created = 0;
    let failed = 0;

    for (const grade of newGrades) {
      setSaveProgress(`Creating ${grade.name}... (${created + 1}/${newGrades.length})`);
      try {
        await createGrade.mutateAsync({
          name: grade.name,
          sortOrder: grade.sortOrder,
          sections: grade.sections
            .filter((s) => s.name.trim())
            .map((s) => ({ name: s.name, capacity: s.capacity })),
        });
        created++;
        // Mark as saved in local state
        setGrades((prev) =>
          prev.map((g) => g.name === grade.name && !g.existsInDb ? { ...g, existsInDb: true } : g)
        );
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
      setError(`Created ${created} grades, but ${failed} failed. Try clicking Next again to retry.`);
    } else {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      {grades.length > 0 && (
        <div className="text-sm text-text-muted">
          {grades.length} grade{grades.length !== 1 ? 's' : ''} with {totalSections} section{totalSections !== 1 ? 's' : ''} total
          {newGradesCount > 0 && (
            <span className="text-emerald-600 dark:text-emerald-400"> · {newGradesCount} new</span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" onClick={generateTemplate}>
          Generate Grade 1-12
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
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => toggleExpand(gi)} className="text-text-muted hover:text-text-primary">
                  {grade.expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {grade.existsInDb ? (
                  <>
                    <div className="flex-1 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm font-medium text-text-primary">{grade.name}</span>
                      <span className="text-xs text-text-muted">
                        · {grade.sections.map((s) => s.name).join(', ')}
                      </span>
                    </div>
                    <Badge variant="success">Saved</Badge>
                  </>
                ) : (
                  <>
                    <Input
                      value={grade.name}
                      onChange={(e) => updateGradeName(gi, e.target.value)}
                      placeholder={t('grades.name')}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={grade.sortOrder}
                      onChange={(e) => updateGradeSortOrder(gi, parseInt(e.target.value) || 0)}
                      placeholder={t('grades.sortOrder')}
                      className="w-20"
                    />
                    <span className="text-xs text-text-muted whitespace-nowrap">
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
                    Sections: {grade.sections.map((s) => s.name).join(', ') || 'None'}
                  </p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {grades.length === 0 && (
        <p className="text-center text-sm text-text-muted py-8">
          No grades added yet. Use the buttons above to add grades or generate a template.
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

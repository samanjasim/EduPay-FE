import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import { useCreateGrade } from '@/features/grades/api';

interface SectionInput {
  name: string;
  capacity: number | null;
}

interface GradeInput {
  name: string;
  sortOrder: number;
  sections: SectionInput[];
  expanded: boolean;
}

interface GradesSectionsStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function GradesSectionsStep({ onNext, onBack }: GradesSectionsStepProps) {
  const { t } = useTranslation();
  const createGrade = useCreateGrade();
  const [grades, setGrades] = useState<GradeInput[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addGrade = () => {
    setGrades([
      ...grades,
      {
        name: '',
        sortOrder: grades.length + 1,
        sections: [{ name: 'A', capacity: null }],
        expanded: true,
      },
    ]);
  };

  const removeGrade = (index: number) => {
    setGrades(grades.filter((_, i) => i !== index));
  };

  const updateGradeName = (index: number, name: string) => {
    const updated = [...grades];
    updated[index] = { ...updated[index], name };
    setGrades(updated);
  };

  const updateGradeSortOrder = (index: number, sortOrder: number) => {
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
    const updated = [...grades];
    const nextLetter = String.fromCharCode(65 + updated[gradeIndex].sections.length);
    updated[gradeIndex] = {
      ...updated[gradeIndex],
      sections: [...updated[gradeIndex].sections, { name: nextLetter, capacity: null }],
    };
    setGrades(updated);
  };

  const removeSection = (gradeIndex: number, sectionIndex: number) => {
    const updated = [...grades];
    updated[gradeIndex] = {
      ...updated[gradeIndex],
      sections: updated[gradeIndex].sections.filter((_, i) => i !== sectionIndex),
    };
    setGrades(updated);
  };

  const updateSectionName = (gradeIndex: number, sectionIndex: number, name: string) => {
    const updated = [...grades];
    const sections = [...updated[gradeIndex].sections];
    sections[sectionIndex] = { ...sections[sectionIndex], name };
    updated[gradeIndex] = { ...updated[gradeIndex], sections };
    setGrades(updated);
  };

  const updateSectionCapacity = (gradeIndex: number, sectionIndex: number, capacity: number | null) => {
    const updated = [...grades];
    const sections = [...updated[gradeIndex].sections];
    sections[sectionIndex] = { ...sections[sectionIndex], capacity };
    updated[gradeIndex] = { ...updated[gradeIndex], sections };
    setGrades(updated);
  };

  const generateTemplate = () => {
    const template: GradeInput[] = Array.from({ length: 12 }, (_, i) => ({
      name: `Grade ${i + 1}`,
      sortOrder: i + 1,
      sections: [
        { name: 'A', capacity: null },
        { name: 'B', capacity: null },
      ],
      expanded: false,
    }));
    setGrades(template);
  };

  const handleSave = async () => {
    if (grades.length === 0) {
      setError('Please add at least one grade.');
      return;
    }

    const invalidGrades = grades.filter((g) => !g.name.trim());
    if (invalidGrades.length > 0) {
      setError('All grades must have a name.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      for (const grade of grades) {
        await createGrade.mutateAsync({
          name: grade.name,
          sortOrder: grade.sortOrder,
          sections: grade.sections
            .filter((s) => s.name.trim())
            .map((s) => ({ name: s.name, capacity: s.capacity })),
        });
      }
      onNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create grades');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick template */}
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" onClick={generateTemplate}>
          Generate Grade 1-12
        </Button>
        <Button variant="outline" size="sm" onClick={addGrade}>
          <Plus className="h-4 w-4 ltr:mr-1 rtl:ml-1" />
          {t('grades.createGrade')}
        </Button>
      </div>

      {/* Grade list */}
      <div className="space-y-3">
        {grades.map((grade, gi) => (
          <Card key={gi}>
            <div className="p-4">
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => toggleExpand(gi)} className="text-text-muted hover:text-text-primary">
                  {grade.expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
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
              </div>

              {grade.expanded && (
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

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>{t('schoolPortal.setup.back')}</Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? t('common.loading') : t('schoolPortal.setup.next')}
        </Button>
      </div>
    </div>
  );
}

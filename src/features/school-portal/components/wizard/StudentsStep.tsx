import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Plus, Trash2, Upload } from 'lucide-react';
import { Button, Input, Select, Card } from '@/components/ui';
import { useGrades } from '@/features/grades/api';
import { useCreateStudent } from '@/features/students/api';
import type { Gender } from '@/types';

interface StudentInput {
  fullNameAr: string;
  fullNameEn: string;
  studentCode: string;
  gradeId: string;
  dateOfBirth: string;
  gender: Gender;
}

interface StudentsStepProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export function StudentsStep({ onNext, onBack, onSkip }: StudentsStepProps) {
  const { t } = useTranslation();
  const { data: gradesData } = useGrades();
  const createStudent = useCreateStudent();
  const [students, setStudents] = useState<StudentInput[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const grades = gradesData?.data ?? [];
  const gradeOptions = grades.map((g) => ({ value: g.id, label: g.name }));
  const genderOptions = [
    { value: 'Male', label: t('students.male') },
    { value: 'Female', label: t('students.female') },
  ];

  const addStudent = () => {
    setStudents([
      ...students,
      {
        fullNameAr: '',
        fullNameEn: '',
        studentCode: '',
        gradeId: grades[0]?.id ?? '',
        dateOfBirth: '',
        gender: 'Male',
      },
    ]);
  };

  const removeStudent = (index: number) => {
    setStudents(students.filter((_, i) => i !== index));
  };

  const updateStudent = <K extends keyof StudentInput>(index: number, field: K, value: StudentInput[K]) => {
    const updated = [...students];
    updated[index] = { ...updated[index], [field]: value };
    setStudents(updated);
  };

  const handleSave = async () => {
    if (students.length === 0) {
      onNext();
      return;
    }

    const invalid = students.filter((s) => !s.fullNameAr.trim() || !s.studentCode.trim() || !s.gradeId);
    if (invalid.length > 0) {
      setError(t('schoolPortal.setup.students.validationRequired'));
      return;
    }

    setSaving(true);
    setError(null);

    try {
      for (const student of students) {
        await createStudent.mutateAsync({
          fullNameAr: student.fullNameAr,
          fullNameEn: student.fullNameEn || student.fullNameAr,
          studentCode: student.studentCode,
          gradeId: student.gradeId,
          dateOfBirth: student.dateOfBirth || '2010-01-01',
          gender: student.gender,
          enrollmentAcademicYearId: '',
        });
      }
      onNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('schoolPortal.setup.students.createFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" onClick={addStudent}>
          <Plus className="h-4 w-4 ltr:mr-1 rtl:ml-1" />
          {t('students.addStudent')}
        </Button>
        <Button variant="outline" size="sm" disabled title={t('schoolPortal.setup.students.importComingSoon')}>
          <Upload className="h-4 w-4 ltr:mr-1 rtl:ml-1" />
          {t('schoolPortal.setup.students.importCsv')}
        </Button>
      </div>

      <div className="space-y-3">
        {students.map((student, i) => (
          <Card key={i}>
            <div className="p-4 space-y-3">
              <div className="grid gap-2 lg:grid-cols-[auto_1fr_1fr_auto] lg:items-center">
                <span className="w-8 text-xs font-medium text-text-muted">#{i + 1}</span>
                <Input
                  value={student.fullNameAr}
                  onChange={(e) => updateStudent(i, 'fullNameAr', e.target.value)}
                  placeholder={t('students.fullNameAr')}
                  className="flex-1"
                  dir="rtl"
                />
                <Input
                  value={student.fullNameEn}
                  onChange={(e) => updateStudent(i, 'fullNameEn', e.target.value)}
                  placeholder={t('students.fullNameEn')}
                  className="flex-1"
                />
                <Button variant="ghost" size="sm" onClick={() => removeStudent(i)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Input
                  value={student.studentCode}
                  onChange={(e) => updateStudent(i, 'studentCode', e.target.value)}
                  placeholder={t('students.studentCode')}
                />
                <Select
                  options={gradeOptions}
                  value={student.gradeId}
                  onChange={(v) => updateStudent(i, 'gradeId', v)}
                  placeholder={t('students.selectGrade')}
                />
                <Input
                  type="date"
                  value={student.dateOfBirth}
                  onChange={(e) => updateStudent(i, 'dateOfBirth', e.target.value)}
                />
                <Select
                  options={genderOptions}
                  value={student.gender}
                  onChange={(v) => updateStudent(i, 'gender', v as Gender)}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {students.length === 0 && (
        <p className="text-center text-sm text-text-muted py-8">
          {t('schoolPortal.setup.students.empty')}
        </p>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        <Button variant="outline" onClick={onBack}>{t('schoolPortal.setup.back')}</Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onSkip}>{t('schoolPortal.setup.skip')}</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? t('common.loading') : t('schoolPortal.setup.finish')}
          </Button>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, BookOpen, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import { Spinner } from '@/components/ui';
import { ConfirmModal } from '@/components/common';
import { useGrades, useToggleGradeStatus, useDeleteGrade } from '@/features/grades/api';
import { CreateGradeModal } from '../components/grades/CreateGradeModal';
import { ROUTES } from '@/config';
import type { GradeSummaryDto } from '@/types';

export default function SchoolGradesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading } = useGrades({ pageSize: 50 });
  const toggleStatus = useToggleGradeStatus();
  const deleteGrade = useDeleteGrade();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [gradeToDelete, setGradeToDelete] = useState<GradeSummaryDto | null>(null);

  const grades = data?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{t('schoolPortal.grades.title')}</h1>
          <p className="mt-1 text-text-muted">{t('schoolPortal.grades.subtitle')}</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
          {t('schoolPortal.grades.addGrade')}
        </Button>
      </div>

      {/* Grade cards */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : grades.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="h-12 w-12 text-text-muted mb-4" />
            <h3 className="text-lg font-semibold text-text-primary">{t('schoolPortal.grades.noGrades')}</h3>
            <p className="mt-1 text-sm text-text-muted">{t('schoolPortal.grades.noGradesDesc')}</p>
            <Button className="mt-4" onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
              {t('schoolPortal.grades.addGrade')}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {grades.map((grade) => (
            <Card
              key={grade.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => navigate(ROUTES.SCHOOL.GRADES.getDetail(grade.id))}
            >
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">{grade.name}</h3>
                    <p className="mt-1 text-sm text-text-muted">
                      {grade.sectionCount} {t('schoolPortal.grades.sections')} · {grade.studentCount} {t('schoolPortal.grades.studentsLabel')}
                    </p>
                  </div>
                  <Badge variant={grade.isActive ? 'success' : 'default'}>
                    {grade.isActive ? t('common.active') : t('common.inactive')}
                  </Badge>
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleStatus.mutate({ id: grade.id, data: { isActive: !grade.isActive } })}
                    disabled={toggleStatus.isPending}
                  >
                    {grade.isActive ? (
                      <ToggleRight className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <ToggleLeft className="h-4 w-4 text-text-muted" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setGradeToDelete(grade)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                  <div className="flex items-center gap-1.5 ltr:ml-auto rtl:mr-auto text-text-muted">
                    <Users className="h-3.5 w-3.5" />
                    <span className="text-sm font-medium">{grade.studentCount}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <CreateGradeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      <ConfirmModal
        isOpen={!!gradeToDelete}
        onClose={() => setGradeToDelete(null)}
        onConfirm={() => {
          if (gradeToDelete) {
            deleteGrade.mutate(gradeToDelete.id, {
              onSuccess: () => setGradeToDelete(null),
            });
          }
        }}
        title={t('schoolPortal.grades.deleteTitle')}
        description={t('schoolPortal.grades.deleteDesc', { name: gradeToDelete?.name })}
        confirmLabel={t('common.delete')}
        isLoading={deleteGrade.isPending}
      />
    </div>
  );
}

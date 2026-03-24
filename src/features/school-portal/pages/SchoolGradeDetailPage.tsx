import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Users } from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import { Spinner } from '@/components/ui';
import { ConfirmModal } from '@/components/common';
import {
  useGradeWithStats,
  useToggleSectionStatus,
  useDeleteSection,
} from '@/features/grades/api';
import { EditGradeModal } from '../components/grades/EditGradeModal';
import { AddSectionModal } from '../components/grades/AddSectionModal';
import { EditSectionModal } from '../components/grades/EditSectionModal';
import { ROUTES } from '@/config';
import type { SectionWithStatsDto } from '@/types';

export default function SchoolGradeDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: grade, isLoading } = useGradeWithStats(id);
  const toggleSectionStatus = useToggleSectionStatus();
  const deleteSection = useDeleteSection();

  const [showEditGrade, setShowEditGrade] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);
  const [sectionToEdit, setSectionToEdit] = useState<SectionWithStatsDto | null>(null);
  const [sectionToDelete, setSectionToDelete] = useState<SectionWithStatsDto | null>(null);

  if (isLoading) {
    return <div className="flex justify-center py-20"><Spinner /></div>;
  }

  if (!grade) {
    return <p className="text-center text-text-muted py-12">{t('common.notFound')}</p>;
  }

  const totalFees = grade.paidFeesAmount + grade.unpaidFeesAmount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.SCHOOL.GRADES.LIST)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text-primary">{grade.name}</h1>
            <Badge variant={grade.isActive ? 'success' : 'default'}>
              {grade.isActive ? t('common.active') : t('common.inactive')}
            </Badge>
          </div>
          <p className="mt-0.5 text-sm text-text-muted">
            {t('schoolPortal.grades.sortOrder')}: {grade.sortOrder}
          </p>
        </div>
        <Button variant="outline" onClick={() => setShowEditGrade(true)}>
          <Pencil className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
          {t('common.edit')}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <div className="p-4 text-center">
            <p className="text-2xl font-bold text-text-primary">{grade.studentCount}</p>
            <p className="text-sm text-text-muted">{t('schoolPortal.grades.totalStudents')}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{grade.paidFeesAmount.toLocaleString()}</p>
            <p className="text-sm text-text-muted">{t('schoolPortal.grades.paidFees')}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <p className="text-2xl font-bold text-red-500">{grade.unpaidFeesAmount.toLocaleString()}</p>
            <p className="text-sm text-text-muted">{t('schoolPortal.grades.unpaidFees')}</p>
          </div>
        </Card>
      </div>

      {/* Sections */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">{t('schoolPortal.grades.sections')}</h2>
        <Button size="sm" onClick={() => setShowAddSection(true)}>
          <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
          {t('schoolPortal.grades.addSection')}
        </Button>
      </div>

      {grade.sections.length === 0 ? (
        <Card>
          <div className="py-8 text-center text-text-muted">
            {t('schoolPortal.grades.noSections')}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {grade.sections.map((section) => (
            <Card key={section.id}>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-text-primary">{section.name}</h3>
                    <div className="mt-1 flex items-center gap-2 text-sm text-text-muted">
                      <Users className="h-3.5 w-3.5" />
                      <span>{section.studentCount}{section.capacity ? ` / ${section.capacity}` : ''}</span>
                    </div>
                  </div>
                  <Badge variant={section.isActive ? 'success' : 'default'} className="text-xs">
                    {section.isActive ? t('common.active') : t('common.inactive')}
                  </Badge>
                </div>

                {/* Capacity bar */}
                {section.capacity && section.capacity > 0 && (
                  <div className="mt-3">
                    <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                      <div
                        className={`transition-all ${
                          section.capacityUsagePercent > 90 ? 'bg-red-500' :
                          section.capacityUsagePercent > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(section.capacityUsagePercent, 100)}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-text-muted">{section.capacityUsagePercent}% {t('schoolPortal.grades.capacityUsed')}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-3 flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setSectionToEdit(section)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSectionStatus.mutate({
                      gradeId: grade.id,
                      sectionId: section.id,
                      data: { isActive: !section.isActive },
                    })}
                  >
                    {section.isActive ? (
                      <ToggleRight className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <ToggleLeft className="h-3.5 w-3.5 text-text-muted" />
                    )}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setSectionToDelete(section)}>
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      {showEditGrade && (
        <EditGradeModal
          isOpen={showEditGrade}
          onClose={() => setShowEditGrade(false)}
          grade={grade}
        />
      )}

      <AddSectionModal
        isOpen={showAddSection}
        onClose={() => setShowAddSection(false)}
        gradeId={grade.id}
      />

      {sectionToEdit && (
        <EditSectionModal
          isOpen={!!sectionToEdit}
          onClose={() => setSectionToEdit(null)}
          gradeId={grade.id}
          section={sectionToEdit}
        />
      )}

      <ConfirmModal
        isOpen={!!sectionToDelete}
        onClose={() => setSectionToDelete(null)}
        onConfirm={() => {
          if (sectionToDelete) {
            deleteSection.mutate(
              { gradeId: grade.id, sectionId: sectionToDelete.id },
              { onSuccess: () => setSectionToDelete(null) }
            );
          }
        }}
        title={t('schoolPortal.grades.deleteSectionTitle')}
        description={t('schoolPortal.grades.deleteSectionDesc', { name: sectionToDelete?.name })}
        confirmLabel={t('common.delete')}
        isLoading={deleteSection.isPending}
      />
    </div>
  );
}

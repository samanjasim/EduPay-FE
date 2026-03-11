import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  GraduationCap, Pencil, Trash2, Plus, ToggleLeft, ToggleRight,
} from 'lucide-react';
import {
  Card, CardContent, CardHeader, CardTitle,
  Badge, Button, Spinner, Input, Modal, ModalFooter,
} from '@/components/ui';
import { PageHeader, InfoField, ConfirmModal } from '@/components/common';
import {
  useGrade,
  useUpdateGrade,
  useDeleteGrade,
  useToggleGradeStatus,
  useAddSection,
  useUpdateSection,
  useDeleteSection,
  useToggleSectionStatus,
} from '../api';
import { usePermissions } from '@/hooks';
import { PERMISSIONS } from '@/constants';
import { ROUTES } from '@/config';
import {
  updateGradeSchema, sectionSchema,
  type UpdateGradeFormData, type SectionFormData,
} from '@/lib/validation';
import { format } from 'date-fns';
import type { SectionDto } from '@/types';

export default function GradeDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const { data: grade, isLoading } = useGrade(id!);

  const { mutate: deleteGradeMutation, isPending: isDeleting } = useDeleteGrade();
  const { mutate: toggleGradeStatusMutation, isPending: isTogglingGrade } = useToggleGradeStatus();
  const { mutate: deleteSectionMutation, isPending: isDeletingSection } = useDeleteSection();
  const { mutate: toggleSectionStatusMutation, isPending: isTogglingSection } = useToggleSectionStatus();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showToggleModal, setShowToggleModal] = useState(false);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [editSection, setEditSection] = useState<SectionDto | null>(null);
  const [deleteSection, setDeleteSection] = useState<SectionDto | null>(null);
  const [toggleSection, setToggleSection] = useState<SectionDto | null>(null);

  const canUpdateGrade = hasPermission(PERMISSIONS.Grades.Update);
  const canDeleteGrade = hasPermission(PERMISSIONS.Grades.Delete);
  const canCreateSection = hasPermission(PERMISSIONS.Sections.Create);
  const canUpdateSection = hasPermission(PERMISSIONS.Sections.Update);
  const canDeleteSection = hasPermission(PERMISSIONS.Sections.Delete);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!grade) {
    return <div className="text-text-secondary">{t('common.noResults')}</div>;
  }

  const handleDeleteGrade = () => {
    deleteGradeMutation(id!, {
      onSuccess: () => navigate(ROUTES.GRADES.LIST),
    });
  };

  const handleToggleGradeStatus = () => {
    toggleGradeStatusMutation(
      { id: id!, data: { isActive: !grade.isActive } },
      { onSuccess: () => setShowToggleModal(false) }
    );
  };

  const handleDeleteSection = () => {
    if (!deleteSection) return;
    deleteSectionMutation(
      { gradeId: id!, sectionId: deleteSection.id },
      { onSuccess: () => setDeleteSection(null) }
    );
  };

  const handleToggleSectionStatus = () => {
    if (!toggleSection) return;
    toggleSectionStatusMutation(
      { gradeId: id!, sectionId: toggleSection.id, data: { isActive: !toggleSection.isActive } },
      { onSuccess: () => setToggleSection(null) }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        backTo={ROUTES.GRADES.LIST}
        backLabel={t('grades.backToGrades')}
      />

      {/* Header Card */}
      <Card>
        <CardContent className="space-y-6 py-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-500/20">
              <GraduationCap className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-text-primary">{grade.name}</h1>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant={grade.isActive ? 'success' : 'default'}>
                {grade.isActive ? t('grades.active') : t('grades.inactive')}
              </Badge>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
            <InfoField label={t('grades.sortOrder')}>{grade.sortOrder}</InfoField>
            <InfoField label={t('grades.sections')}>{grade.sections.length}</InfoField>
            <InfoField label={t('common.createdAt')}>
              {format(new Date(grade.createdAt), 'MMMM d, yyyy')}
            </InfoField>
            {grade.modifiedAt && (
              <InfoField label={t('grades.modifiedAt')}>
                {format(new Date(grade.modifiedAt), 'MMMM d, yyyy')}
              </InfoField>
            )}
          </div>

          {/* Actions */}
          {(canUpdateGrade || canDeleteGrade) && (
            <div className="flex items-center gap-2 border-t border-border pt-4 flex-wrap">
              {canUpdateGrade && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowEditModal(true)}
                    leftIcon={<Pencil className="h-4 w-4" />}
                  >
                    {t('common.edit')}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowToggleModal(true)}
                    leftIcon={grade.isActive
                      ? <ToggleRight className="h-4 w-4" />
                      : <ToggleLeft className="h-4 w-4" />
                    }
                  >
                    {grade.isActive ? t('grades.deactivate') : t('grades.activate')}
                  </Button>
                </>
              )}
              {canDeleteGrade && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setShowDeleteModal(true)}
                  leftIcon={<Trash2 className="h-4 w-4" />}
                >
                  {t('common.delete')}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            {t('grades.sections')} ({grade.sections.length})
          </CardTitle>
          {canCreateSection && (
            <Button
              size="sm"
              onClick={() => setShowAddSectionModal(true)}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              {t('grades.addSection')}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {grade.sections.length === 0 ? (
            <p className="py-4 text-sm text-text-muted">{t('grades.noSections')}</p>
          ) : (
            <div className="-mx-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 pb-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                      {t('grades.sectionName')}
                    </th>
                    <th className="px-4 pb-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                      {t('grades.capacity')}
                    </th>
                    <th className="px-4 pb-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                      {t('common.status')}
                    </th>
                    {(canUpdateSection || canDeleteSection) && (
                      <th className="px-4 pb-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('common.actions')}
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {grade.sections.map((section) => (
                    <tr key={section.id} className="hover:bg-hover/50 transition-colors">
                      <td className="px-4 py-3.5 font-medium text-text-primary">{section.name}</td>
                      <td className="px-4 py-3.5 text-text-secondary">
                        {section.capacity ?? '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge
                          variant={section.isActive ? 'success' : 'default'}
                          size="sm"
                        >
                          {section.isActive ? t('grades.active') : t('grades.inactive')}
                        </Badge>
                      </td>
                      {(canUpdateSection || canDeleteSection) && (
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1">
                            {canUpdateSection && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditSection(section)}
                                  title={t('common.edit')}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setToggleSection(section)}
                                  title={section.isActive ? t('grades.deactivate') : t('grades.activate')}
                                >
                                  {section.isActive ? (
                                    <ToggleRight className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <ToggleLeft className="h-4 w-4 text-text-muted" />
                                  )}
                                </Button>
                              </>
                            )}
                            {canDeleteSection && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteSection(section)}
                                title={t('common.delete')}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grade Modals */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteGrade}
        title={t('grades.deleteGrade')}
        description={t('grades.deleteConfirmation', { name: grade.name })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        isLoading={isDeleting}
      />

      <ConfirmModal
        isOpen={showToggleModal}
        onClose={() => setShowToggleModal(false)}
        onConfirm={handleToggleGradeStatus}
        title={grade.isActive ? t('grades.deactivate') : t('grades.activate')}
        description={
          grade.isActive
            ? t('grades.deactivateConfirmation', { name: grade.name })
            : t('grades.activateConfirmation', { name: grade.name })
        }
        confirmLabel={grade.isActive ? t('grades.deactivate') : t('grades.activate')}
        cancelLabel={t('common.cancel')}
        variant={grade.isActive ? 'danger' : 'primary'}
        isLoading={isTogglingGrade}
      />

      {/* Edit Grade Modal */}
      {showEditModal && (
        <EditGradeModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          gradeId={id!}
          defaultValues={{ name: grade.name, sortOrder: grade.sortOrder }}
        />
      )}

      {/* Add Section Modal */}
      {showAddSectionModal && (
        <SectionModal
          isOpen={showAddSectionModal}
          onClose={() => setShowAddSectionModal(false)}
          gradeId={id!}
        />
      )}

      {/* Edit Section Modal */}
      {editSection && (
        <SectionModal
          isOpen={!!editSection}
          onClose={() => setEditSection(null)}
          gradeId={id!}
          section={editSection}
        />
      )}

      {/* Section Confirm Modals */}
      <ConfirmModal
        isOpen={!!deleteSection}
        onClose={() => setDeleteSection(null)}
        onConfirm={handleDeleteSection}
        title={t('grades.deleteSection')}
        description={t('grades.sectionDeleteConfirmation', { name: deleteSection?.name })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        isLoading={isDeletingSection}
      />

      <ConfirmModal
        isOpen={!!toggleSection}
        onClose={() => setToggleSection(null)}
        onConfirm={handleToggleSectionStatus}
        title={toggleSection?.isActive ? t('grades.deactivate') : t('grades.activate')}
        description={
          toggleSection?.isActive
            ? t('grades.sectionDeactivateConfirmation', { name: toggleSection?.name })
            : t('grades.sectionActivateConfirmation', { name: toggleSection?.name })
        }
        confirmLabel={toggleSection?.isActive ? t('grades.deactivate') : t('grades.activate')}
        cancelLabel={t('common.cancel')}
        variant={toggleSection?.isActive ? 'danger' : 'primary'}
        isLoading={isTogglingSection}
      />
    </div>
  );
}

/* ─── Edit Grade Modal ─── */

function EditGradeModal({
  isOpen,
  onClose,
  gradeId,
  defaultValues,
}: {
  isOpen: boolean;
  onClose: () => void;
  gradeId: string;
  defaultValues: UpdateGradeFormData;
}) {
  const { t } = useTranslation();
  const { mutate: updateGrade, isPending } = useUpdateGrade();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateGradeFormData>({
    resolver: zodResolver(updateGradeSchema),
    defaultValues,
  });

  const onSubmit = (data: UpdateGradeFormData) => {
    updateGrade({ id: gradeId, data }, { onSuccess: onClose });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('grades.editGrade')} size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label={t('grades.name')}
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label={t('grades.sortOrder')}
          type="number"
          error={errors.sortOrder?.message}
          {...register('sortOrder', { valueAsNumber: true })}
        />
        <ModalFooter>
          <Button variant="secondary" type="button" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" isLoading={isPending}>
            {t('common.save')}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

/* ─── Add / Edit Section Modal ─── */

function SectionModal({
  isOpen,
  onClose,
  gradeId,
  section,
}: {
  isOpen: boolean;
  onClose: () => void;
  gradeId: string;
  section?: SectionDto;
}) {
  const { t } = useTranslation();
  const isEdit = !!section;
  const { mutate: addSection, isPending: isAdding } = useAddSection();
  const { mutate: updateSection, isPending: isUpdating } = useUpdateSection();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SectionFormData>({
    resolver: zodResolver(sectionSchema),
    defaultValues: section
      ? { name: section.name, capacity: section.capacity }
      : { name: '', capacity: null },
  });

  const onSubmit = (data: SectionFormData) => {
    if (isEdit) {
      updateSection(
        { gradeId, sectionId: section!.id, data },
        { onSuccess: onClose }
      );
    } else {
      addSection(
        { gradeId, data },
        { onSuccess: onClose }
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? t('grades.editSection') : t('grades.addSection')}
      size="sm"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label={t('grades.sectionName')}
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label={t('grades.capacity')}
          type="number"
          error={errors.capacity?.message}
          {...register('capacity', {
            setValueAs: (v: string) => (v === '' ? null : Number(v)),
          })}
        />
        <ModalFooter>
          <Button variant="secondary" type="button" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" isLoading={isAdding || isUpdating}>
            {isEdit ? t('common.save') : t('common.create')}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

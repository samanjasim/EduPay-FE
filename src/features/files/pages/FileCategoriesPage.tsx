import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FolderOpen, Plus, Pencil, Trash2, Check, Languages,
} from 'lucide-react';
import {
  Card, CardContent, CardHeader, CardTitle,
  Badge, Spinner, Button, Input, Modal, ModalFooter,
} from '@/components/ui';
import { PageHeader, EmptyState, ConfirmModal } from '@/components/common';
import {
  useFileCategories, useCreateFileCategory, useUpdateFileCategory, useDeleteFileCategory,
} from '../api';
import { ROUTES } from '@/config';
import { format } from 'date-fns';
import type { FileCategoryDto } from '@/types';

export default function FileCategoriesPage() {
  const { t } = useTranslation();
  const { data: categories, isLoading } = useFileCategories();
  const createCategory = useCreateFileCategory();
  const updateCategory = useUpdateFileCategory();
  const deleteCategory = useDeleteFileCategory();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTarget, setEditTarget] = useState<FileCategoryDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteCategory.mutate(deleteTarget, { onSettled: () => setDeleteTarget(null) });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('fileCategories.title')}
        subtitle={t('fileCategories.subtitle')}
        backTo={ROUTES.FILES}
        backLabel={t('fileCategories.backToFiles')}
        actions={
          <Button onClick={() => setShowCreateModal(true)} leftIcon={<Plus className="h-4 w-4" />}>
            {t('fileCategories.create')}
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-500/20">
              <FolderOpen className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{categories?.length ?? 0}</p>
              <p className="text-xs text-text-muted">{t('fileCategories.total')}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
              <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{categories?.filter((c) => c.isActive).length ?? 0}</p>
              <p className="text-xs text-text-muted">{t('fileCategories.active')}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-500/20">
              <Languages className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">3</p>
              <p className="text-xs text-text-muted">{t('fileCategories.languages')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            {t('fileCategories.list')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Spinner size="md" /></div>
          ) : !categories || categories.length === 0 ? (
            <EmptyState icon={FolderOpen} title={t('fileCategories.empty')} />
          ) : (
            <div className="-mx-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 pb-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">{t('fileCategories.nameEn')}</th>
                    <th className="px-4 pb-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">{t('fileCategories.nameAr')}</th>
                    <th className="px-4 pb-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">{t('fileCategories.nameKu')}</th>
                    <th className="px-4 pb-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">{t('common.status')}</th>
                    <th className="px-4 pb-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">{t('common.createdAt')}</th>
                    <th className="px-4 pb-3 text-end text-xs font-medium uppercase tracking-wide text-text-muted">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-hover/50 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <FolderOpen className="h-4 w-4 text-primary-500 shrink-0" />
                          <span className="font-medium text-text-primary">{cat.nameEn}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-text-secondary" dir="rtl">{cat.nameAr}</td>
                      <td className="px-4 py-3.5 text-text-secondary" dir="rtl">{cat.nameKu}</td>
                      <td className="px-4 py-3.5">
                        <Badge variant={cat.isActive ? 'success' : 'warning'} size="sm">
                          {cat.isActive ? t('common.active') : t('common.inactive')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-text-muted">{format(new Date(cat.createdAt), 'MMM d, yyyy')}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditTarget(cat)}
                            className="inline-flex items-center justify-center rounded-md p-1.5 text-text-muted hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(cat.id)}
                            className="inline-flex items-center justify-center rounded-md p-1.5 text-text-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      <CategoryFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={(data) => createCategory.mutateAsync(data).then(() => setShowCreateModal(false))}
        isLoading={createCategory.isPending}
        title={t('fileCategories.createTitle')}
      />

      {/* Edit Modal */}
      {editTarget && (
        <CategoryFormModal
          isOpen={!!editTarget}
          onClose={() => setEditTarget(null)}
          onSubmit={(data) => updateCategory.mutateAsync({ id: editTarget.id, data }).then(() => setEditTarget(null))}
          isLoading={updateCategory.isPending}
          title={t('fileCategories.editTitle')}
          defaultValues={editTarget}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t('fileCategories.deleteTitle')}
        description={t('fileCategories.deleteDescription')}
        confirmLabel={t('common.delete')}
        isLoading={deleteCategory.isPending}
      />
    </div>
  );
}

// ─── Category Form Modal ───

function CategoryFormModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  title,
  defaultValues,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { nameAr: string; nameEn: string; nameKu: string }) => Promise<unknown>;
  isLoading: boolean;
  title: string;
  defaultValues?: { nameAr: string; nameEn: string; nameKu: string };
}) {
  const { t } = useTranslation();
  const [nameAr, setNameAr] = useState(defaultValues?.nameAr ?? '');
  const [nameEn, setNameEn] = useState(defaultValues?.nameEn ?? '');
  const [nameKu, setNameKu] = useState(defaultValues?.nameKu ?? '');

  const canSubmit = nameAr.trim() && nameEn.trim() && nameKu.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({ nameAr: nameAr.trim(), nameEn: nameEn.trim(), nameKu: nameKu.trim() });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-start gap-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 px-3 py-2.5">
          <Languages className="h-4 w-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
          <p className="text-xs text-blue-700 dark:text-blue-300">{t('fileCategories.multilingualHint')}</p>
        </div>

        <Input
          label={t('fileCategories.nameEn')}
          placeholder="e.g. Official Documents"
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
          required
        />
        <Input
          label={t('fileCategories.nameAr')}
          placeholder="مثال: الوثائق الرسمية"
          value={nameAr}
          onChange={(e) => setNameAr(e.target.value)}
          dir="rtl"
          required
        />
        <Input
          label={t('fileCategories.nameKu')}
          placeholder="بۆ نموونە: بەڵگەنامە فەرمییەکان"
          value={nameKu}
          onChange={(e) => setNameKu(e.target.value)}
          dir="rtl"
          required
        />

        <ModalFooter>
          <Button variant="secondary" type="button" onClick={onClose} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" isLoading={isLoading} disabled={!canSubmit}>
            {t('common.save')}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

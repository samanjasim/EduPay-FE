import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  File as FileIcon, Upload, Download, Trash2, Search, Filter, Eye, Shield,
  CloudUpload, FolderOpen,
} from 'lucide-react';
import {
  Card, CardContent, CardHeader, CardTitle,
  Badge, Spinner, Button, Input, Select, Pagination, Modal, ModalFooter,
} from '@/components/ui';
import { PageHeader, EmptyState, ConfirmModal } from '@/components/common';
import {
  useFiles, useUploadFile, useDeleteFile, useFileAccessLogs, useFileCategories,
} from '../api';
import { filesApi } from '../api';
import { ROUTES } from '@/config';
import { cn } from '@/utils';
import { format } from 'date-fns';
import type { FilePurpose } from '@/types';

type Tab = 'files' | 'audit';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const purposeVariant = (p: string) =>
  ({ StudentImport: 'info', Receipt: 'success', Report: 'warning', Avatar: 'default', Document: 'outline' } as const)[p] ?? 'default';

export default function FilesPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('files');

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'files', label: t('files.tabFiles'), icon: FileIcon },
    { key: 'audit', label: t('files.tabAudit'), icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('files.title')}
        subtitle={t('files.subtitle')}
        actions={
          <Link to={ROUTES.FILE_CATEGORIES}>
            <Button variant="secondary" size="sm" leftIcon={<FolderOpen className="h-4 w-4" />}>
              {t('files.manageCategories')}
            </Button>
          </Link>
        }
      />

      <div className="border-b border-border">
        <nav className="flex gap-0 -mb-px overflow-x-auto">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                'flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                activeTab === key
                  ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                  : 'border-transparent text-text-muted hover:text-text-primary hover:border-border'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'files' && <FilesTab />}
      {activeTab === 'audit' && <AuditTab />}
    </div>
  );
}

// ═══════════════════════════════════════════════
// FILES TAB
// ═══════════════════════════════════════════════

function FilesTab() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [purposeFilter, setPurposeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const { data: categories } = useFileCategories();
  const { data: filesData, isLoading } = useFiles({
    pageNumber: page,
    pageSize: 10,
    purpose: (purposeFilter || undefined) as FilePurpose | undefined,
    categoryId: categoryFilter || undefined,
    searchTerm: searchTerm || undefined,
  });
  const deleteFile = useDeleteFile();

  const files = filesData?.data ?? [];
  const pagination = filesData?.pagination;

  const purposeOptions = [
    { value: '', label: t('files.allPurposes') },
    { value: 'StudentImport', label: 'Student Import' },
    { value: 'Receipt', label: 'Receipt' },
    { value: 'Report', label: 'Report' },
    { value: 'Avatar', label: 'Avatar' },
    { value: 'Document', label: 'Document' },
  ];

  const categoryOptions = [
    { value: '', label: t('files.allCategories') },
    ...(categories ?? []).map((c) => ({ value: c.id, label: c.nameEn })),
  ];

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteFile.mutate(deleteTarget, { onSettled: () => setDeleteTarget(null) });
  };

  return (
    <div className="space-y-4">
      {/* Filters & Upload */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Filter className="h-4 w-4 text-text-muted shrink-0" />
            <div className="max-w-[220px] flex-1">
              <Input
                placeholder={t('files.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
            <Select options={purposeOptions} value={purposeFilter} onChange={(v) => { setPurposeFilter(v); setPage(1); }} className="max-w-[160px]" />
            <Select options={categoryOptions} value={categoryFilter} onChange={(v) => { setCategoryFilter(v); setPage(1); }} className="max-w-[180px]" />
            <div className="ml-auto">
              <Button onClick={() => setShowUploadModal(true)} leftIcon={<Upload className="h-4 w-4" />}>
                {t('files.upload')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Files Table */}
      <Card>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Spinner size="md" /></div>
          ) : files.length === 0 ? (
            <EmptyState icon={FileIcon} title={t('files.noFiles')} />
          ) : (
            <>
              <div className="-mx-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 pb-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">{t('files.name')}</th>
                      <th className="px-4 pb-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">{t('files.category')}</th>
                      <th className="px-4 pb-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">{t('files.size')}</th>
                      <th className="px-4 pb-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">{t('files.purpose')}</th>
                      <th className="px-4 pb-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">{t('files.uploadDate')}</th>
                      <th className="px-4 pb-3 text-end text-xs font-medium uppercase tracking-wide text-text-muted">{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {files.map((file) => (
                      <tr key={file.id} className="hover:bg-hover/50 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <FileIcon className="h-4 w-4 text-text-muted shrink-0" />
                            <div className="min-w-0">
                              <p className="font-medium text-text-primary truncate max-w-[200px]">{file.name}</p>
                              <p className="text-xs text-text-muted">{file.contentType}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          {file.categoryNameEn
                            ? <Badge variant="outline" size="sm"><FolderOpen className="h-3 w-3 ltr:mr-1 rtl:ml-1" />{file.categoryNameEn}</Badge>
                            : <span className="text-xs text-text-muted">—</span>}
                        </td>
                        <td className="px-4 py-3.5 text-text-secondary">{formatFileSize(file.sizeBytes)}</td>
                        <td className="px-4 py-3.5"><Badge variant={purposeVariant(file.purpose)} size="sm">{file.purpose}</Badge></td>
                        <td className="px-4 py-3.5 text-text-muted">{format(new Date(file.createdAt), 'MMM d, yyyy')}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => filesApi.downloadFile(file.id, file.originalFileName)} className="inline-flex items-center justify-center rounded-md p-1.5 text-text-muted hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors">
                              <Download className="h-4 w-4" />
                            </button>
                            <button onClick={() => setDeleteTarget(file.id)} className="inline-flex items-center justify-center rounded-md p-1.5 text-text-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-4 flex justify-center"><Pagination currentPage={pagination.pageNumber} totalPages={pagination.totalPages} onPageChange={setPage} /></div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <UploadDialog isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} />

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t('files.deleteTitle')}
        description={t('files.deleteDescription')}
        confirmLabel={t('files.delete')}
        isLoading={deleteFile.isPending}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════
// UPLOAD DIALOG
// ═══════════════════════════════════════════════

function UploadDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadFile = useUploadFile();
  const { data: categories } = useFileCategories();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [purpose, setPurpose] = useState<FilePurpose>('Document');
  const [categoryId, setCategoryId] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const purposeOptions: { value: FilePurpose; label: string }[] = [
    { value: 'Document', label: 'Document' },
    { value: 'StudentImport', label: 'Student Import' },
    { value: 'Receipt', label: 'Receipt' },
    { value: 'Report', label: 'Report' },
    { value: 'Avatar', label: 'Avatar' },
  ];

  const categoryOptions = [
    { value: '', label: t('files.noCategory') },
    ...(categories ?? []).filter((c) => c.isActive).map((c) => ({ value: c.id, label: c.nameEn })),
  ];

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    if (!fileName) setFileName(file.name.split('.').slice(0, -1).join('.'));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleSubmit = () => {
    if (!selectedFile) return;
    uploadFile.mutate(
      { file: selectedFile, purpose, categoryId: categoryId || undefined },
      {
        onSuccess: () => {
          setSelectedFile(null);
          setFileName('');
          setPurpose('Document');
          setCategoryId('');
          onClose();
        },
      }
    );
  };

  const handleClose = () => {
    if (uploadFile.isPending) return;
    setSelectedFile(null);
    setFileName('');
    setPurpose('Document');
    setCategoryId('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('files.uploadTitle')} size="lg">
      <div className="space-y-5">
        {/* Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 cursor-pointer transition-all',
            isDragOver
              ? 'border-primary-400 bg-primary-50 dark:bg-primary-500/10'
              : selectedFile
                ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10'
                : 'border-border hover:border-primary-300 hover:bg-hover/50 dark:hover:border-primary-500/30'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
              e.target.value = '';
            }}
          />
          {selectedFile ? (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20 mb-3">
                <FileIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="font-medium text-text-primary">{selectedFile.name}</p>
              <p className="text-xs text-text-muted mt-1">{formatFileSize(selectedFile.size)} &middot; {selectedFile.type || 'Unknown type'}</p>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setFileName(''); }}
                className="mt-2 text-xs text-red-500 hover:text-red-700 font-medium"
              >
                {t('files.removeFile')}
              </button>
            </>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-500/20 mb-3">
                <CloudUpload className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <p className="font-medium text-text-primary">{t('files.dropZoneTitle')}</p>
              <p className="text-xs text-text-muted mt-1">{t('files.dropZoneHint')}</p>
            </>
          )}
        </div>

        {/* File Name (optional) */}
        <Input
          label={t('files.fileNameLabel')}
          placeholder={t('files.fileNamePlaceholder')}
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
        />
        <p className="text-xs text-text-muted -mt-3">{t('files.fileNameHint')}</p>

        {/* Purpose & Category side-by-side */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">{t('files.purpose')}</label>
            <Select
              options={purposeOptions}
              value={purpose}
              onChange={(v) => setPurpose(v as FilePurpose)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">
              {t('files.category')}
              <span className="text-text-muted font-normal ml-1">({t('files.optional')})</span>
            </label>
            <Select
              options={categoryOptions}
              value={categoryId}
              onChange={setCategoryId}
            />
          </div>
        </div>
      </div>

      <ModalFooter>
        <Button variant="secondary" onClick={handleClose} disabled={uploadFile.isPending}>
          {t('common.cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          isLoading={uploadFile.isPending}
          disabled={!selectedFile}
          leftIcon={<Upload className="h-4 w-4" />}
        >
          {t('files.uploadFile')}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

// ═══════════════════════════════════════════════
// AUDIT TAB
// ═══════════════════════════════════════════════

function AuditTab() {
  const { t } = useTranslation();
  const [selectedFileId, setSelectedFileId] = useState('');
  const [page, setPage] = useState(1);

  const { data: filesData } = useFiles({ pageSize: 100 });
  const { data: logsData, isLoading } = useFileAccessLogs({ fileId: selectedFileId, pageNumber: page, pageSize: 10 });

  const logs = logsData?.data ?? [];
  const pagination = logsData?.pagination;

  const fileOptions = [
    { value: '', label: t('files.selectFile') },
    ...(filesData?.data ?? []).map((f) => ({ value: f.id, label: f.originalFileName })),
  ];

  const accessTypeVariant = (type: string) =>
    ({ Download: 'info', View: 'default', Delete: 'error' } as const)[type] ?? 'default';

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <Eye className="h-4 w-4 text-text-muted shrink-0" />
            <Select options={fileOptions} value={selectedFileId} onChange={(v) => { setSelectedFileId(v); setPage(1); }} className="max-w-[320px]" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />{t('files.accessLogs')}</CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedFileId ? (
            <EmptyState icon={Eye} title={t('files.selectFileForLogs')} />
          ) : isLoading ? (
            <div className="flex justify-center py-8"><Spinner size="md" /></div>
          ) : logs.length === 0 ? (
            <EmptyState icon={Shield} title={t('files.noLogs')} />
          ) : (
            <>
              <div className="-mx-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 pb-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">{t('files.accessType')}</th>
                      <th className="px-4 pb-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">{t('files.accessedBy')}</th>
                      <th className="px-4 pb-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">{t('files.ipAddress')}</th>
                      <th className="px-4 pb-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">{t('files.date')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-hover/50 transition-colors">
                        <td className="px-4 py-3.5"><Badge variant={accessTypeVariant(log.accessType)} size="sm">{log.accessType}</Badge></td>
                        <td className="px-4 py-3.5 text-text-secondary">{log.accessedBy}</td>
                        <td className="px-4 py-3.5 text-text-muted font-mono text-xs">{log.ipAddress ?? '—'}</td>
                        <td className="px-4 py-3.5 text-text-muted">{format(new Date(log.createdAt), 'MMM d, yyyy HH:mm')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-4 flex justify-center"><Pagination currentPage={pagination.pageNumber} totalPages={pagination.totalPages} onPageChange={setPage} /></div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

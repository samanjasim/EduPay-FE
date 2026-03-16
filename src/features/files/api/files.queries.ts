import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { filesApi } from './files.api';
import { queryKeys } from '@/lib/query';
import type { FileListParams, FileAccessLogListParams, UploadFileData, CreateFileCategoryData, UpdateFileCategoryData } from '@/types';

export function useFiles(params?: FileListParams) {
  return useQuery({
    queryKey: queryKeys.files.list(params),
    queryFn: () => filesApi.getFiles(params),
    placeholderData: keepPreviousData,
  });
}

export function useFile(id: string) {
  return useQuery({
    queryKey: queryKeys.files.detail(id),
    queryFn: () => filesApi.getFileById(id),
    enabled: !!id,
  });
}

export function useFileAccessLogs(params: FileAccessLogListParams) {
  return useQuery({
    queryKey: [...queryKeys.files.accessLogs(params.fileId), params],
    queryFn: () => filesApi.getAccessLogs(params),
    enabled: !!params.fileId,
    placeholderData: keepPreviousData,
  });
}

export function useUploadFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UploadFileData) => filesApi.uploadFile(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.files.all }); toast.success('File uploaded'); },
  });
}

export function useDeleteFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => filesApi.deleteFile(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.files.all }); toast.success('File deleted'); },
  });
}

// ─── Categories ───

export function useFileCategories() {
  return useQuery({
    queryKey: ['file-categories'],
    queryFn: () => filesApi.getCategories(),
  });
}

export function useCreateFileCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFileCategoryData) => filesApi.createCategory(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['file-categories'] }); toast.success('Category created'); },
  });
}

export function useUpdateFileCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFileCategoryData }) => filesApi.updateCategory(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['file-categories'] }); toast.success('Category updated'); },
  });
}

export function useDeleteFileCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => filesApi.deleteCategory(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['file-categories'] }); toast.success('Category deleted'); },
  });
}

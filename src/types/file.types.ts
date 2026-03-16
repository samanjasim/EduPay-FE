// ─── Enums ───

export type FilePurpose = 'StudentImport' | 'Receipt' | 'Report' | 'Avatar' | 'Document';
export type FileAccessType = 'Download' | 'View' | 'Delete';

// ─── File Category (multilingual) ───

export interface FileCategoryDto {
  id: string;
  nameAr: string;
  nameEn: string;
  nameKu: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateFileCategoryData {
  nameAr: string;
  nameEn: string;
  nameKu: string;
}

export interface UpdateFileCategoryData {
  nameAr: string;
  nameEn: string;
  nameKu: string;
}

// ─── Response DTOs (match BE FileDto / FileAccessLogDto) ───

export interface FileDto {
  id: string;
  name: string;
  originalFileName: string;
  contentType: string;
  sizeBytes: number;
  uploadedBy: string;
  schoolId?: string | null;
  categoryId?: string | null;
  categoryNameEn?: string | null;
  purpose: FilePurpose;
  createdAt: string;
}

export interface FileAccessLogDto {
  id: string;
  fileId: string;
  accessedBy: string;
  accessType: FileAccessType;
  ipAddress?: string | null;
  createdAt: string;
}

// ─── Upload (match BE controller params) ───

export interface UploadFileData {
  file: File;
  purpose: FilePurpose;
  schoolId?: string;
  categoryId?: string;
}

// ─── Query Params (match BE GetFilesQuery) ───

export interface FileListParams {
  schoolId?: string;
  categoryId?: string;
  purpose?: FilePurpose;
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  sortDescending?: boolean;
}

// ─── Access Logs Query (match BE GetFileAccessLogsQuery) ───

export interface FileAccessLogListParams {
  fileId: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDescending?: boolean;
}

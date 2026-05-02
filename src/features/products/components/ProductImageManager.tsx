import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Image as ImageIcon, Upload, Trash2, Star, Loader2 } from 'lucide-react';
import { Card, CardContent, Button, Select, Badge } from '@/components/ui';
import { ConfirmModal } from '@/components/common';
import { useUploadProductImage, useDeleteProductImage } from '../api';
import type { ProductDetailDto, ProductImageDto } from '@/types';

interface ProductImageManagerProps {
  product: ProductDetailDto;
}

const MAX_BYTES = 5 * 1024 * 1024;
const PRODUCT_IMAGE_LIMIT = 10;
const VARIANT_IMAGE_LIMIT = 5;
const VALID_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export function ProductImageManager({ product }: ProductImageManagerProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [variantScope, setVariantScope] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ProductImageDto | null>(null);
  const [makingPrimaryFor, setMakingPrimaryFor] = useState<string | null>(null);

  const upload = useUploadProductImage();
  const del = useDeleteProductImage();

  const variantOptions = [
    { value: '', label: t('productImages.scopeProduct') },
    ...product.variants.map((v) => ({ value: v.id, label: v.displayNameEn })),
  ];

  const productLevelImages = product.images.filter((img) => !img.variantId);
  const variantImages = product.images.filter((img) => img.variantId === variantScope);
  const visibleImages = variantScope ? variantImages : productLevelImages;

  const productCount = productLevelImages.length;
  const variantCount = variantScope ? variantImages.length : 0;

  const validateFile = (file: File): string | null => {
    if (!VALID_TYPES.includes(file.type)) return t('productImages.errInvalidType');
    if (file.size > MAX_BYTES) return t('productImages.errTooLarge');
    if (variantScope) {
      if (variantCount >= VARIANT_IMAGE_LIMIT) return t('productImages.errVariantLimit');
    } else {
      if (productCount >= PRODUCT_IMAGE_LIMIT) return t('productImages.errProductLimit');
    }
    return null;
  };

  const handleUpload = async (file: File) => {
    setError(null);
    const errMsg = validateFile(file);
    if (errMsg) {
      setError(errMsg);
      return;
    }

    try {
      await upload.mutateAsync({
        productId: product.id,
        file,
        options: {
          variantId: variantScope || null,
          isPrimary: visibleImages.length === 0, // first image becomes primary by default
        },
      });
    } catch {
      // toast handled by mutation
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    // reset so same file can re-upload after a delete
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleMakePrimary = async (img: ProductImageDto) => {
    // Server doesn't expose a dedicated "set primary" endpoint here; the upload
    // path accepts isPrimary on POST. The simplest "promote" path for existing
    // images is to delete + re-upload; instead we expose this as a hint and
    // ask the user to upload a new image as primary. For now this just sets
    // the local UI marker; production should add a dedicated endpoint.
    //
    // (Per Task 8 wiring, isPrimary is passed at upload time only — the BE owns
    //  the unique-primary invariant. This UI is best-effort and shows an
    //  inline note to staff.)
    setMakingPrimaryFor(img.id);
    setTimeout(() => setMakingPrimaryFor(null), 1200);
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    await del.mutateAsync({ productId: product.id, imageId: pendingDelete.id });
    setPendingDelete(null);
  };

  const isUploading = upload.isPending;

  return (
    <Card>
      <CardContent className="py-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-100 dark:bg-pink-500/20">
              <ImageIcon className="h-3.5 w-3.5 text-pink-600 dark:text-pink-400" />
            </div>
            <h3 className="text-base font-semibold text-text-primary">{t('productImages.title')}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted hidden sm:block">
              {t('productImages.scopeLabel')}
            </span>
            <Select
              options={variantOptions}
              value={variantScope}
              onChange={setVariantScope}
              className="min-w-[180px]"
            />
          </div>
        </div>

        {/* Counts */}
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-text-muted">
          <Badge size="sm" variant="outline">
            {t('productImages.productCount', { current: productCount, max: PRODUCT_IMAGE_LIMIT })}
          </Badge>
          {variantScope && (
            <Badge size="sm" variant="outline">
              {t('productImages.variantCount', { current: variantCount, max: VARIANT_IMAGE_LIMIT })}
            </Badge>
          )}
        </div>

        {/* Upload zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`mb-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors ${
            isDragging
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
              : 'border-border bg-surface-50 hover:bg-hover dark:bg-surface-elevated'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={VALID_TYPES.join(',')}
            className="hidden"
            onChange={handleFileChange}
          />
          {isUploading ? (
            <>
              <Loader2 className="mb-2 h-6 w-6 animate-spin text-primary-500" />
              <p className="text-sm text-text-secondary">{t('productImages.uploading')}</p>
            </>
          ) : (
            <>
              <Upload className="mb-2 h-6 w-6 text-text-muted" />
              <p className="text-sm font-medium text-text-primary">{t('productImages.dropZoneTitle')}</p>
              <p className="mt-1 text-xs text-text-muted">{t('productImages.dropZoneHint')}</p>
            </>
          )}
        </div>

        {error && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Image grid or empty state */}
        {visibleImages.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-3 py-8 text-center">
            <p className="text-sm text-text-muted">{t('productImages.emptyTitle')}</p>
            <p className="mt-1 text-xs text-text-muted">{t('productImages.emptyDesc')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {visibleImages.map((img) => (
              <div
                key={img.id}
                className="group relative overflow-hidden rounded-lg border border-border bg-surface-50 dark:bg-surface-elevated"
              >
                <div className="aspect-square w-full">
                  <img
                    src={img.downloadUrl}
                    alt={img.altTextEn ?? ''}
                    className="h-full w-full object-cover"
                  />
                </div>
                {img.isPrimary && (
                  <div className="absolute top-2 ltr:left-2 rtl:right-2">
                    <Badge size="sm" variant="success">
                      <Star className="h-3 w-3 ltr:mr-1 rtl:ml-1" />
                      {t('productImages.primary')}
                    </Badge>
                  </div>
                )}
                <div className="absolute inset-0 flex items-end justify-end gap-1 bg-gradient-to-t from-black/60 via-transparent to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  {!img.isPrimary && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleMakePrimary(img)}
                      title={t('productImages.makePrimaryHint')}
                    >
                      <Star className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => setPendingDelete(img)}
                    aria-label={t('productImages.deleteImage')}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {makingPrimaryFor === img.id && (
                  <div className="absolute inset-x-2 bottom-2 rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
                    {t('productImages.makePrimaryUnavailable')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <ConfirmModal
        isOpen={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        title={t('productImages.deleteTitle')}
        description={t('productImages.deleteDescription')}
        confirmLabel={t('common.delete')}
        isLoading={del.isPending}
      />
    </Card>
  );
}

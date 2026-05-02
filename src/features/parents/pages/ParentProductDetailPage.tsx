import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { format } from 'date-fns';
import {
  Image as ImageIcon,
  Tag,
  Package,
  Wallet as WalletIcon,
  CreditCard,
  AlertTriangle,
  ShoppingBag,
  ChevronLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  Spinner,
  Badge,
  Button,
  Input,
} from '@/components/ui';
import { PageHeader, InfoField } from '@/components/common';
import {
  useParentProductDetail,
  useParentCheckout,
} from '@/features/products/api';
import { useParentChildren } from '@/features/parents/api';
import { useAuthStore } from '@/stores';
import { ROUTES } from '@/config';
import type {
  ProductDetailDto,
  ProductVariantDto,
  CheckoutPaymentMethod,
  CheckoutRequest,
} from '@/types';

// ─── Multilingual helpers ───

function pickName(p: ProductDetailDto, lang: string) {
  if (lang.startsWith('ar') && p.nameAr) return p.nameAr;
  if (lang.startsWith('ku') && p.nameKu) return p.nameKu;
  return p.nameEn;
}
function pickVariantLabel(v: ProductVariantDto, lang: string) {
  if (lang.startsWith('ar') && v.displayNameAr) return v.displayNameAr;
  if (lang.startsWith('ku') && v.displayNameKu) return v.displayNameKu;
  return v.displayNameEn;
}

// ─── Error message extractor ───
//
// The BE Result<T> shape returns { errors: [{ code, message }] } in the body
// for failed mutations. axios surfaces it on error.response.data. We extract
// the most actionable string we can find.
function extractCheckoutError(err: unknown, t: (k: string) => string): string {
  type ApiErr = {
    response?: { data?: { errors?: Array<{ code?: string; message?: string }> } };
    message?: string;
  };
  const e = err as ApiErr;
  const apiErrors = e?.response?.data?.errors;
  if (apiErrors && apiErrors.length > 0) {
    // Map a couple of high-signal codes to dedicated copy; fall back to the
    // raw message otherwise.
    const code = (apiErrors[0].code ?? '').toLowerCase();
    if (code.includes('insufficient')) return t('parentProducts.detail.errInsufficientBalance');
    if (code.includes('maxquantity') || code.includes('quantity'))
      return t('parentProducts.detail.errMaxQuantity');
    if (code.includes('currency')) return t('parentProducts.detail.errCurrencyMismatch');
    return apiErrors[0].message || t('parentProducts.detail.errGeneric');
  }
  return e?.message || t('parentProducts.detail.errGeneric');
}

/**
 * Parent self-service product detail + checkout.
 *
 * URL: `/parent/products/:id?childId=...`
 *
 *  - Reads childId from the query string. If missing, falls back to the
 *    parent's first linked child.
 *  - Renders hero image gallery, multilingual title/description, variant
 *    picker, quantity input, and payment method selector.
 *  - On submit: dispatches a checkout via `useParentCheckout`. Wallet success
 *    redirects to /parent/products/orders; gateway success redirects to the
 *    payment URL; alreadyPaid jumps straight to the result page.
 */
export default function ParentProductDetailPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'en';
  const navigate = useNavigate();
  const { id: productId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();

  const user = useAuthStore((s) => s.user);
  const parentUserId = user?.id ?? '';
  const { data: children } = useParentChildren(parentUserId);

  // Resolve active child: explicit query param wins; otherwise first linked child.
  const queryChildId = searchParams.get('childId') ?? '';
  const fallbackChildId = children && children.length > 0 ? children[0].studentId : '';
  const childId = queryChildId || fallbackChildId;

  const { data: product, isLoading } = useParentProductDetail(childId, productId ?? '');
  const checkoutMut = useParentCheckout();

  // Local UI state
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>('Wallet');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Derived
  const sortedVariants = useMemo(
    () =>
      (product?.variants ?? [])
        .filter((v) => v.status === 'Active')
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [product]
  );
  const productImages = useMemo(
    () => (product?.images ?? []).slice().sort((a, b) => a.sortOrder - b.sortOrder),
    [product]
  );

  // Auto-pick the first variant when loaded
  const effectiveVariantId =
    selectedVariantId ||
    (sortedVariants.length > 0 ? sortedVariants[0].id : '');
  const selectedVariant = sortedVariants.find((v) => v.id === effectiveVariantId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-md py-12 text-center">
        <h2 className="text-lg font-semibold text-text-primary">
          {t('parentProducts.detail.notFoundTitle')}
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          {t('parentProducts.detail.notFoundDesc')}
        </p>
        <Link
          to={ROUTES.PARENT_PRODUCTS.CATALOG}
          className="mt-4 inline-block"
        >
          <Button variant="secondary" leftIcon={<ChevronLeft className="h-4 w-4 ltr:block rtl:hidden" />}>
            {t('parentProducts.detail.backToCatalog')}
          </Button>
        </Link>
      </div>
    );
  }

  const heroImage = productImages[activeImageIdx];
  const title = pickName(product, lang);

  // BE caps quantity per purchase. Default to 1 if not set.
  const maxQty = product.maxQuantityPerPurchase ?? 99;

  const fmtPrice = (n: number) =>
    new Intl.NumberFormat(lang, {
      style: 'currency',
      currency: product.currency,
      maximumFractionDigits: 0,
    }).format(n);

  // ─── Checkout submit ───

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!childId) {
      setErrorMessage(t('parentProducts.detail.errNoChild'));
      return;
    }
    if (!effectiveVariantId) {
      setErrorMessage(t('parentProducts.detail.errNoVariant'));
      return;
    }
    if (!quantity || quantity < 1) {
      setErrorMessage(t('parentProducts.detail.errQuantityRequired'));
      return;
    }
    if (quantity > maxQty) {
      setErrorMessage(t('parentProducts.detail.errMaxQuantity'));
      return;
    }

    const payload: CheckoutRequest = {
      childId,
      items: [{ variantId: effectiveVariantId, quantity }],
      paymentMethod,
      clientIdempotencyKey: crypto.randomUUID(),
      ...(paymentMethod === 'Gateway' ? { gateway: 'ZainCash' } : {}),
    };

    try {
      const result = await checkoutMut.mutateAsync(payload);

      // already paid (idempotent re-submit) → straight to result page
      if (result.alreadyPaid) {
        navigate(
          `${ROUTES.PARENT_PRODUCTS.getResult(result.orderId)}?status=success`
        );
        return;
      }

      // gateway flow → redirect to the gateway-hosted payment page
      if (paymentMethod === 'Gateway' && result.paymentUrl) {
        window.location.href = result.paymentUrl;
        return;
      }

      // wallet flow → confirmation
      toast.success(t('parentProducts.detail.purchaseSuccess'));
      navigate(ROUTES.PARENT_PRODUCTS.ORDERS);
    } catch (err) {
      setErrorMessage(extractCheckoutError(err, t));
    }
  };

  const submitting = checkoutMut.isPending;
  const totalPrice = (selectedVariant?.finalPrice ?? 0) * quantity;

  return (
    <div className="space-y-4">
      <PageHeader
        backTo={ROUTES.PARENT_PRODUCTS.CATALOG}
        backLabel={t('parentProducts.detail.backToCatalog')}
      />

      <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
        {/* ─── Left: gallery + summary ─── */}
        <Card>
          <CardContent className="p-3">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-surface-100 dark:bg-surface-elevated">
              {heroImage ? (
                <img
                  src={heroImage.downloadUrl}
                  alt={heroImage.altTextEn ?? title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-text-muted" />
                </div>
              )}
            </div>
            {productImages.length > 1 && (
              <div className="mt-3 grid grid-cols-5 gap-2">
                {productImages.map((img, idx) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
                    className={`aspect-square overflow-hidden rounded-md border-2 transition-colors ${
                      idx === activeImageIdx
                        ? 'border-primary-500'
                        : 'border-transparent hover:border-border'
                    }`}
                    aria-label={t('parentProducts.detail.thumbnailAria', { index: idx + 1 })}
                  >
                    <img src={img.downloadUrl} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-3 px-2 py-4">
              <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" size="sm">
                  <Tag className="ltr:mr-1 rtl:ml-1 h-3 w-3" />
                  {t(`products.type${product.type}`)}
                </Badge>
              </div>
              {product.description && (
                <p className="text-sm leading-relaxed text-text-secondary">
                  {product.description}
                </p>
              )}

              <div className="grid gap-x-6 gap-y-2 pt-2 sm:grid-cols-2">
                {product.applicableGradeName && (
                  <InfoField label={t('products.grade')}>
                    {product.applicableGradeName}
                  </InfoField>
                )}
                {product.applicableSectionName && (
                  <InfoField label={t('products.section')}>
                    {product.applicableSectionName}
                  </InfoField>
                )}
                {product.availableUntil && (
                  <InfoField label={t('products.availableUntil')}>
                    {format(new Date(product.availableUntil), 'MMM d, yyyy')}
                  </InfoField>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ─── Right: checkout form ─── */}
        <Card>
          <CardContent className="py-5">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-text-muted" />
                <h2 className="text-base font-semibold text-text-primary">
                  {t('parentProducts.detail.checkoutTitle')}
                </h2>
              </div>

              {/* Variant picker */}
              {sortedVariants.length > 0 ? (
                <div>
                  <label className="mb-2 block text-sm font-medium text-text-primary">
                    {t('parentProducts.detail.variantLabel')}
                  </label>
                  <div className="space-y-2">
                    {sortedVariants.map((v) => {
                      const isSelected = v.id === effectiveVariantId;
                      return (
                        <button
                          type="button"
                          key={v.id}
                          onClick={() => setSelectedVariantId(v.id)}
                          className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-start transition-colors ${
                            isSelected
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                              : 'border-border bg-surface hover:bg-hover/50'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-text-primary">
                              {pickVariantLabel(v, lang)}
                            </div>
                            {v.sku && (
                              <div className="mt-0.5 text-xs text-text-muted">
                                {v.sku}
                              </div>
                            )}
                          </div>
                          <div className="text-sm font-semibold text-text-primary">
                            {fmtPrice(v.finalPrice)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                  {t('parentProducts.detail.noVariants')}
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-primary">
                  {t('parentProducts.detail.quantityLabel')}
                </label>
                <Input
                  type="number"
                  min={1}
                  max={maxQty}
                  value={quantity}
                  onChange={(e) => {
                    const next = parseInt(e.target.value, 10);
                    setQuantity(Number.isNaN(next) ? 1 : next);
                  }}
                />
                {product.maxQuantityPerPurchase != null && (
                  <p className="mt-1 text-xs text-text-muted">
                    {t('parentProducts.detail.quantityHint', {
                      max: product.maxQuantityPerPurchase,
                    })}
                  </p>
                )}
              </div>

              {/* Payment method */}
              <div>
                <label className="mb-2 block text-sm font-medium text-text-primary">
                  {t('parentProducts.detail.paymentMethodLabel')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Wallet')}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                      paymentMethod === 'Wallet'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                        : 'border-border bg-surface hover:bg-hover/50'
                    }`}
                  >
                    <WalletIcon className="h-4 w-4" />
                    <span className="font-medium">
                      {t('parentProducts.detail.payWallet')}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Gateway')}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                      paymentMethod === 'Gateway'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                        : 'border-border bg-surface hover:bg-hover/50'
                    }`}
                  >
                    <CreditCard className="h-4 w-4" />
                    <span className="font-medium">
                      {t('parentProducts.detail.payGateway')}
                    </span>
                  </button>
                </div>

                {paymentMethod === 'Gateway' && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-text-muted">
                    <span>{t('parentProducts.detail.gatewayHint')}:</span>
                    <Badge variant="outline" size="sm">
                      ZainCash
                    </Badge>
                  </div>
                )}
              </div>

              {/* Error inline */}
              {errorMessage && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Total */}
              {selectedVariant && (
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <span className="text-sm text-text-muted">
                    {t('parentProducts.detail.totalLabel')}
                  </span>
                  <span className="text-xl font-bold text-text-primary">
                    {fmtPrice(totalPrice)}
                  </span>
                </div>
              )}

              <Button
                type="submit"
                isLoading={submitting}
                disabled={submitting || sortedVariants.length === 0 || !childId}
                leftIcon={<ShoppingBag className="h-4 w-4" />}
                className="w-full"
              >
                {t('parentProducts.detail.buyNow')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

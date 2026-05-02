import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  Package,
  CreditCard,
  Check,
  Search,
  Coins,
  Wallet as WalletIcon,
  Plus,
  ExternalLink,
} from 'lucide-react';
import {
  Card,
  CardContent,
  Button,
  Input,
  Select,
  Spinner,
  Textarea,
  Badge,
} from '@/components/ui';
import { useStudents, useStudent } from '@/features/students/api';
import { useParents } from '@/features/parents/api';
import { useProductSummaries, useProductDetail, useRecordManualPurchase } from '../api';
import { useDebounce, useUserRole } from '@/hooks';
import { useUIStore } from '@/stores/ui.store';
import { ROUTES } from '@/config';
import type {
  ProductSummaryDto,
  ProductDetailDto,
  ProductVariantDto,
  ManualPurchasePaymentSource,
  ManualPurchasePayerType,
  ProductCheckoutResultDto,
} from '@/types';

interface ManualPurchaseFormProps {
  /** Optional school context override; otherwise pulled from active school. */
  schoolId?: string;
  /** Pre-select a student (e.g. when launched from a student page). */
  presetStudentId?: string;
}

// ─── Localized name helpers ───

function pickProductName(p: ProductSummaryDto | ProductDetailDto, lang: string) {
  if (lang.startsWith('ar') && p.nameAr) return p.nameAr;
  if (lang.startsWith('ku') && p.nameKu) return p.nameKu;
  return p.nameEn;
}
function pickVariantLabel(v: ProductVariantDto, lang: string) {
  if (lang.startsWith('ar') && v.displayNameAr) return v.displayNameAr;
  if (lang.startsWith('ku') && v.displayNameKu) return v.displayNameKu;
  return v.displayNameEn;
}

// ─── Steps ───

type Step = 'student' | 'product' | 'payment' | 'review' | 'done';

/**
 * Multi-step manual purchase form.
 *
 *  1. Student     — autocomplete search within the active school.
 *  2. Product     — pick a product, then a variant + quantity.
 *  3. Payment     — payer type + payment source. CashCollector role gets cash-only.
 *  4. Review      — confirm and submit. Generates a fresh client idempotency key.
 *  5. Done        — receipt link + "Record another" reset.
 *
 * Server-side enforces the same constraints (max qty, role allowlists). This
 * form is the friendly UX layer on top.
 */
export function ManualPurchaseForm({
  schoolId,
  presetStudentId,
}: ManualPurchaseFormProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'en';
  const role = useUserRole();
  const activeSchoolId = useUIStore((s) => s.activeSchoolId);
  const effectiveSchoolId = schoolId ?? activeSchoolId ?? '';

  // CashCollector is cash-only — wallet options are hidden DOM-side.
  const isCashCollector = role.hasRole('CashCollector');

  const [step, setStep] = useState<Step>('student');

  // ── Student picker ──
  const [studentId, setStudentId] = useState<string>(presetStudentId ?? '');
  const [studentSearch, setStudentSearch] = useState('');
  const debouncedStudentSearch = useDebounce(studentSearch, 250);

  const { data: studentsData, isLoading: studentsLoading } = useStudents({
    pageSize: 20,
    ...(debouncedStudentSearch ? { searchTerm: debouncedStudentSearch } : {}),
  });
  const students = studentsData?.data ?? [];
  const selectedStudent = students.find((s) => s.id === studentId);

  // ── Product picker ──
  const [productId, setProductId] = useState<string>('');
  const [productSearch, setProductSearch] = useState('');
  const debouncedProductSearch = useDebounce(productSearch, 250);

  const { data: productsData, isLoading: productsLoading } = useProductSummaries({
    schoolId: effectiveSchoolId,
    status: 'Active',
    pageSize: 20,
    ...(debouncedProductSearch ? { searchTerm: debouncedProductSearch } : {}),
  });
  const products = productsData?.data ?? [];

  const { data: productDetail, isLoading: productDetailLoading } =
    useProductDetail(productId);

  const variants = useMemo(
    () => (productDetail?.variants ?? []).filter((v) => v.status === 'Active'),
    [productDetail]
  );

  // ── Variant + quantity ──
  // Auto-select the only variant if there's exactly one. We compute the
  // effective variant id during render (rather than syncing in an effect) to
  // keep the React Compiler / `react-hooks/set-state-in-effect` rule happy.
  const [explicitVariantId, setExplicitVariantId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const variantId =
    explicitVariantId ||
    (variants.length === 1 ? variants[0].id : '');
  const setVariantId = setExplicitVariantId;
  const selectedVariant = variants.find((v) => v.id === variantId);
  const maxPerPurchase = productDetail?.maxQuantityPerPurchase ?? null;
  const exceedsMaxQty =
    maxPerPurchase != null && quantity > maxPerPurchase;

  // ── Payment ──
  const [payerType, setPayerType] = useState<ManualPurchasePayerType>('Parent');
  const [rawPaymentSource, setRawPaymentSource] =
    useState<ManualPurchasePaymentSource>('Cash');
  // CashCollector is cash-only — collapse any other selection to 'Cash' at
  // render time. Doing this as a derived value (rather than syncing in an
  // effect) avoids cascading renders.
  const paymentSource: ManualPurchasePaymentSource = isCashCollector
    ? 'Cash'
    : rawPaymentSource;
  const setPaymentSource = setRawPaymentSource;
  const [payerUserId, setPayerUserId] = useState<string>('');
  const [parentSearch, setParentSearch] = useState('');
  const debouncedParentSearch = useDebounce(parentSearch, 250);

  // Parent picker is needed whenever the payer is the Parent — the BE
  // requires a known PayerUserId for both Cash-from-Parent and ParentWallet
  // (domain invariant: ProductPurchaseRecord with paidByType=Parent must have
  // a non-null PaidByUserId). Without the picker, "Cash from Parent" submits
  // with no user id and the BE rejects with "Parent payer must have a known
  // user id." (finding I7).
  const needsParentPicker = payerType === 'Parent';

  // Two parallel sources of "candidate parents" depending on caller role:
  //
  //   1. For roles WITH `Students.ManageParents` (SchoolAdmin, SuperAdmin) we
  //      hit the school-scoped /Parents search so the picker can browse any
  //      parent. We only fire this when actually needed (payer=Parent).
  //   2. For roles WITHOUT that permission (CashCollector, StoreStaff) we
  //      fall back to the parents already linked to the selected student,
  //      which the StudentDto returns to anyone with `Students.View`.
  //
  // The selected-student parents are always included regardless of role —
  // they're the most likely candidates for "cash from THIS student's parent".
  const { data: parentsData } = useParents({
    pageSize: 20,
    ...(debouncedParentSearch ? { searchTerm: debouncedParentSearch } : {}),
  });
  const { data: studentDetail } = useStudent(studentId);
  type ParentOption = {
    parentUserId: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  const studentParents = useMemo<ParentOption[]>(() => {
    const linked = studentDetail?.parents ?? [];
    return linked.map((p) => {
      const [firstName, ...rest] = (p.parentName ?? '').split(' ');
      return {
        parentUserId: p.parentUserId,
        firstName: firstName ?? '',
        lastName: rest.join(' '),
        // No email available on the linked-parent dto; show the relation
        // ("Father"/"Mother"/"Guardian") in the slot the picker uses for the
        // secondary line.
        email: (p.relation as string) ?? '',
      };
    });
  }, [studentDetail]);
  // Merge sources, deduping by parentUserId. Linked parents come first so
  // they're always discoverable even when /Parents search is empty/forbidden.
  const parents = useMemo<ParentOption[]>(() => {
    const merged: ParentOption[] = [...studentParents];
    const seen = new Set(studentParents.map((p) => p.parentUserId));
    for (const p of parentsData?.data ?? []) {
      if (!seen.has(p.parentUserId)) {
        merged.push({
          parentUserId: p.parentUserId,
          firstName: p.firstName ?? '',
          lastName: p.lastName ?? '',
          email: p.email ?? '',
        });
        seen.add(p.parentUserId);
      }
    }
    return merged;
  }, [studentParents, parentsData]);

  // ── Note ──
  const [note, setNote] = useState('');

  // ── Idempotency + result ──
  const [idempotencyKey, setIdempotencyKey] = useState<string>(() =>
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );

  const [result, setResult] = useState<ProductCheckoutResultDto | null>(null);
  const recordPurchase = useRecordManualPurchase();

  // ── Step gating ──
  const canAdvanceFromStudent = !!studentId;
  const canAdvanceFromProduct =
    !!productId && !!variantId && quantity >= 1 && !exceedsMaxQty;
  const canAdvanceFromPayment =
    !!payerType &&
    !!paymentSource &&
    (!needsParentPicker || !!payerUserId);

  const totalAmount =
    selectedVariant && quantity ? selectedVariant.finalPrice * quantity : 0;
  const currency = selectedVariant?.currency ?? productDetail?.currency ?? '';

  // ── Submit ──
  const handleSubmit = async () => {
    if (!studentId || !variantId || !payerType || !paymentSource) return;
    try {
      const r = await recordPurchase.mutateAsync({
        studentId,
        items: [{ variantId, quantity }],
        payerType,
        paymentSource,
        payerUserId: needsParentPicker ? payerUserId : undefined,
        clientIdempotencyKey: idempotencyKey,
        ...(note.trim() ? { note: note.trim() } : {}),
      });
      setResult(r);
      setStep('done');
    } catch {
      // toast handled in mutation
    }
  };

  // ── Reset for "Record another" ──
  const handleReset = () => {
    setStep('student');
    setStudentId(presetStudentId ?? '');
    setStudentSearch('');
    setProductId('');
    setProductSearch('');
    setVariantId('');
    setQuantity(1);
    setPayerType('Parent');
    setPaymentSource('Cash');
    setPayerUserId('');
    setParentSearch('');
    setNote('');
    setResult(null);
    setIdempotencyKey(
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    );
  };

  // ── Render ──

  const stepIndex = (['student', 'product', 'payment', 'review'] as Step[]).indexOf(step);

  return (
    <div className="space-y-4">
      {/* Stepper */}
      {step !== 'done' && (
        <Card>
          <CardContent className="py-3">
            <div className="flex items-center justify-between gap-2 text-sm">
              {(['student', 'product', 'payment', 'review'] as const).map((s, idx) => {
                const isActive = step === s;
                const isComplete = idx < stepIndex;
                return (
                  <div
                    key={s}
                    className={`flex flex-1 items-center gap-2 ${
                      isActive
                        ? 'text-primary-600 font-semibold'
                        : isComplete
                          ? 'text-text-primary'
                          : 'text-text-muted'
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs ${
                        isActive
                          ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-500/20 dark:text-primary-300'
                          : isComplete
                            ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                            : 'border-border bg-surface'
                      }`}
                    >
                      {isComplete ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                    </span>
                    <span className="hidden truncate sm:inline">
                      {t(`productPurchases.manual.step${s.charAt(0).toUpperCase() + s.slice(1)}`)}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 1 — Student */}
      {step === 'student' && (
        <Card>
          <CardContent className="space-y-4 py-5">
            <SectionHeading
              icon={<UserIcon className="h-5 w-5 text-primary-600" />}
              title={t('productPurchases.manual.studentTitle')}
              subtitle={t('productPurchases.manual.studentSubtitle')}
            />
            <Input
              placeholder={t('productPurchases.manual.studentSearchPlaceholder')}
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
            {studentsLoading ? (
              <div className="flex justify-center py-6">
                <Spinner size="md" />
              </div>
            ) : students.length === 0 ? (
              <p className="py-6 text-center text-sm text-text-muted">
                {t('productPurchases.manual.noStudents')}
              </p>
            ) : (
              <div className="grid max-h-72 gap-1 overflow-y-auto">
                {students.map((s) => {
                  const isSelected = s.id === studentId;
                  return (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => setStudentId(s.id)}
                      className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-start transition-colors ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                          : 'border-border hover:bg-hover/50'
                      }`}
                    >
                      <div>
                        <div className="font-medium text-text-primary">
                          {s.fullNameEn || s.fullNameAr}
                        </div>
                        <div className="text-xs text-text-muted">
                          {s.studentCode} · {s.gradeName}
                          {s.sectionName ? ` · ${s.sectionName}` : ''}
                        </div>
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-primary-600" />}
                    </button>
                  );
                })}
              </div>
            )}
            <FormNav
              onNext={() => setStep('product')}
              nextDisabled={!canAdvanceFromStudent}
            />
          </CardContent>
        </Card>
      )}

      {/* Step 2 — Product + variant + quantity */}
      {step === 'product' && (
        <Card>
          <CardContent className="space-y-4 py-5">
            <SectionHeading
              icon={<Package className="h-5 w-5 text-primary-600" />}
              title={t('productPurchases.manual.productTitle')}
              subtitle={t('productPurchases.manual.productSubtitle')}
            />

            <Input
              placeholder={t('productPurchases.manual.productSearchPlaceholder')}
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />

            {productsLoading ? (
              <div className="flex justify-center py-6">
                <Spinner size="md" />
              </div>
            ) : products.length === 0 ? (
              <p className="py-6 text-center text-sm text-text-muted">
                {t('productPurchases.manual.noProducts')}
              </p>
            ) : (
              <div className="grid max-h-72 gap-1 overflow-y-auto">
                {products.map((p) => {
                  const isSelected = p.id === productId;
                  return (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => {
                        setProductId(p.id);
                        setVariantId('');
                        setQuantity(1);
                      }}
                      className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-start transition-colors ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                          : 'border-border hover:bg-hover/50'
                      }`}
                    >
                      <div>
                        <div className="font-medium text-text-primary">
                          {pickProductName(p, lang)}
                        </div>
                        <div className="text-xs text-text-muted">
                          {t(`products.type${p.type}`)} ·{' '}
                          {p.minPrice === p.maxPrice
                            ? `${p.minPrice.toLocaleString()} ${p.currency}`
                            : `${p.minPrice.toLocaleString()}–${p.maxPrice.toLocaleString()} ${p.currency}`}
                        </div>
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-primary-600" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Variant + quantity once a product is selected */}
            {productId && (
              <div className="space-y-3 border-t border-border pt-4">
                {productDetailLoading ? (
                  <div className="flex justify-center py-3">
                    <Spinner size="sm" />
                  </div>
                ) : variants.length === 0 ? (
                  <p className="text-sm text-text-muted">
                    {t('productPurchases.manual.noVariants')}
                  </p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Select
                      label={t('productPurchases.manual.variantLabel')}
                      options={variants.map((v) => ({
                        value: v.id,
                        label: `${pickVariantLabel(v, lang)} — ${v.finalPrice.toLocaleString()} ${v.currency}`,
                      }))}
                      value={variantId}
                      onChange={setVariantId}
                      placeholder={t('productPurchases.manual.variantPlaceholder')}
                    />
                    <Input
                      label={t('productPurchases.manual.quantityLabel')}
                      type="number"
                      min={1}
                      max={maxPerPurchase ?? undefined}
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.max(1, Number(e.target.value || 1)))
                      }
                      hint={
                        maxPerPurchase != null
                          ? t('productPurchases.manual.quantityHintMax', {
                              max: maxPerPurchase,
                            })
                          : undefined
                      }
                      error={
                        exceedsMaxQty
                          ? t('productPurchases.manual.quantityExceedsMax', {
                              max: maxPerPurchase,
                            })
                          : undefined
                      }
                    />
                  </div>
                )}
                {selectedVariant && quantity > 0 && !exceedsMaxQty && (
                  <div className="rounded-lg border border-border bg-surface px-3 py-2 text-sm">
                    <span className="text-text-muted">
                      {t('productPurchases.manual.subtotal')}:{' '}
                    </span>
                    <span className="font-semibold text-text-primary">
                      {totalAmount.toLocaleString()} {currency}
                    </span>
                  </div>
                )}
              </div>
            )}

            <FormNav
              onBack={() => setStep('student')}
              onNext={() => setStep('payment')}
              nextDisabled={!canAdvanceFromProduct}
            />
          </CardContent>
        </Card>
      )}

      {/* Step 3 — Payment */}
      {step === 'payment' && (
        <Card>
          <CardContent className="space-y-4 py-5">
            <SectionHeading
              icon={<CreditCard className="h-5 w-5 text-primary-600" />}
              title={t('productPurchases.manual.paymentTitle')}
              subtitle={t('productPurchases.manual.paymentSubtitle')}
            />

            {/* Payer type — Parent vs Student */}
            <div>
              <p className="mb-2 text-sm font-medium text-text-primary">
                {t('productPurchases.manual.payerLabel')}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(['Parent', 'Student'] as ManualPurchasePayerType[]).map((pt) => {
                  const selected = payerType === pt;
                  return (
                    <button
                      type="button"
                      key={pt}
                      onClick={() => {
                        setPayerType(pt);
                        // If we switch to Student, clear ParentWallet (illegal combo).
                        if (pt === 'Student' && paymentSource === 'ParentWallet') {
                          setPaymentSource('Cash');
                          setPayerUserId('');
                        }
                      }}
                      className={`rounded-lg border px-3 py-3 text-start transition-colors ${
                        selected
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                          : 'border-border hover:bg-hover/50'
                      }`}
                    >
                      <div className="font-medium text-text-primary">
                        {t(`productPurchases.manual.payer${pt}`)}
                      </div>
                      <div className="text-xs text-text-muted">
                        {t(`productPurchases.manual.payer${pt}Hint`)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment source — role-aware */}
            <div>
              <p className="mb-2 text-sm font-medium text-text-primary">
                {t('productPurchases.manual.sourceLabel')}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                <SourceTile
                  active={paymentSource === 'Cash'}
                  icon={<Coins className="h-4 w-4" />}
                  label={
                    payerType === 'Parent'
                      ? t('productPurchases.manual.sourceCashFromParent')
                      : t('productPurchases.manual.sourceCashFromStudent')
                  }
                  hint={t('productPurchases.manual.sourceCashHint')}
                  onClick={() => setPaymentSource('Cash')}
                />
                {/* Wallet options: hidden DOM-side for CashCollector */}
                {!isCashCollector && payerType === 'Parent' && (
                  <SourceTile
                    active={paymentSource === 'ParentWallet'}
                    icon={<WalletIcon className="h-4 w-4" />}
                    label={t('productPurchases.manual.sourceParentWallet')}
                    hint={t('productPurchases.manual.sourceParentWalletHint')}
                    onClick={() => setPaymentSource('ParentWallet')}
                  />
                )}
                {!isCashCollector && payerType === 'Student' && (
                  <SourceTile
                    active={paymentSource === 'StudentWallet'}
                    icon={<WalletIcon className="h-4 w-4" />}
                    label={t('productPurchases.manual.sourceStudentWallet')}
                    hint={t('productPurchases.manual.sourceStudentWalletHint')}
                    onClick={() => setPaymentSource('StudentWallet')}
                  />
                )}
              </div>
            </div>

            {/* Parent picker when paying from a parent wallet */}
            {needsParentPicker && (
              <div className="space-y-2 rounded-lg border border-border bg-surface px-3 py-3">
                <p className="text-sm font-medium text-text-primary">
                  {t('productPurchases.manual.parentPickerLabel')}
                </p>
                <Input
                  placeholder={t('productPurchases.manual.parentPickerSearch')}
                  value={parentSearch}
                  onChange={(e) => setParentSearch(e.target.value)}
                  leftIcon={<Search className="h-4 w-4" />}
                />
                <div className="grid max-h-56 gap-1 overflow-y-auto">
                  {parents.length === 0 ? (
                    <p className="py-3 text-center text-sm text-text-muted">
                      {t('productPurchases.manual.parentPickerEmpty')}
                    </p>
                  ) : (
                    parents.map((p) => {
                      const isSelected = p.parentUserId === payerUserId;
                      return (
                        <button
                          type="button"
                          key={p.parentUserId}
                          onClick={() => setPayerUserId(p.parentUserId)}
                          className={`flex items-center justify-between rounded-md border px-3 py-2 text-start text-sm transition-colors ${
                            isSelected
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                              : 'border-border hover:bg-hover/50'
                          }`}
                        >
                          <div>
                            <div className="font-medium text-text-primary">
                              {[p.firstName, p.lastName].filter(Boolean).join(' ') ||
                                p.email}
                            </div>
                            <div className="text-xs text-text-muted">{p.email}</div>
                          </div>
                          {isSelected && <Check className="h-4 w-4 text-primary-600" />}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Optional note */}
            <Textarea
              label={t('productPurchases.manual.noteLabel')}
              placeholder={t('productPurchases.manual.notePlaceholder')}
              maxLength={500}
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              hint={t('productPurchases.manual.noteHint', {
                count: note.length,
                max: 500,
              })}
            />

            <FormNav
              onBack={() => setStep('product')}
              onNext={() => setStep('review')}
              nextDisabled={!canAdvanceFromPayment}
            />
          </CardContent>
        </Card>
      )}

      {/* Step 4 — Review */}
      {step === 'review' && productDetail && selectedVariant && (
        <Card>
          <CardContent className="space-y-4 py-5">
            <SectionHeading
              icon={<Check className="h-5 w-5 text-primary-600" />}
              title={t('productPurchases.manual.reviewTitle')}
              subtitle={t('productPurchases.manual.reviewSubtitle')}
            />

            <div className="grid gap-3 rounded-lg border border-border bg-surface p-3 text-sm">
              <ReviewRow
                label={t('productPurchases.manual.studentLabel')}
                value={
                  selectedStudent
                    ? `${selectedStudent.fullNameEn} · ${selectedStudent.studentCode}`
                    : '—'
                }
              />
              <ReviewRow
                label={t('productPurchases.manual.productLabel')}
                value={pickProductName(productDetail, lang)}
              />
              <ReviewRow
                label={t('productPurchases.manual.variantLabel')}
                value={pickVariantLabel(selectedVariant, lang)}
              />
              <ReviewRow
                label={t('productPurchases.manual.quantityLabel')}
                value={String(quantity)}
              />
              <ReviewRow
                label={t('productPurchases.manual.payerLabel')}
                value={t(`productPurchases.manual.payer${payerType}`)}
              />
              <ReviewRow
                label={t('productPurchases.manual.sourceLabel')}
                value={t(`productPurchases.manual.source${paymentSource}`)}
              />
              {note && (
                <ReviewRow
                  label={t('productPurchases.manual.noteLabel')}
                  value={note}
                />
              )}
              <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
                <span className="text-text-muted">
                  {t('productPurchases.manual.total')}
                </span>
                <span className="text-lg font-semibold text-text-primary">
                  {totalAmount.toLocaleString()} {currency}
                </span>
              </div>
            </div>

            <FormNav
              onBack={() => setStep('payment')}
              onSubmit={handleSubmit}
              submitDisabled={recordPurchase.isPending}
              submitting={recordPurchase.isPending}
              submitLabel={t('productPurchases.manual.submitButton')}
            />
          </CardContent>
        </Card>
      )}

      {/* Step 5 — Done */}
      {step === 'done' && result && (
        <Card>
          <CardContent className="space-y-4 py-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/20">
              <Check className="h-8 w-8 text-green-700 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">
                {t('productPurchases.manual.successTitle')}
              </h3>
              <p className="mt-1 text-sm text-text-muted">
                {t('productPurchases.manual.successDescription')}
              </p>
              <p className="mt-3">
                <Badge variant="primary" size="md">
                  {t('productPurchases.manual.receiptNumber')}: {result.receiptNumber}
                </Badge>
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Link to={ROUTES.ORDERS.getDetail(result.orderId)}>
                <Button variant="secondary" leftIcon={<ExternalLink className="h-4 w-4" />}>
                  {t('productPurchases.manual.viewOrder')}
                </Button>
              </Link>
              <Button leftIcon={<Plus className="h-4 w-4" />} onClick={handleReset}>
                {t('productPurchases.manual.recordAnother')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Subcomponents ───

function SectionHeading({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5">{icon}</div>
      <div>
        <h2 className="text-base font-semibold text-text-primary">{title}</h2>
        {subtitle && (
          <p className="text-sm text-text-secondary">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function FormNav({
  onBack,
  onNext,
  onSubmit,
  nextDisabled = false,
  submitDisabled = false,
  submitting = false,
  submitLabel,
}: {
  onBack?: () => void;
  onNext?: () => void;
  onSubmit?: () => void;
  nextDisabled?: boolean;
  submitDisabled?: boolean;
  submitting?: boolean;
  submitLabel?: string;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between gap-2 border-t border-border pt-4">
      <div>
        {onBack && (
          <Button
            type="button"
            variant="ghost"
            leftIcon={<ChevronLeft className="h-4 w-4 rtl:rotate-180" />}
            onClick={onBack}
          >
            {t('productPurchases.manual.back')}
          </Button>
        )}
      </div>
      <div>
        {onSubmit ? (
          <Button
            type="button"
            onClick={onSubmit}
            disabled={submitDisabled}
            isLoading={submitting}
          >
            {submitLabel ?? t('productPurchases.manual.submitButton')}
          </Button>
        ) : (
          onNext && (
            <Button
              type="button"
              onClick={onNext}
              disabled={nextDisabled}
              rightIcon={<ChevronRight className="h-4 w-4 rtl:rotate-180" />}
            >
              {t('productPurchases.manual.next')}
            </Button>
          )
        )}
      </div>
    </div>
  );
}

function SourceTile({
  active,
  icon,
  label,
  hint,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  hint?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-start gap-3 rounded-lg border px-3 py-3 text-start transition-colors ${
        active
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
          : 'border-border hover:bg-hover/50'
      }`}
    >
      <div className="mt-0.5 text-primary-600">{icon}</div>
      <div>
        <div className="font-medium text-text-primary">{label}</div>
        {hint && <div className="text-xs text-text-muted">{hint}</div>}
      </div>
    </button>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-text-muted">{label}</span>
      <span className="text-end font-medium text-text-primary">{value}</span>
    </div>
  );
}

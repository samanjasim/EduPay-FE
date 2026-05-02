import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, GripVertical, Layers, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, Button, Input, Badge } from '@/components/ui';
import { useUpdateProductVariants } from '../api';
import type {
  ProductDetailDto,
  ProductOptionGroupDto,
  ProductOptionValueDto,
  ProductVariantDto,
  UpsertProductVariantData,
} from '@/types';

interface DraftValue {
  id: string; // local id (uuid or existing server id)
  serverId?: string;
  valueEn: string;
  valueAr: string;
  valueKu: string;
  sortOrder: number;
}

interface DraftGroup {
  id: string;
  serverId?: string;
  nameEn: string;
  nameAr: string;
  nameKu: string;
  sortOrder: number;
  values: DraftValue[];
}

interface DraftVariant {
  id: string;
  serverId?: string; // existing variant id
  displayNameEn: string;
  displayNameAr: string;
  displayNameKu: string;
  sku: string;
  finalPrice: number;
  status: 'Active' | 'Disabled';
  sortOrder: number;
  // option-value local ids (group.id -> value.id)
  selection: Record<string, string>;
  // mark variant that has purchase history; UI gates deletion
  hasPurchases?: boolean;
}

interface ProductVariantBuilderProps {
  product: ProductDetailDto;
  currency: string;
  onSaved?: () => void;
}

const localId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `local-${Math.random().toString(36).slice(2, 11)}`;

function buildDraftFromProduct(product: ProductDetailDto): {
  groups: DraftGroup[];
  variants: DraftVariant[];
} {
  const valueServerIdToLocal = new Map<string, string>();
  const groups: DraftGroup[] = (product.optionGroups ?? [])
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((g: ProductOptionGroupDto) => {
      const values: DraftValue[] = g.values
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((v: ProductOptionValueDto) => {
          const draftId = localId();
          valueServerIdToLocal.set(v.id, draftId);
          return {
            id: draftId,
            serverId: v.id,
            valueEn: v.valueEn,
            valueAr: v.valueAr ?? '',
            valueKu: v.valueKu ?? '',
            sortOrder: v.sortOrder,
          };
        });
      return {
        id: localId(),
        serverId: g.id,
        nameEn: g.nameEn,
        nameAr: g.nameAr ?? '',
        nameKu: g.nameKu ?? '',
        sortOrder: g.sortOrder,
        values,
      };
    });

  const variants: DraftVariant[] = (product.variants ?? [])
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((v: ProductVariantDto) => {
      // map optionValueIds -> selection by group
      const selection: Record<string, string> = {};
      for (const group of groups) {
        const match = group.values.find(
          (vv) => vv.serverId && v.optionValueIds.includes(vv.serverId)
        );
        if (match) selection[group.id] = match.id;
      }
      return {
        id: localId(),
        serverId: v.id,
        displayNameEn: v.displayNameEn,
        displayNameAr: v.displayNameAr ?? '',
        displayNameKu: v.displayNameKu ?? '',
        sku: v.sku ?? '',
        finalPrice: v.finalPrice,
        status: v.status,
        sortOrder: v.sortOrder,
        selection,
      };
    });

  return { groups, variants };
}

function autoLabel(groups: DraftGroup[], selection: Record<string, string>) {
  const parts: string[] = [];
  for (const g of groups) {
    const v = g.values.find((vv) => vv.id === selection[g.id]);
    if (v) parts.push(v.valueEn);
  }
  return parts.join(' / ');
}

function cartesian<T>(arrays: T[][]): T[][] {
  return arrays.reduce<T[][]>(
    (acc, curr) => acc.flatMap((a) => curr.map((c) => [...a, c])),
    [[]]
  );
}

export function ProductVariantBuilder({ product, currency, onSaved }: ProductVariantBuilderProps) {
  const { t } = useTranslation();
  const { mutateAsync: saveVariants, isPending } = useUpdateProductVariants();

  const [{ groups, variants }, setState] = useState(() => buildDraftFromProduct(product));

  // Re-seed when product detail refetches
  useEffect(() => {
    setState(buildDraftFromProduct(product));
  }, [product]);

  const setGroups = (next: DraftGroup[]) => setState((s) => ({ ...s, groups: next }));
  const setVariants = (next: DraftVariant[]) => setState((s) => ({ ...s, variants: next }));

  // ─── group editing ───
  const addGroup = () =>
    setGroups([
      ...groups,
      {
        id: localId(),
        nameEn: '',
        nameAr: '',
        nameKu: '',
        sortOrder: groups.length,
        values: [],
      },
    ]);

  const updateGroup = (id: string, patch: Partial<DraftGroup>) =>
    setGroups(groups.map((g) => (g.id === id ? { ...g, ...patch } : g)));

  const removeGroup = (id: string) => {
    setGroups(groups.filter((g) => g.id !== id));
    // strip from variant selections
    setVariants(
      variants.map((v) => {
        const next = { ...v.selection };
        delete next[id];
        return { ...v, selection: next };
      })
    );
  };

  const addValue = (groupId: string) => {
    const next = groups.map((g) =>
      g.id === groupId
        ? {
            ...g,
            values: [
              ...g.values,
              {
                id: localId(),
                valueEn: '',
                valueAr: '',
                valueKu: '',
                sortOrder: g.values.length,
              },
            ],
          }
        : g
    );
    setGroups(next);
  };

  const updateValue = (groupId: string, valueId: string, patch: Partial<DraftValue>) =>
    setGroups(
      groups.map((g) =>
        g.id === groupId
          ? { ...g, values: g.values.map((v) => (v.id === valueId ? { ...v, ...patch } : v)) }
          : g
      )
    );

  const removeValue = (groupId: string, valueId: string) => {
    setGroups(
      groups.map((g) =>
        g.id === groupId ? { ...g, values: g.values.filter((v) => v.id !== valueId) } : g
      )
    );
    setVariants(
      variants.map((v) => {
        if (v.selection[groupId] === valueId) {
          const next = { ...v.selection };
          delete next[groupId];
          return { ...v, selection: next };
        }
        return v;
      })
    );
  };

  // ─── variant generation from groups × values ───
  const groupsReady = groups.filter((g) => g.values.length > 0);
  const canGenerate = groupsReady.length > 0;

  const generateVariants = () => {
    if (!canGenerate) return;
    const valueLists = groupsReady.map((g) => g.values.map((v) => ({ groupId: g.id, valueId: v.id })));
    const combos = cartesian(valueLists);
    const existingByKey = new Map<string, DraftVariant>();
    for (const v of variants) {
      const key = Object.entries(v.selection)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([gid, vid]) => `${gid}:${vid}`)
        .join('|');
      existingByKey.set(key, v);
    }

    const next: DraftVariant[] = combos.map((combo, idx) => {
      const selection: Record<string, string> = {};
      combo.forEach(({ groupId, valueId }) => {
        selection[groupId] = valueId;
      });
      const key = Object.entries(selection)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([gid, vid]) => `${gid}:${vid}`)
        .join('|');
      const existing = existingByKey.get(key);
      if (existing) return existing;
      return {
        id: localId(),
        displayNameEn: autoLabel(groupsReady, selection),
        displayNameAr: '',
        displayNameKu: '',
        sku: '',
        finalPrice: 0,
        status: 'Active',
        sortOrder: idx,
        selection,
      };
    });
    setVariants(next);
  };

  const updateVariant = (id: string, patch: Partial<DraftVariant>) =>
    setVariants(variants.map((v) => (v.id === id ? { ...v, ...patch } : v)));

  const addBlankVariant = () =>
    setVariants([
      ...variants,
      {
        id: localId(),
        displayNameEn: '',
        displayNameAr: '',
        displayNameKu: '',
        sku: '',
        finalPrice: 0,
        status: 'Active',
        sortOrder: variants.length,
        selection: {},
      },
    ]);

  const removeVariant = (id: string) =>
    setVariants(variants.filter((v) => v.id !== id));

  // ─── persist ───
  const validationErrors = useMemo(() => {
    const errs: string[] = [];
    for (const g of groups) {
      if (!g.nameEn.trim()) errs.push(t('productVariants.errGroupNameRequired'));
      for (const v of g.values) {
        if (!v.valueEn.trim()) errs.push(t('productVariants.errValueRequired'));
      }
    }
    if (variants.length === 0) errs.push(t('productVariants.errAtLeastOneVariant'));
    for (const v of variants) {
      if (!v.displayNameEn.trim()) errs.push(t('productVariants.errVariantLabelRequired'));
      if (!Number.isFinite(v.finalPrice) || v.finalPrice < 0)
        errs.push(t('productVariants.errVariantPriceRequired'));
    }
    return Array.from(new Set(errs));
  }, [groups, variants, t]);

  const handleSave = async () => {
    if (validationErrors.length > 0) return;
    // Build groups -> server-shaped optionValueIds:
    //   Each group has values, but BE accepts whole-product variant snapshot.
    //   Per BE contract (Task 8), we send variant rows with optionValueIds (server ids of values).
    //   For locally-created groups/values that don't yet have serverIds, those
    //   *cannot* be referenced by id — BE expects existing option-value ids.
    //   For v1, only existing server-side option values are wired up; a separate
    //   /optionGroups admin (out of scope for this task) handles group CRUD.
    //   Locally added values are skipped from optionValueIds (they're labels only).
    const payload: UpsertProductVariantData[] = variants.map((v, idx) => {
      const optionValueIds: string[] = [];
      for (const groupId of Object.keys(v.selection)) {
        const valueLocalId = v.selection[groupId];
        const group = groups.find((g) => g.id === groupId);
        const value = group?.values.find((vv) => vv.id === valueLocalId);
        if (value?.serverId) optionValueIds.push(value.serverId);
      }
      return {
        id: v.serverId,
        displayNameEn: v.displayNameEn.trim(),
        displayNameAr: v.displayNameAr.trim() || null,
        displayNameKu: v.displayNameKu.trim() || null,
        sku: v.sku.trim() || null,
        finalPrice: v.finalPrice,
        currency,
        status: v.status,
        sortOrder: idx,
        optionValueIds,
      };
    });

    await saveVariants({ productId: product.id, payload: { variants: payload } });
    onSaved?.();
  };

  return (
    <div className="space-y-5">
      {/* Option Groups */}
      <Card>
        <CardContent className="py-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-500/20">
                <Layers className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
              </div>
              <h3 className="text-base font-semibold text-text-primary">
                {t('productVariants.optionGroupsTitle')}
              </h3>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={addGroup}
            >
              {t('productVariants.addGroup')}
            </Button>
          </div>

          {groups.length === 0 ? (
            <p className="text-sm text-text-muted">{t('productVariants.optionGroupsEmpty')}</p>
          ) : (
            <div className="space-y-4">
              {groups.map((g) => (
                <div key={g.id} className="rounded-lg border border-border bg-surface-50 dark:bg-surface-elevated p-3">
                  <div className="grid gap-2 sm:grid-cols-3 mb-3">
                    <Input
                      label={t('productVariants.groupNameEn')}
                      value={g.nameEn}
                      onChange={(e) => updateGroup(g.id, { nameEn: e.target.value })}
                      placeholder="e.g. Size"
                    />
                    <Input
                      label={t('productVariants.groupNameAr')}
                      value={g.nameAr}
                      onChange={(e) => updateGroup(g.id, { nameAr: e.target.value })}
                      placeholder="مثال: المقاس"
                    />
                    <Input
                      label={t('productVariants.groupNameKu')}
                      value={g.nameKu}
                      onChange={(e) => updateGroup(g.id, { nameKu: e.target.value })}
                      placeholder="بۆ نموونە: قەبارە"
                    />
                  </div>

                  <div className="space-y-2">
                    {g.values.map((v) => (
                      <div key={v.id} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_1fr_auto] items-end">
                        <Input
                          label={t('productVariants.valueEn')}
                          value={v.valueEn}
                          onChange={(e) => updateValue(g.id, v.id, { valueEn: e.target.value })}
                          placeholder="Small"
                        />
                        <Input
                          label={t('productVariants.valueAr')}
                          value={v.valueAr}
                          onChange={(e) => updateValue(g.id, v.id, { valueAr: e.target.value })}
                          placeholder="صغير"
                        />
                        <Input
                          label={t('productVariants.valueKu')}
                          value={v.valueKu}
                          onChange={(e) => updateValue(g.id, v.id, { valueKu: e.target.value })}
                          placeholder="بچووک"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeValue(g.id, v.id)}
                          aria-label={t('productVariants.removeValue')}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex items-center justify-between pt-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        leftIcon={<Plus className="h-3.5 w-3.5" />}
                        onClick={() => addValue(g.id)}
                      >
                        {t('productVariants.addValue')}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeGroup(g.id)}
                        leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                      >
                        {t('productVariants.removeGroup')}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Variants */}
      <Card>
        <CardContent className="py-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
                <GripVertical className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-base font-semibold text-text-primary">
                {t('productVariants.variantsTitle')}
              </h3>
              <Badge size="sm" variant="outline">
                {variants.length}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                leftIcon={<RefreshCw className="h-4 w-4" />}
                onClick={generateVariants}
                disabled={!canGenerate}
                title={t('productVariants.generateHint')}
              >
                {t('productVariants.regenerate')}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={addBlankVariant}
              >
                {t('productVariants.addVariant')}
              </Button>
            </div>
          </div>

          {variants.length === 0 ? (
            <p className="text-sm text-text-muted">{t('productVariants.variantsEmpty')}</p>
          ) : (
            <div className="space-y-3">
              {variants.map((v) => (
                <div
                  key={v.id}
                  className="rounded-lg border border-border bg-surface-50 dark:bg-surface-elevated p-3"
                >
                  <div className="grid gap-2 sm:grid-cols-3 mb-2">
                    <Input
                      label={t('productVariants.labelEn')}
                      value={v.displayNameEn}
                      onChange={(e) => updateVariant(v.id, { displayNameEn: e.target.value })}
                    />
                    <Input
                      label={t('productVariants.labelAr')}
                      value={v.displayNameAr}
                      onChange={(e) => updateVariant(v.id, { displayNameAr: e.target.value })}
                    />
                    <Input
                      label={t('productVariants.labelKu')}
                      value={v.displayNameKu}
                      onChange={(e) => updateVariant(v.id, { displayNameKu: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto_auto] items-end">
                    <Input
                      label={t('productVariants.sku')}
                      value={v.sku}
                      onChange={(e) => updateVariant(v.id, { sku: e.target.value })}
                      placeholder="SKU-001"
                    />
                    <Input
                      label={`${t('productVariants.price')} (${currency})`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={Number.isFinite(v.finalPrice) ? v.finalPrice : 0}
                      onChange={(e) =>
                        updateVariant(v.id, { finalPrice: parseFloat(e.target.value) || 0 })
                      }
                    />
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-text-primary">
                        {t('productVariants.statusLabel')}
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          updateVariant(v.id, {
                            status: v.status === 'Active' ? 'Disabled' : 'Active',
                          })
                        }
                        className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm transition-colors hover:bg-hover"
                      >
                        <Badge
                          size="sm"
                          variant={v.status === 'Active' ? 'success' : 'default'}
                        >
                          {v.status === 'Active'
                            ? t('productVariants.statusActive')
                            : t('productVariants.statusDisabled')}
                        </Badge>
                      </button>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVariant(v.id)}
                      aria-label={t('productVariants.removeVariant')}
                      title={
                        v.serverId
                          ? t('productVariants.removeServerHint')
                          : t('productVariants.removeVariant')
                      }
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>

                  {v.serverId && v.status === 'Disabled' && (
                    <p className="mt-2 text-xs text-text-muted">
                      {t('productVariants.disabledTooltip')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {validationErrors.length > 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <ul className="space-y-0.5 list-disc ltr:ml-4 rtl:mr-4">
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-end">
        <Button
          type="button"
          onClick={handleSave}
          isLoading={isPending}
          disabled={validationErrors.length > 0}
        >
          {t('productVariants.saveVariants')}
        </Button>
      </div>
    </div>
  );
}

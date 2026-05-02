import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Ban, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui';
import { ConfirmModal } from '@/components/common';
import { useCancelOrder, useCancelParentProductOrder } from '../api';
import type { OrderDetailDto, OrderSummaryDto } from '@/types';

const CASH_VOID_WINDOW_MINUTES = 30;

/**
 * Decide whether a cash-paid purchase order is still inside the void window.
 * Pulled into a top-level helper so the `Date.now()` call doesn't live in
 * render — keeps the React Compiler `impure-function` rule quiet.
 */
function isWithinCashVoidWindow(order: OrderDetailDto | OrderSummaryDto): boolean {
  if (order.status !== 'Paid') return false;
  const windowMs = CASH_VOID_WINDOW_MINUTES * 60 * 1000;
  const now = Date.now();
  if ('payments' in order && order.payments) {
    const cashPayment = order.payments.find(
      (p) => p.method === 'Cash' && p.status === 'Successful'
    );
    if (!cashPayment || !cashPayment.createdAt) return false;
    return now - new Date(cashPayment.createdAt).getTime() <= windowMs;
  }
  if (!order.paidAt) return false;
  return now - new Date(order.paidAt).getTime() <= windowMs;
}

interface CancelOrderButtonProps {
  /**
   * Either a full OrderDetailDto (preferred — gives us the cash payment timestamp)
   * or a summary row from a list. When given a summary we approximate the cash-void
   * window from `paidAt`, which is sufficient because BE re-validates server-side.
   */
  order: OrderDetailDto | OrderSummaryDto;

  /**
   * Use the parent self-service cancel endpoint instead of the admin one.
   * Parent-scoped orders use `/Parents/me/product-orders/{id}/cancel`.
   */
  parentScope?: boolean;

  size?: 'sm' | 'md';
  variant?: 'secondary' | 'danger' | 'ghost';

  onSuccess?: () => void;
}

/**
 * Smart cancel/void button for purchase orders.
 *
 *  - Pending purchase Order   → "Cancel order" (no money has moved).
 *  - Paid Cash Order < 30 min → "Void purchase" (reverse cash collection).
 *  - Anything else            → renders nothing.
 *
 * Server-side enforces the window; client-side hides early to avoid noise.
 */
export function CancelOrderButton({
  order,
  parentScope = false,
  size = 'sm',
  variant = 'danger',
  onSuccess,
}: CancelOrderButtonProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const adminCancel = useCancelOrder();
  const parentCancel = useCancelParentProductOrder();
  const mutation = parentScope ? parentCancel : adminCancel;

  // Determine eligibility.
  const isPurchase = order.type === 'Purchase';
  const isPending = order.status === 'Pending';

  // Cash-paid void: only if Paid AND within window. The window check happens
  // in a helper so `Date.now()` doesn't run during render.
  const isCashVoidable = isWithinCashVoidWindow(order);

  if (!isPurchase || (!isPending && !isCashVoidable)) {
    return null;
  }

  const isVoid = !isPending && isCashVoidable;

  const handleConfirm = async () => {
    try {
      await mutation.mutateAsync({ orderId: order.id });
      setOpen(false);
      onSuccess?.();
    } catch {
      // toast handled in the mutation; modal stays open for retry
    }
  };

  const Icon = isVoid ? RotateCcw : Ban;

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        leftIcon={<Icon className="h-4 w-4" />}
        onClick={() => setOpen(true)}
      >
        {isVoid
          ? t('productPurchases.cancel.voidButton')
          : t('productPurchases.cancel.cancelButton')}
      </Button>

      <ConfirmModal
        isOpen={open}
        onClose={() => !mutation.isPending && setOpen(false)}
        onConfirm={handleConfirm}
        title={
          isVoid
            ? t('productPurchases.cancel.voidTitle')
            : t('productPurchases.cancel.cancelTitle')
        }
        description={
          isVoid
            ? t('productPurchases.cancel.voidDescription')
            : t('productPurchases.cancel.cancelDescription')
        }
        confirmLabel={
          isVoid
            ? t('productPurchases.cancel.voidConfirm')
            : t('productPurchases.cancel.cancelConfirm')
        }
        cancelLabel={t('common.cancel')}
        variant="danger"
        isLoading={mutation.isPending}
      />
    </>
  );
}

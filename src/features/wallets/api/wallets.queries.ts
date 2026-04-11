import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { walletsApi } from './wallets.api';
import { queryKeys } from '@/lib/query';
import { useUIStore } from '@/stores/ui.store';
import type {
  WalletListParams,
  CreateWalletData,
  UpdateWalletData,
  UpdateWalletStatusData,
  TopUpCashData,
  TopUpGatewayData,
  PaymentGateway,
  WalletTransactionListParams,
} from '@/types';

// --- Queries ---

export function useWallets(params?: WalletListParams) {
  const activeSchoolId = useUIStore((s) => s.activeSchoolId);
  return useQuery({
    queryKey: queryKeys.wallets.list({ ...params, schoolId: activeSchoolId }),
    queryFn: () => walletsApi.getWallets(params),
    placeholderData: keepPreviousData,
  });
}

export function useWallet(id: string) {
  return useQuery({
    queryKey: queryKeys.wallets.detail(id),
    queryFn: () => walletsApi.getWalletById(id),
    enabled: !!id,
  });
}

export function useWalletTransactions(id: string, params?: WalletTransactionListParams) {
  return useQuery({
    queryKey: queryKeys.wallets.transactions(id, params),
    queryFn: () => walletsApi.getWalletTransactions(id, params),
    enabled: !!id,
    placeholderData: keepPreviousData,
  });
}

// --- Mutations ---

export function useCreateWallet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateWalletData) => walletsApi.createWallet(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.wallets.all });
      toast.success('Wallet created successfully');
    },
  });
}

export function useUpdateWallet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWalletData }) =>
      walletsApi.updateWallet(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.wallets.all });
      toast.success('Wallet limits updated');
    },
  });
}

export function useDeleteWallet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => walletsApi.deleteWallet(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.wallets.all });
      toast.success('Wallet deleted');
    },
  });
}

export function useUpdateWalletStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWalletStatusData }) =>
      walletsApi.updateStatus(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.wallets.all });
      toast.success('Wallet status updated');
    },
  });
}

export function useTopUpWalletCash() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TopUpCashData }) =>
      walletsApi.topUpCash(id, data),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: queryKeys.wallets.all });
      qc.invalidateQueries({ queryKey: queryKeys.orders.all });
      toast.success(`Top-up successful. New balance: ${result.newBalance.toLocaleString()}`);
    },
  });
}

export function useTopUpWalletGateway() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TopUpGatewayData }) =>
      walletsApi.topUpGateway(id, data),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: queryKeys.wallets.all });
      qc.invalidateQueries({ queryKey: queryKeys.orders.all });
      if (!result.paymentUrl) {
        toast.error('Gateway did not return a payment URL');
        return;
      }
      const win = window.open(result.paymentUrl, '_blank', 'noopener,noreferrer');
      if (!win) {
        toast.error('Popup blocked. Please allow popups and try again.');
        return;
      }
      toast.success('Redirecting to payment gateway...');
    },
  });
}

// --- Fee instance payment mutations ---

export function usePayFeeWithWallet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ feeInstanceId, schoolId }: { feeInstanceId: string; schoolId?: string }) =>
      walletsApi.payFeeWithWallet(feeInstanceId, schoolId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.feeInstances.all });
      qc.invalidateQueries({ queryKey: queryKeys.wallets.all });
      qc.invalidateQueries({ queryKey: queryKeys.orders.all });
      toast.success('Fee paid successfully');
    },
  });
}

export function usePayFeeWithGateway() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ feeInstanceId, gateway, schoolId }: { feeInstanceId: string; gateway: PaymentGateway; schoolId?: string }) =>
      walletsApi.payFeeWithGateway(feeInstanceId, gateway, schoolId),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: queryKeys.feeInstances.all });
      qc.invalidateQueries({ queryKey: queryKeys.orders.all });
      if (!result.paymentUrl) {
        toast.error('Gateway did not return a payment URL');
        return;
      }
      const win = window.open(result.paymentUrl, '_blank', 'noopener,noreferrer');
      if (!win) {
        toast.error('Popup blocked. Please allow popups and try again.');
        return;
      }
      toast.success('Redirecting to payment gateway...');
    },
  });
}

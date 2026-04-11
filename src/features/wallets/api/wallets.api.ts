import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config';
import type {
  WalletDto,
  WalletListParams,
  CreateWalletData,
  UpdateWalletData,
  UpdateWalletStatusData,
  TopUpCashData,
  TopUpGatewayData,
  TopUpResultDto,
  GatewayTopUpInitResultDto,
  FeePayResultDto,
  GatewayFeePayInitResultDto,
  WalletTransactionDto,
  WalletTransactionListParams,
  PaginatedResponse,
  ApiResponse,
  PaymentGateway,
} from '@/types';

export const walletsApi = {
  getWallets: async (params?: WalletListParams): Promise<PaginatedResponse<WalletDto>> => {
    const response = await apiClient.get<PaginatedResponse<WalletDto>>(
      API_ENDPOINTS.WALLETS.LIST,
      { params }
    );
    return response.data;
  },

  getWalletById: async (id: string): Promise<WalletDto> => {
    const response = await apiClient.get<ApiResponse<WalletDto>>(
      API_ENDPOINTS.WALLETS.DETAIL(id)
    );
    return response.data.data;
  },

  getWalletTransactions: async (
    id: string,
    params?: WalletTransactionListParams
  ): Promise<PaginatedResponse<WalletTransactionDto>> => {
    const response = await apiClient.get<PaginatedResponse<WalletTransactionDto>>(
      API_ENDPOINTS.WALLETS.TRANSACTIONS(id),
      { params }
    );
    return response.data;
  },

  createWallet: async (data: CreateWalletData): Promise<WalletDto> => {
    const response = await apiClient.post<ApiResponse<WalletDto>>(
      API_ENDPOINTS.WALLETS.LIST,
      data
    );
    return response.data.data;
  },

  updateWallet: async (id: string, data: UpdateWalletData): Promise<void> => {
    await apiClient.put(API_ENDPOINTS.WALLETS.DETAIL(id), data);
  },

  deleteWallet: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.WALLETS.DETAIL(id));
  },

  updateStatus: async (id: string, data: UpdateWalletStatusData): Promise<void> => {
    await apiClient.patch(API_ENDPOINTS.WALLETS.STATUS(id), data);
  },

  topUpCash: async (id: string, data: TopUpCashData): Promise<TopUpResultDto> => {
    const response = await apiClient.post<ApiResponse<TopUpResultDto>>(
      API_ENDPOINTS.WALLETS.TOP_UP_CASH(id),
      data
    );
    return response.data.data;
  },

  topUpGateway: async (
    id: string,
    data: TopUpGatewayData
  ): Promise<GatewayTopUpInitResultDto> => {
    const response = await apiClient.post<ApiResponse<GatewayTopUpInitResultDto>>(
      API_ENDPOINTS.WALLETS.TOP_UP_GATEWAY(id),
      data
    );
    return response.data.data;
  },

  payFeeWithWallet: async (feeInstanceId: string, schoolId?: string): Promise<FeePayResultDto> => {
    const response = await apiClient.post<ApiResponse<FeePayResultDto>>(
      API_ENDPOINTS.FEE_INSTANCE_PAYMENTS.PAY_WITH_WALLET(feeInstanceId),
      undefined,
      schoolId ? { headers: { 'X-School-Id': schoolId } } : undefined
    );
    return response.data.data;
  },

  payFeeWithGateway: async (
    feeInstanceId: string,
    gateway: PaymentGateway,
    schoolId?: string
  ): Promise<GatewayFeePayInitResultDto> => {
    const response = await apiClient.post<ApiResponse<GatewayFeePayInitResultDto>>(
      API_ENDPOINTS.FEE_INSTANCE_PAYMENTS.PAY_WITH_GATEWAY(feeInstanceId),
      { gateway },
      schoolId ? { headers: { 'X-School-Id': schoolId } } : undefined
    );
    return response.data.data;
  },
};

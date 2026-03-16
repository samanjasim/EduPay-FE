import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config';
import type {
  NotificationDto, SentNotificationDto, NotificationRecipientsDto,
  NotificationListParams, SentNotificationListParams,
  SendNotificationData, BulkSendNotificationData,
  ApiResponse, PaginatedResponse,
} from '@/types';

export const notificationsApi = {
  getNotifications: async (params?: NotificationListParams): Promise<PaginatedResponse<NotificationDto>> => {
    const response = await apiClient.get<PaginatedResponse<NotificationDto>>(API_ENDPOINTS.NOTIFICATIONS.LIST, { params });
    return response.data;
  },
  getNotificationById: async (id: string): Promise<SentNotificationDto> => {
    const response = await apiClient.get<ApiResponse<SentNotificationDto>>(API_ENDPOINTS.NOTIFICATIONS.DETAIL(id));
    return response.data.data;
  },
  getRecipients: async (id: string): Promise<NotificationRecipientsDto> => {
    const response = await apiClient.get<ApiResponse<NotificationRecipientsDto>>(API_ENDPOINTS.NOTIFICATIONS.RECIPIENTS(id));
    return response.data.data;
  },
  getSentNotifications: async (params?: SentNotificationListParams): Promise<PaginatedResponse<SentNotificationDto>> => {
    const response = await apiClient.get<PaginatedResponse<SentNotificationDto>>(API_ENDPOINTS.NOTIFICATIONS.SENT, { params });
    return response.data;
  },
  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<ApiResponse<number>>(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
    return response.data.data;
  },
  markAsRead: async (id: string): Promise<void> => {
    await apiClient.put(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
  },
  markAllAsRead: async (): Promise<void> => {
    await apiClient.put(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
  },
  send: async (data: SendNotificationData): Promise<string> => {
    const response = await apiClient.post<ApiResponse<string>>(API_ENDPOINTS.NOTIFICATIONS.SEND, data);
    return response.data.data;
  },
  bulkSend: async (data: BulkSendNotificationData): Promise<number> => {
    const response = await apiClient.post<ApiResponse<number>>(API_ENDPOINTS.NOTIFICATIONS.BULK_SEND, data);
    return response.data.data;
  },
};

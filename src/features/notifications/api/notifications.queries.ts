import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { notificationsApi } from './notifications.api';
import { queryKeys } from '@/lib/query';
import type { NotificationListParams, SentNotificationListParams, SendNotificationData, BulkSendNotificationData } from '@/types';

export function useNotifications(params?: NotificationListParams) {
  return useQuery({
    queryKey: queryKeys.notifications.list(params),
    queryFn: () => notificationsApi.getNotifications(params),
    placeholderData: keepPreviousData,
  });
}

export function useNotification(id: string) {
  return useQuery({
    queryKey: ['notifications', 'detail', id],
    queryFn: () => notificationsApi.getNotificationById(id),
    enabled: !!id,
  });
}

export function useNotificationRecipients(id: string) {
  return useQuery({
    queryKey: ['notifications', 'recipients', id],
    queryFn: () => notificationsApi.getRecipients(id),
    enabled: !!id,
  });
}

export function useSentNotifications(params?: SentNotificationListParams) {
  return useQuery({
    queryKey: ['notifications', 'sent', params],
    queryFn: () => notificationsApi.getSentNotifications(params),
    placeholderData: keepPreviousData,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: () => notificationsApi.getUnreadCount(),
    refetchInterval: 30000,
  });
}

export function useMarkAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.notifications.all }); },
  });
}

export function useMarkAllAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all });
      toast.success('All notifications marked as read');
    },
  });
}

export function useSendNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SendNotificationData) => notificationsApi.send(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all });
      toast.success('Notification sent');
    },
  });
}

export function useBulkSendNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkSendNotificationData) => notificationsApi.bulkSend(data),
    onSuccess: (count) => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all });
      toast.success(`Notification sent to ${count} recipient${count !== 1 ? 's' : ''}`);
    },
  });
}

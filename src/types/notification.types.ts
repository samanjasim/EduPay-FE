// ─── Enums ───

export type NotificationChannel = 'InApp' | 'Push' | 'Email';
export type NotificationReferenceType = 'Fee' | 'Payment' | 'Order' | 'Wallet' | 'School';

// ─── Response DTO (match BE NotificationDto) ───

export interface NotificationDto {
  id: string;
  userId: string;
  title: string;
  body: string;
  channel: NotificationChannel;
  referenceType?: NotificationReferenceType | null;
  referenceId?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

// ─── Send (match BE SendNotificationRequest) ───

export interface SendNotificationData {
  userId: string;
  title: string;
  body: string;
}

// ─── Query Params (match BE GetNotificationsQuery) ───

export interface NotificationListParams {
  isRead?: boolean;
  referenceType?: NotificationReferenceType;
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  sortDescending?: boolean;
}

export type NotificationAudienceType = 'Users' | 'Roles' | 'School' | 'Parents';

export interface SentNotificationDto {
  id: string;
  userId: string;
  userFullName: string;
  userEmail: string;
  title: string;
  body: string;
  channel: NotificationChannel;
  referenceType?: NotificationReferenceType | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface SentNotificationListParams {
  isRead?: boolean;
  referenceType?: NotificationReferenceType;
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  sortDescending?: boolean;
}

export interface RecipientDto {
  notificationId: string;
  userId: string;
  userFullName: string;
  userEmail: string;
  isRead: boolean;
  readAt?: string | null;
}

export interface NotificationRecipientsDto {
  title: string;
  body: string;
  channel: NotificationChannel;
  referenceType?: NotificationReferenceType | null;
  sentAt: string;
  totalRecipients: number;
  readCount: number;
  unreadCount: number;
  recipients: RecipientDto[];
}

export interface BulkSendNotificationData {
  title: string;
  body: string;
  channel: NotificationChannel;
  referenceType?: NotificationReferenceType;
  audienceType: NotificationAudienceType;
  userIds?: string[];
  roleNames?: string[];
  schoolId?: string;
}

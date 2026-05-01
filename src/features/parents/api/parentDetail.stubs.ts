import { useQuery } from '@tanstack/react-query';

type ParentDashboardChild = {
  studentId: string;
  fullNameEn: string;
  fullNameAr: string;
  studentCode: string;
  gradeName: string;
  sectionName?: string | null;
  status: string;
  pendingFees: number;
  pendingAmount: number;
  overdueFees: number;
  overdueAmount: number;
  relation?: string;
  linkedAt?: string;
};

type ParentDashboard = {
  totalChildren: number;
  totalPendingFees: number;
  totalPendingAmount: number;
  totalOverdueFees: number;
  totalOverdueAmount: number;
  totalPaidFees: number;
  totalPaidAmount: number;
  currency: string;
  children: ParentDashboardChild[];
};

type ParentChild = ParentDashboardChild & { relation: string; linkedAt: string };

type Paginated<T> = {
  data: T[];
  pagination: {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

type ParentFee = {
  feeInstanceId: string;
  feeName: string;
  studentName: string;
  amount: number;
  currency: string;
  discountAmount: number;
  dueDate: string;
  status: string;
};

type ParentOrder = {
  orderId: string;
  receiptNumber: string;
  studentName: string;
  type: string;
  totalAmount: number;
  currency: string;
  status: string;
  createdAt: string;
  paidAt: string | null;
};

type FeesParams = { pageNumber: number; pageSize: number; studentId?: string; status?: string };
type OrdersParams = FeesParams;

const emptyDashboard: ParentDashboard = {
  totalChildren: 0,
  totalPendingFees: 0,
  totalPendingAmount: 0,
  totalOverdueFees: 0,
  totalOverdueAmount: 0,
  totalPaidFees: 0,
  totalPaidAmount: 0,
  currency: 'IQD',
  children: [],
};

const emptyPaginated = <T,>(): Paginated<T> => ({
  data: [],
  pagination: {
    pageNumber: 1,
    pageSize: 10,
    totalPages: 0,
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
});

// Stubs — matching parent-detail endpoints not yet implemented in BE.
// Returning empty data so the page renders without runtime errors.
export function useParentDashboard(parentUserId: string) {
  return useQuery<ParentDashboard>({
    queryKey: ['parent', parentUserId, 'dashboard'],
    queryFn: async () => emptyDashboard,
    enabled: !!parentUserId,
  });
}

export function useParentChildren(parentUserId: string) {
  return useQuery<ParentChild[]>({
    queryKey: ['parent', parentUserId, 'children'],
    queryFn: async () => [],
    enabled: !!parentUserId,
  });
}

export function useParentFees(parentUserId: string, params: FeesParams) {
  return useQuery<Paginated<ParentFee>>({
    queryKey: ['parent', parentUserId, 'fees', params],
    queryFn: async () => emptyPaginated<ParentFee>(),
    enabled: !!parentUserId,
  });
}

export function useParentOrders(parentUserId: string, params: OrdersParams) {
  return useQuery<Paginated<ParentOrder>>({
    queryKey: ['parent', parentUserId, 'orders', params],
    queryFn: async () => emptyPaginated<ParentOrder>(),
    enabled: !!parentUserId,
  });
}

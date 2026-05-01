export interface CashReconciliationReportParams {
  dateFrom?: string;
  dateTo?: string;
  collectorId?: string;
}

export interface CashReconciliationTotalDto {
  currency: string;
  amount: number;
  count: number;
}

export interface CashReconciliationCollectorTotalDto {
  collectedByUserId: string;
  collectedByUserName: string | null;
  currency: string;
  amount: number;
  count: number;
}

export interface CashReconciliationPaymentDto {
  orderId: string;
  receiptNumber: string;
  studentId: string;
  studentName: string;
  collectedByUserId: string;
  collectedByUserName: string | null;
  amount: number;
  currency: string;
  collectedAt: string;
  note: string | null;
}

export interface CashReconciliationReportDto {
  dateFrom: string;
  dateTo: string;
  totals: CashReconciliationTotalDto[];
  collectorTotals: CashReconciliationCollectorTotalDto[];
  payments: CashReconciliationPaymentDto[];
}

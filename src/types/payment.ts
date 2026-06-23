export type SubscriptionPlanCode = "FREE" | "STUDENT" | "PRO";
export type PaymentMethodCode = "BANK_TRANSFER" | "CARD";
export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED"
  | "EXPIRED";

export type SubscriptionPlan = {
  code: SubscriptionPlanCode;
  name: string;
  amount: number;
  currency: string;
  billingPeriod: "NONE" | "MONTHLY";
};

export type CurrentSubscription = {
  plan: SubscriptionPlanCode;
  startsAt: string;
  expiresAt: string | null;
  storageLimitMb: number;
  uploadLimit: number;
  aiChatLimit: number | null;
  aiChatsUsed: number;
};

export type CheckoutResponse = {
  invoiceNumber: string;
  checkoutUrl: string;
  fields: Record<string, string | number>;
};

export type PaymentOrder = {
  invoiceNumber: string;
  plan: SubscriptionPlanCode;
  paymentMethod: PaymentMethodCode;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paidAt: string | null;
  createdAt: string;
};

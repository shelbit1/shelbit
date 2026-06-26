export type UserRole = "admin" | "manager";

export type DealStage =
  | "new"
  | "review"
  | "negotiation"
  | "contract"
  | "payment"
  | "closed"
  | "rejected";

export type DealPriority = "low" | "medium" | "high";

export type Deal = {
  id: number;
  title: string;
  address: string;
  price: number;
  managerId: number | null;
  managerName: string;
  stage: DealStage;
  priority: DealPriority;
  objectType: string | null;
  region: string | null;
  yieldPercent: number | null;
  paybackYears: number | null;
  areaSqm: number | null;
  tenants: string | null;
  owner: string | null;
  deadline: string | null;
  closeProbability: number;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  stageChangedAt: string;
  commentCount: number;
};

export type DealHistoryEntry = {
  id: number;
  dealId: number;
  userName: string;
  action: string;
  detail: string | null;
  fromStage: DealStage | null;
  toStage: DealStage | null;
  createdAt: string;
};

export type DealComment = {
  id: number;
  dealId: number;
  userName: string;
  body: string;
  createdAt: string;
};

export type DealTask = {
  id: number;
  dealId: number;
  title: string;
  dueDate: string | null;
  completed: boolean;
  assigneeName: string | null;
  createdAt: string;
};

export type StageMeta = {
  id: DealStage;
  label: string;
  color: string;
  bgColor: string;
  closeProbability: number;
  slaDays: number;
};

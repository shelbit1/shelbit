import type { DealStage, StageMeta } from "@/types/crm";

export const STAGES: StageMeta[] = [
  {
    id: "new",
    label: "Новая заявка",
    color: "#3B82F6",
    bgColor: "rgba(59,130,246,0.12)",
    closeProbability: 10,
    slaDays: 3,
  },
  {
    id: "review",
    label: "На проверке",
    color: "#8B5CF6",
    bgColor: "rgba(139,92,246,0.12)",
    closeProbability: 25,
    slaDays: 5,
  },
  {
    id: "negotiation",
    label: "Переговоры",
    color: "#EAB308",
    bgColor: "rgba(234,179,8,0.12)",
    closeProbability: 50,
    slaDays: 7,
  },
  {
    id: "contract",
    label: "Договор",
    color: "#F97316",
    bgColor: "rgba(249,115,22,0.12)",
    closeProbability: 80,
    slaDays: 10,
  },
  {
    id: "payment",
    label: "Оплата",
    color: "#22C55E",
    bgColor: "rgba(34,197,94,0.12)",
    closeProbability: 90,
    slaDays: 14,
  },
  {
    id: "closed",
    label: "Закрыта",
    color: "#15803D",
    bgColor: "rgba(21,128,61,0.12)",
    closeProbability: 100,
    slaDays: 0,
  },
  {
    id: "rejected",
    label: "Отказ",
    color: "#EF4444",
    bgColor: "rgba(239,68,68,0.12)",
    closeProbability: 0,
    slaDays: 0,
  },
];

export const FUNNEL_STAGES: DealStage[] = [
  "new",
  "review",
  "negotiation",
  "contract",
  "payment",
  "closed",
];

export function getStageMeta(id: DealStage): StageMeta {
  return STAGES.find((s) => s.id === id) ?? STAGES[0];
}

export function formatRub(value: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

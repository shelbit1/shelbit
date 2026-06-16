"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ShieldCheck,
  TrendingUp,
  ScrollText,
  CalendarClock,
  Handshake,
  BarChart3,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

type Advantage = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const ADVANTAGES: Advantage[] = [
  {
    icon: ShieldCheck,
    title: "Надёжные федеральные арендаторы",
    description:
      "Работаем с крупными федеральными сетями — устойчивыми арендаторами с прозрачной историей платежей.",
  },
  {
    icon: TrendingUp,
    title: "Стабильный и прогнозируемый доход",
    description:
      "Понятная модель арендного потока, который можно рассчитать заранее ещё до сделки.",
  },
  {
    icon: ScrollText,
    title: "Юридическая чистота сделки",
    description:
      "Полная проверка документов и истории объекта. Никаких скрытых рисков и обременений.",
  },
  {
    icon: CalendarClock,
    title: "Долгосрочные договоры аренды",
    description:
      "Договоры на длительный срок фиксируют доход и снижают риск простоя помещения.",
  },
  {
    icon: Handshake,
    title: "Сопровождение сделки под ключ",
    description:
      "Ведём вас на всех этапах: от подбора объекта до регистрации права и старта аренды.",
  },
  {
    icon: BarChart3,
    title: "Прозрачная экономика объекта",
    description:
      "Раскрываем все цифры: цену, ставку аренды, доходность и срок окупаемости.",
  },
];

export function Advantages() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="advantages" className="scroll-mt-24 py-20 sm:py-28">
      <div className="container-page">
        <SectionHeading
          eyebrow="Преимущества"
          title="Почему SHELBIT"
          description="Мы сопровождаем инвестора на всём пути и отвечаем за качество каждого объекта в подборке."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ADVANTAGES.map((advantage, index) => (
            <motion.div
              key={advantage.title}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.5,
                delay: (index % 3) * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group rounded-2xl border border-border bg-surface/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:bg-surface"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-background/50 text-accent transition-colors group-hover:border-accent/40">
                <advantage.icon size={22} />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold tracking-tight">
                {advantage.title}
              </h3>
              <p className="body-lg mt-2 text-sm">{advantage.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

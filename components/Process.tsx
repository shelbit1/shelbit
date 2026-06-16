"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Search, FileSearch, FileSignature, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

type Step = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const STEPS: Step[] = [
  {
    icon: Search,
    title: "Подбор объекта",
    description: "Под ваш бюджет, цели и желаемую доходность.",
  },
  {
    icon: FileSearch,
    title: "Проверка и аналитика",
    description: "Юридическая экспертиза и оценка экономики объекта.",
  },
  {
    icon: FileSignature,
    title: "Заключение сделки",
    description: "Полное сопровождение на всех этапах оформления.",
  },
  {
    icon: Wallet,
    title: "Получение дохода",
    description: "Стабильный арендный поток от федерального арендатора.",
  },
];

export function Process() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="process" className="scroll-mt-24 py-20 sm:py-28">
      <div className="container-page">
        <SectionHeading
          eyebrow="Процесс"
          title="Как проходит сделка"
          description="Четыре прозрачных шага — от первого запроса до стабильного арендного дохода."
        />

        <div className="relative mt-16">
          {/* Соединительная линия (десктоп) */}
          <div
            aria-hidden
            className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block"
          />

          <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {STEPS.map((step, index) => (
              <motion.li
                key={step.title}
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="relative flex flex-col items-center text-center"
              >
                <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-surface text-accent shadow-soft">
                  <step.icon size={24} />
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-background">
                    {index + 1}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="body-lg mt-2 max-w-[15rem] text-sm">
                  {step.description}
                </p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

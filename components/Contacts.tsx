"use client";

import { useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Phone,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Instagram,
} from "lucide-react";
import { CONTACTS, SOCIALS } from "@/lib/site";

const SOCIAL_ICONS: Record<string, typeof Instagram> = {
  Instagram,
  Telegram: Send,
};

type Status = "idle" | "loading" | "success" | "error";

export function Contacts() {
  const reduceMotion = useReducedMotion();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    comment: "",
  });
  const [status, setStatus] = useState<Status>("idle");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("request failed");

      setStatus("success");
      setForm({ name: "", phone: "", email: "", comment: "" });
    } catch {
      setStatus("error");
    }
  };

  const inputClass =
    "w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-foreground placeholder:text-muted/70 transition-colors focus:border-accent/50";

  return (
    <section id="contacts" className="scroll-mt-24 py-20 sm:py-28">
      <div className="container-page">
        <motion.div
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-3xl border border-border bg-surface p-7 sm:p-12"
        >
          {/* Декоративное свечение */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-60 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(47,174,102,0.28) 0%, rgba(47,174,102,0) 65%)",
            }}
          />

          <div className="relative grid gap-10 lg:grid-cols-2">
            {/* Левая колонка — текст и контакты */}
            <div className="flex flex-col">
              <h2 className="heading-lg">
                Готовы подобрать объект под вашу задачу?
              </h2>
              <p className="body-lg mt-4 text-base sm:text-lg">
                Оставьте заявку — пришлём актуальную подборку объектов.
              </p>

              <div className="mt-8 flex flex-col gap-3">
                <a
                  href={CONTACTS.phoneHref}
                  className="group inline-flex items-center gap-3 text-lg font-semibold text-foreground transition-colors hover:text-accent"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-background/50 text-accent">
                    <Phone size={20} />
                  </span>
                  {CONTACTS.phoneDisplay}
                </a>
                <a
                  href={CONTACTS.emailHref}
                  className="group inline-flex items-center gap-3 break-all text-lg font-semibold text-foreground transition-colors hover:text-accent"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-background/50 text-accent">
                    <Mail size={20} />
                  </span>
                  {CONTACTS.email}
                </a>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={CONTACTS.phoneHref}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-background transition-all hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-glow"
                >
                  <Phone size={16} />
                  Позвонить
                </a>
                <a
                  href={CONTACTS.emailHref}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background/40 px-5 py-3 text-sm font-semibold text-foreground transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-background"
                >
                  <Mail size={16} />
                  Написать
                </a>
              </div>

              {/* Соцсети и каналы */}
              <div className="mt-8">
                <p className="text-sm text-muted">Мы в соцсетях и мессенджерах</p>
                <ul className="mt-3 flex flex-wrap items-center gap-3">
                  {SOCIALS.map((social) => {
                    const Icon = SOCIAL_ICONS[social.label];
                    return (
                      <li key={social.label}>
                        <a
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={social.label}
                          title={social.label}
                          className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-background/50 text-foreground transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent"
                        >
                          {Icon ? (
                            <Icon size={20} />
                          ) : (
                            <span className="text-xs font-bold tracking-tight">
                              {social.label}
                            </span>
                          )}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Правая колонка — форма */}
            <div className="rounded-2xl border border-border bg-background/40 p-5 sm:p-6">
              {status === "success" ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 py-10 text-center">
                  <CheckCircle2 size={48} className="text-accent" />
                  <h3 className="font-display text-xl font-bold">Заявка отправлена!</h3>
                  <p className="body-lg text-sm">
                    Мы получили вашу заявку и свяжемся с вами в ближайшее время.
                  </p>
                  <button
                    onClick={() => setStatus("idle")}
                    className="mt-2 rounded-xl border border-border px-5 py-2.5 text-sm text-muted transition-colors hover:border-white/20 hover:text-foreground"
                  >
                    Отправить ещё одну заявку
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} aria-label="Форма заявки">
                  <div className="flex flex-col gap-4">
                    <div>
                      <label htmlFor="name" className="mb-1.5 block text-sm text-muted">
                        Имя
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        placeholder="Как к вам обращаться"
                        className={inputClass}
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        disabled={status === "loading"}
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="phone" className="mb-1.5 block text-sm text-muted">
                          Телефон
                        </label>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          autoComplete="tel"
                          placeholder="+7 ..."
                          className={inputClass}
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          disabled={status === "loading"}
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="mb-1.5 block text-sm text-muted">
                          Email
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          placeholder="you@email.com"
                          className={inputClass}
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          disabled={status === "loading"}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="comment" className="mb-1.5 block text-sm text-muted">
                        Комментарий
                      </label>
                      <textarea
                        id="comment"
                        name="comment"
                        rows={4}
                        placeholder="Бюджет, цель инвестиций, интересующий продукт..."
                        className={`${inputClass} resize-none`}
                        value={form.comment}
                        onChange={(e) => setForm({ ...form, comment: e.target.value })}
                        disabled={status === "loading"}
                      />
                    </div>

                    {status === "error" && (
                      <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                        <AlertCircle size={16} className="shrink-0" />
                        Не удалось отправить заявку. Пожалуйста, позвоните нам напрямую.
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="group inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-base font-semibold text-background shadow-soft transition-all hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                    >
                      {status === "loading" ? (
                        <>
                          <Loader2 size={17} className="animate-spin" />
                          Отправка...
                        </>
                      ) : (
                        <>
                          Отправить заявку
                          <Send
                            size={17}
                            className="transition-transform group-hover:translate-x-0.5"
                          />
                        </>
                      )}
                    </button>

                    <p className="text-center text-xs text-muted/80">
                      Нажимая кнопку, вы соглашаетесь на обработку персональных данных.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

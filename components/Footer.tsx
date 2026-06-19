import { Phone, Mail } from "lucide-react";
import { CONTACTS, NAV_LINKS } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      <div className="container-page py-14">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Бренд + слоган */}
          <div>
            <span className="font-display text-xl font-bold tracking-tight">
              SHEL<span className="text-accent">BIT</span>
            </span>
            <p className="body-lg mt-3 max-w-xs text-sm">
              Коммерческая недвижимость с федеральными арендаторами и стабильным
              арендным доходом.
            </p>
          </div>

          {/* Навигация */}
          <nav aria-label="Навигация в подвале">
            <h3 className="text-sm font-semibold text-foreground">Разделы</h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-muted transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Контакты */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Контакты</h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              <li>
                <a
                  href={CONTACTS.phoneHref}
                  className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
                >
                  <Phone size={15} className="text-accent" />
                  {CONTACTS.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={CONTACTS.emailHref}
                  className="inline-flex items-center gap-2 break-all text-sm text-muted transition-colors hover:text-foreground"
                >
                  <Mail size={15} className="text-accent" />
                  {CONTACTS.email}
                </a>
              </li>
            </ul>

            {/* TODO: добавить ссылки на соцсети (Telegram, WhatsApp и т.д.) */}
            {/* <div className="mt-4 flex gap-3"> ... иконки соцсетей ... </div> */}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} SHELBIT. Все права защищены.</p>
          {/* TODO: при необходимости добавить ОГРН и ссылку на политику конфиденциальности */}
          <p>Набиев Эльвин Шахлар оглы. ИНН 531502263400. Информация на сайте не является публичной офертой.</p>
        </div>
      </div>
    </footer>
  );
}

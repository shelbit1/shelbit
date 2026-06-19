// Централизованные контактные данные и навигация.
// TODO: при необходимости заменить на реальные значения / вынести в env.

export const CONTACTS = {
  phoneDisplay: "+7 977 702-17-77",
  phoneHref: "tel:+79777021777",
  email: "e.nabiev1997@yandex.com",
  emailHref: "mailto:e.nabiev1997@yandex.com",
} as const;

export const SOCIALS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/shelbitru/",
  },
  {
    label: "Telegram",
    href: "https://web.telegram.org/a/#-1003782250260",
  },
  {
    label: "MAX",
    href: "https://web.max.ru/-76056564971617",
  },
] as const;

export const NAV_LINKS = [
  { label: "Продукты", href: "#products" },
  { label: "Преимущества", href: "#advantages" },
  { label: "Как мы работаем", href: "#process" },
  { label: "Контакты", href: "#contacts" },
] as const;

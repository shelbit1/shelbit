// Централизованные контактные данные и навигация.
// TODO: при необходимости заменить на реальные значения / вынести в env.

export const CONTACTS = {
  phoneDisplay: "+7 977 702-17-77",
  phoneHref: "tel:+79777021777",
  email: "e.nabiev1997@yandex.com",
  emailHref: "mailto:e.nabiev1997@yandex.com",
} as const;

export const NAV_LINKS = [
  { label: "Продукты", href: "#products" },
  { label: "Преимущества", href: "#advantages" },
  { label: "Как мы работаем", href: "#process" },
  { label: "Контакты", href: "#contacts" },
] as const;

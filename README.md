# SHELBIT — сайт-визитка

Премиальный одностраничный лендинг для компании **SHELBIT** — коммерческая
недвижимость с федеральными арендаторами: коммерческая земля с предварительным
договором аренды и готовый арендный бизнес (ГАБ).

## Технологии

- [Next.js 14](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/) — анимации появления и микровзаимодействия
- [lucide-react](https://lucide.dev/) — иконки
- Шрифты `Inter` и `Space Grotesk` через `next/font/google`

## Запуск локально

```bash
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

Другие команды:

```bash
npm run build   # продакшн-сборка
npm run start   # запуск собранной версии
npm run lint    # проверка ESLint
```

## Структура проекта

```
app/
  layout.tsx        # корневой layout, SEO-метаданные, подключение шрифтов
  page.tsx          # сборка всех секций
  globals.css       # дизайн-система, утилиты, базовые стили
components/
  Header.tsx        # sticky-хедер с blur при скролле и бургер-меню
  Hero.tsx          # первый экран с радиальным свечением
  Products.tsx      # секция «Что мы предлагаем» (2 продукта)
  Advantages.tsx    # секция «Почему SHELBIT»
  Process.tsx       # секция «Как проходит сделка» (4 шага)
  Stats.tsx         # анимированные счётчики статистики
  Contacts.tsx      # CTA + форма (mailto) + контакты
  Footer.tsx        # подвал
  Reveal.tsx        # хелпер анимации появления при скролле
  SectionHeading.tsx# заголовок секции
lib/
  site.ts           # контакты и пункты навигации (единый источник данных)
```

## Форма заявки

Форма работает **без бэкенда**: при отправке формируется `mailto:`-письмо на
`e.nabiev1997@yandex.com` с подставленными данными. Логика — в
`components/Contacts.tsx`.

Чтобы подключить реальную отправку (без открытия почтового клиента), замените
обработчик `handleSubmit` на запрос к сервису, например:

- **Formspree** — `fetch("https://formspree.io/f/XXXX", { method: "POST", ... })`
- **Telegram-бот** — отправка через Bot API на свой чат

## Деплой на Vercel

1. Запушьте репозиторий на GitHub/GitLab/Bitbucket.
2. На [vercel.com](https://vercel.com/new) импортируйте репозиторий.
3. Vercel автоматически определит Next.js — никаких доп. настроек не нужно.
4. Нажмите **Deploy**.

Либо через CLI:

```bash
npm i -g vercel
vercel
```

После деплоя обновите константу `SITE_URL` в `app/layout.tsx` на реальный домен,
чтобы корректно работали Open Graph и `metadataBase`.

## Что нужно заменить на реальные данные

См. комментарии `// TODO` в коде. Кратко:

- **Статистика** (`components/Stats.tsx`) — цифры объектов, арендаторов, лет на рынке, доходности.
- **Юр. информация** (`components/Footer.tsx`) — ИП/ООО, ИНН/ОГРН, политика конфиденциальности.
- **Соцсети** (`components/Footer.tsx`) — ссылки на Telegram/WhatsApp и т.д.
- **Домен** (`app/layout.tsx`) — `SITE_URL` для SEO/OG.
- При необходимости — фото объектов и логотип (сейчас логотип текстовый).

import type { Metadata, Viewport } from "next";
import "./globals.css";
// Шрифты подключены через @fontsource в globals.css — без запросов к Google Fonts при сборке

const SITE_URL = "https://shelbit.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "SHELBIT — коммерческая недвижимость с федеральными арендаторами",
  description:
    "SHELBIT — продажа коммерческой земли с предварительным договором аренды от федеральной сети и готового арендного бизнеса (ГАБ) с надёжным федеральным арендатором. Стабильный арендный доход и сопровождение сделки под ключ.",
  keywords: [
    "коммерческая недвижимость",
    "коммерческая земля",
    "предварительный договор аренды",
    "готовый арендный бизнес",
    "ГАБ",
    "федеральный арендатор",
    "арендный доход",
    "инвестиции в недвижимость",
  ],
  authors: [{ name: "SHELBIT" }],
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: SITE_URL,
    siteName: "SHELBIT",
    title: "SHELBIT — коммерческая недвижимость с федеральными арендаторами",
    description:
      "Коммерческая земля с предварительным договором аренды от федеральной сети и готовый арендный бизнес (ГАБ) с надёжным федеральным арендатором. Стабильный доход под ключ.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SHELBIT — коммерческая недвижимость с федеральными арендаторами",
    description:
      "Коммерческая земля с предварительным договором аренды и готовый арендный бизнес с федеральным арендатором. Стабильный арендный доход под ключ.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0F0E",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';
import "../globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Perfect Blue - Portal Ogłoszeń Nieruchomości",
  description: "Znajdź idealne mieszkanie lub dom. Portal ogłoszeń nieruchomości z mapą i wyszukiwaniem.",
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Walidacja locale
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Pobierz tłumaczenia dla danego locale
  const messages = await getMessages({ locale });

  // Obsługa RTL dla arabskiego
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir}>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

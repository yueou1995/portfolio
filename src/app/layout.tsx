import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "next-themes";
import { portfolio } from "@/data/portfolio";
import "./globals.css";

const manrope = localFont({
  src: "../../node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2",
  variable: "--font-manrope",
  display: "swap",
  weight: "200 800",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://portfolio.ou-yue.workers.dev"),
  title: portfolio.metadata.title,
  description: portfolio.metadata.description,
  applicationName: `${portfolio.name} Portfolio`,
  authors: [{ name: portfolio.name }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    locale: "en_US",
    siteName: portfolio.name,
    title: portfolio.metadata.title,
    description: portfolio.metadata.description,
  },
  twitter: {
    card: "summary_large_image",
    title: portfolio.metadata.title,
    description: portfolio.metadata.description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${manrope.variable} antialiased`}>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="yue-portfolio-theme"
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <noscript>
          <style>{".theme-control { display: none; }"}</style>
        </noscript>
      </body>
    </html>
  );
}

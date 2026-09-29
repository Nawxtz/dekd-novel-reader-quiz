import type { Metadata, Viewport } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import { ThemeProvider, themeInitScript } from "@/context/ThemeContext";
import { I18nProvider } from "@/context/I18nContext";

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  display: "swap",
  variable: "--font-noto-thai",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Dek-D Novel Reader - Bookmarks & Novel Explorer",
  description:
    "Interactive Front-end Developer Intern Take-Home Quiz. Designed with Next.js 14, Tailwind CSS, TypeScript, and accessible WCAG features.",
  authors: [{ name: "Dek-D Interactive Frontend Candidate" }],
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#f96519",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning className={notoSansThai.variable}>
      <head>
        {/* Inline script to prevent theme flash (FOUC) before paint */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="font-sans min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] antialiased selection:bg-orange-100 selection:text-dekd-orange dark:selection:bg-orange-950 dark:selection:text-orange-300">
        <ThemeProvider>
          <I18nProvider>{children}</I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

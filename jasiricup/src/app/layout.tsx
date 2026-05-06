import "./globals.css";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { ThemeProvider } from "@/components/common/ThemeProvider";
import { LanguageProvider } from "@/components/common/LanguageToggle";
// 1. Import the CookieBanner
import { CookieBanner } from "@/components/common/CookieBanner";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JasiriCup - Empowering Women",
  description: "Menstrual products and adequate education.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${montserrat.className} overflow-x-hidden dark:bg-gray-950 transition-colors duration-300`}>
        <ThemeProvider>
          <LanguageProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">
                {children}
              </main>
              {/* 2. Add the CookieBanner right above the Footer */}
              <CookieBanner />
              <Footer />
            </div>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
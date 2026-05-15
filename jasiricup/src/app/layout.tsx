import "./globals.css";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { ThemeProvider } from "@/components/common/ThemeProvider";
import { LanguageProvider } from "@/components/common/LanguageToggle";
import { CookieBanner } from "@/components/common/CookieBanner";
import { headers } from "next/headers";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JasiriCup - Empowering Women",
  description: "Menstrual products and adequate education.",
  // Define icons here
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico', // Update this to /favicon.ico if moved to root
    apple: '/favicon.ico',    // Update this to /favicon.ico if moved to root
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const nonce = headersList.get("x-nonce") || undefined;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${montserrat.className} overflow-x-hidden dark:bg-gray-950 transition-colors duration-300`}>
        <ThemeProvider nonce={nonce}>
          <LanguageProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">
                {children}
              </main>
              <CookieBanner />
              <Footer />
            </div>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import { Montserrat } from "next/font/google"; // Correct import for the font function
import "./globals.css"; // This line is crucial for global styles
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";

// Renamed the font instance variable to avoid conflict
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
    <html lang="en">
      {/* Apply the font to the body using the corrected variable name */}
      <body className={montserrat.className}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}

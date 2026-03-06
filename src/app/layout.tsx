import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Nunito } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { NoRightClick } from "@/components/NoRightClick";
import { TractionHeartbeat } from "@/components/TractionHeartbeat";

export const dynamic = "force-dynamic";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Element — Website Builds & Themes",
  description:
    "Portfolio of custom website builds and themes. We build fast, secure, and polished sites — from storefronts to dashboards. See our work and get in touch.",
};

export const viewport = { width: "device-width", initialScale: 1, maximumScale: 5 };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${nunito.variable} min-h-screen bg-element-black font-sans text-white antialiased`}
      >
        <NoRightClick />
        <TractionHeartbeat />
        <Providers>
          <Header />
          <main className="min-w-0">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

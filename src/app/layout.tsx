import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Nunito } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

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
  title: "Element - Reliable. Secure. Trusted.",
  description:
    "Element provides elite-level digital products, unbeatable value, and fast, friendly support. Optimized for performance. Designed for security.",
  viewport: { width: "device-width", initialScale: 1, maximumScale: 5 },
};

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
        <Providers>
          <Header />
          <main className="min-w-0">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

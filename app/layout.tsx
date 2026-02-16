import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeRegistry from "@/components/common/ThemeRegistry";
import DataInitializer from "@/components/common/DataInitializer";

export const metadata: Metadata = {
  title: "Memory App",
  description:
    "忘却曲線に基づく間隔反復学習で、知識を効率的に長期記憶へ定着させるWebアプリ",
};

import ToastProvider from "@/components/common/ToastProvider";

import { SessionProvider } from "next-auth/react";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <SessionProvider>
          <ThemeRegistry>
            <DataInitializer />
            <ToastProvider />
            {children}
          </ThemeRegistry>
        </SessionProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import ThemeRegistry from "@/components/common/ThemeRegistry";
import DataInitializer from "@/components/common/DataInitializer";

export const metadata: Metadata = {
  title: "Memory App",
  description:
    "忘却曲線に基づく間隔反復学習で、知識を効率的に長期記憶へ定着させるWebアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <ThemeRegistry>
          <DataInitializer />
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}

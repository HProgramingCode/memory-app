"use client";
import { useSession } from "next-auth/react";


/**
 * アプリ起動時にAPIからデータを取得するコンポーネント
 * layout.tsx に配置して全ページでデータを利用可能にする
 */
export default function DataInitializer() {
  const { status } = useSession();

  if (status !== "authenticated") return;

  return null;
}

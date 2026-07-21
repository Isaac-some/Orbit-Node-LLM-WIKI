import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "算子地图",
  description: "AI 数据服务平台的算子与工作流能力地图界面。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

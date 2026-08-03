import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "算子地图",
  description: "AI 数据服务平台的 Handler、Flow 与 Pipeline 能力目录。",
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

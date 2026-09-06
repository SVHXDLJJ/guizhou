import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '贵州心动旅行簿',
  description: '深圳出发，去贵阳和兴义刷到心动就收藏。',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

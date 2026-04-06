import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AISass - AI SaaS Platform',
  description: 'Build AI-powered applications with multi-tenant architecture',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
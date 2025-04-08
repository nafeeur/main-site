// src/app/layout.tsx
import './globals.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'pcrf.net:)',
  description: 'Hello World!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}

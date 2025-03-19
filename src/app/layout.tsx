import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/providers/ToastProvider';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'The Girl Next Door - Dein Erotikportal',
  description: 'Dein vertrauenswu00fcrdiges Erotikportal fu00fcr Escorts, Clubs und mehr.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <Providers>
          <ToastProvider />
          {children}
        </Providers>
      </body>
    </html>
  );
}

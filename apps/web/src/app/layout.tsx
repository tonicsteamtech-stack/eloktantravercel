import type { Metadata, Viewport } from 'next';
import './globals.css';
import ClientProviders from './client-providers';
import Navbar from '@/components/Navbar';
import React from 'react';

export const metadata: Metadata = {
  title: 'eLoktantra | Digital Election Portal — Election Commission of India',
  description: 'Official digital voting and civic transparency portal of India. Conduct secure elections, verify candidates, file grievances, and cast your vote — powered by DigiLocker, AI & Blockchain.',
  keywords: 'eloktantra, digital voting, India election, Election Commission, DigiLocker, ECI, online voting, ballot, democracy',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#003087',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased overflow-x-hidden">
        <ClientProviders>
          <Navbar />
          {/* 
            Navbar height breakdown:
            - 6px tricolor bar
            - ~70px header (logo row)
            - ~38px nav strip (desktop)
            = ~114px total
          */}
          <main style={{ paddingTop: '114px', minHeight: '100vh', width: '100%', maxWidth: '100vw' }}>
            {children}
          </main>
        </ClientProviders>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ProductScout — Discover Real Problems & Software Products Worth Building',
  description: 'ProductScout monitors authentic discussions across operator communities, extracts validated user problems, analyzes market gaps, and formulates 20-field opportunity profiles with narrow MVP scopes.',
  keywords: ['Product Discovery', 'Market Research', 'SaaS Validation', 'Startup Ideas', 'Operator Friction', 'CevonX'],
  authors: [{ name: 'CevonX' }],
  openGraph: {
    title: 'ProductScout — Discovers real problems and identifies software products worth building.',
    description: 'Evidence-backed market intelligence for software founders, operators, and product managers.',
    type: 'website',
    siteName: 'ProductScout',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ProductScout — Product Discovery Radar',
    description: 'Discovers real problems and identifies software products worth building.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#08080a] text-zinc-300 min-h-screen antialiased selection:bg-white/20 selection:text-white`}>
        {children}
      </body>
    </html>
  );
}

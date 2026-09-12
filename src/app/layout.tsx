import type { Metadata, Viewport } from 'next';
import { Fredoka, Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/layout/Providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const fredoka = Fredoka({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Guess The Imposter 🇮🇳 - Play. Talk. Bluff. Suspect. Vote.',
  description: 'A colorful, animated Indian-inspired social deduction party game. Create rooms, give clues, catch the imposter!',
  keywords: ['party game', 'social deduction', 'imposter', 'multiplayer', 'online game', 'friends'],
  authors: [{ name: 'Guess The Imposter Team' }],
  creator: 'Guess The Imposter',
  publisher: 'Guess The Imposter',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://guesstheimposter.com',
    title: 'Guess The Imposter 🇮🇳',
    description: 'One secret. One liar. Can you catch them?',
    siteName: 'Guess The Imposter',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Guess The Imposter - Indian Party Game',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guess The Imposter 🇮🇳',
    description: 'One secret. One liar. Can you catch them?',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#f97316',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${fredoka.variable} font-sans antialiased`}>
      <body className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
import { Inter } from 'next/font/google';
import './globals.css';

// 1. Context Providers
import { CartProvider } from '@/context/CartContext';
import { UserProvider } from '@/context/UserContext';

// 2. Navigation & Layout Components
import TopNav from '@/components/TopNav';
import SubNav from '@/components/SubNav';
import FooterWrapper from '@/components/FooterWrapper';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '900'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL('https://www.critipick.com'),
  title: {
    default: 'Critipick | Shop Smarter, Reviewed Better',
    template: '%s | Critipick',
  },
  description:
    'Critipick is a review-driven e-commerce marketplace for Fashion, Electronics, Beauty, Books, Home, Sports, Kids and more — shop products backed by honest, verified reviews.',
  keywords: [
    'Critipick',
    'e-commerce',
    'online shopping',
    'product reviews',
    'marketplace',
  ],
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Critipick | Shop Smarter, Reviewed Better',
    description:
      'A review-driven e-commerce marketplace across Fashion, Electronics, Beauty, Books, Home, Sports and Kids.',
    siteName: 'Critipick',
    type: 'website',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#131921',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans bg-hero-gradient min-h-screen flex flex-col overflow-x-hidden">
        <UserProvider>
          <CartProvider>
            <TopNav />
            <SubNav />

            <main className="flex-1 flex flex-col">{children}</main>

            <FooterWrapper />
          </CartProvider>
        </UserProvider>
      </body>
    </html>
  );
}
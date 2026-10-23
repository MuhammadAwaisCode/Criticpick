'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function FooterWrapper() {
  const pathname = usePathname();

  // Jin pages par Footer NAHI dikhana, unke routes yahan hain:
  const hideFooter =
    pathname.startsWith('/signin') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password');

  // Agar login ya signup page hai toh Footer render nahi hoga
  if (hideFooter) {
    return null;
  }

  return <Footer />;
}
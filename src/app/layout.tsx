import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Happybee - Healthy Food, Delivered to Your Community',
  description:
    'Order from trusted health brands. Preorder fresh food for weekend delivery to your community address. Happybee makes healthy eating intentional, calm, and community-focused.',
  keywords:
    'healthy food, food preorder, community delivery, salads, sprouts, nut mixes, oils, health brands',
  openGraph: {
    title: 'Happybee - Healthy Food, Delivered to Your Community',
    description: 'Order from trusted health brands. Preorder fresh food for weekend delivery.',
    type: 'website',
  },
  icons: {
    icon: '/chutney-club-icon.png',
    shortcut: '/chutney-club-icon.png',
    apple: '/chutney-club-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}

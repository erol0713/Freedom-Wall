import { Playfair_Display, Inter, Caveat } from 'next/font/google';
import './globals.css';
import Navbar from './components/Navbar';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-handwriting',
  display: 'swap',
});

export const metadata = {
  title: 'Freedom Wall — Speak Freely, Stay Anonymous',
  description:
    'An anonymous confession wall where you can share your thoughts, confessions, rants, and messages without revealing your identity. Add your favorite songs and connect through words.',
  keywords: ['anonymous', 'confession', 'freedom wall', 'thoughts', 'rant', 'music'],
  openGraph: {
    title: 'Freedom Wall',
    description: 'Speak freely. Stay anonymous.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} ${caveat.variable}`}>
      <body className="bg-dark-bg text-white antialiased font-body min-h-screen">
        {/* Background effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/3 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <Navbar />
          {children}
        </div>
      </body>
    </html>
  );
}

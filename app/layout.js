import { Playfair_Display, Inter, Caveat } from 'next/font/google';
import './globals.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ParticleBackground from './components/ParticleBackground';
import { WallProvider } from './components/WallContext';

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
    'A digital sanctuary for expression. Share your thoughts, confessions, and messages anonymously on the Freedom Wall.',
  keywords: ['anonymous', 'freedom wall', 'thoughts', 'expression', 'sanctuary'],
  openGraph: {
    title: 'Freedom Wall — A Digital Sanctuary for Expression',
    description: 'Speak freely. Stay anonymous. A living wall of thoughts.',
    type: 'website',
  },
  verification: {
    google: 'L7l2uoiId-69z0GIYIMeFTwL1QQb4FmUhJUMwLjRuQU',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} ${caveat.variable}`}>
      <body className="bg-dark-bg text-white antialiased font-body min-h-screen">
        {/* Particle background */}
        <ParticleBackground />

        {/* Content */}
        <WallProvider>
          <div className="relative z-10 flex flex-col min-h-screen">
            <Navbar />
            <div className="flex-1">
              {children}
            </div>
            <Footer />
          </div>
        </WallProvider>
      </body>
    </html>
  );
}

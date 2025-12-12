import { Poppins, Tenor_Sans } from 'next/font/google';
import './globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import Providers from '@/components/providers/Providers';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

const tenorSans = Tenor_Sans({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-tenor-sans',
  display: 'swap',
});

export const metadata = {
  title: 'Pave - Real Estate CRM & Messaging Platform',
  description: 'Streamline your real estate business with Pave - the all-in-one CRM and messaging platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${poppins.variable} ${tenorSans.variable}`}>
      <body className={poppins.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

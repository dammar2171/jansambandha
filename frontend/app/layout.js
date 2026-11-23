import { Roboto, Source_Serif_4 } from 'next/font/google';
import './globals.css';

const roboto = Roboto({
  variable: '--font-roboto',
  subsets: ['latin'],
});

const sourceSerif = Source_Serif_4({
  variable: '--font-source-serif',
  subsets: ['latin'],
  weight: ['600'],
});

export const metadata = {
  title: 'JanSambandha',
  description:
    'Local government annual planning, project evaluation and citizen engagement',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang='en'
      className={`${roboto.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className='min-h-full font-sans'>{children}</body>
    </html>
  );
}

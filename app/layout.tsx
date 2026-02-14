import './globals.css';
import type { Metadata } from 'next';


export const metadata: Metadata = {
  metadataBase: new URL('https://salama.vercel.app'),
  title: 'الفحص الفني الدوري',
  description: 'الفحص الفني الدوري  خدمة فحص فني متميزة لضمان سلامة مركبتك  حجز موعد الفحص الفني',
  openGraph: {
    images: [
      {
        url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/9b/aa/a7/9baaa70a-0a82-cab9-5310-b8b3fd40eaec/AppIcon-0-0-1x_U007emarketing-0-11-0-85-220.png/1200x630wa.png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: [
      {
        url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/9b/aa/a7/9baaa70a-0a82-cab9-5310-b8b3fd40eaec/AppIcon-0-0-1x_U007emarketing-0-11-0-85-220.png/1200x630wa.png',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body >{children}</body>
    </html>
  );
}

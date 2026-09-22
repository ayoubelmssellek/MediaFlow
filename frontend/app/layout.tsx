import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://mediaflow.ai'),
  title: { default: 'MediaFlow AI | Move media beautifully', template: '%s | MediaFlow AI' },
  description: 'A clean media utility for downloading public video and resizing images locally in your browser.',
  alternates: { canonical: '/' },
  openGraph: { title: 'MediaFlow AI', description: 'Download public media and resize images locally.', type: 'website', url: 'https://mediaflow.ai' },
  twitter: { card: 'summary_large_image', title: 'MediaFlow AI', description: 'A faster, cleaner media workspace.' }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

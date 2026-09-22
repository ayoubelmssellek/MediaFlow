import type { Metadata } from 'next';
import { JsonLd } from '@/components/json-ld';
import { Downloader } from '@/components/downloader';

const supported = ['youtube', 'tiktok', 'instagram', 'reddit', 'twitch', 'kick', 'facebook'];
export async function generateStaticParams() { return supported.map((platform) => ({ platform })); }
export async function generateMetadata({ params }: { params: { platform: string } }): Promise<Metadata> {
  const platform = params.platform.charAt(0).toUpperCase() + params.platform.slice(1);
  return { title: `${platform} video downloader`, description: `Download public ${platform} video with audio, preview, and quality options.`, alternates: { canonical: `/download/${params.platform}` } };
}
export default function PlatformPage({ params }: { params: { platform: string } }) {
  const platform = params.platform.charAt(0).toUpperCase() + params.platform.slice(1);
  return <main className="grid-paper min-h-screen"><JsonLd platform={platform} /><div className="mx-auto max-w-5xl px-5 py-12 md:px-8 md:py-20"><a href="/" className="text-sm font-bold text-moss">← mediaflow</a><header className="pb-10 pt-16"><p className="mb-3 text-xs font-bold uppercase tracking-[.18em] text-coral">{platform} utility</p><h1 className="font-display text-5xl font-black tracking-[-.05em] md:text-6xl">{platform} downloads,<br /><span className="text-moss">without the noise.</span></h1><p className="mt-5 max-w-xl text-base leading-7 text-ink/60">Inspect a public link, preview the media, and choose the quality you actually need.</p></header><Downloader /></div></main>;
}

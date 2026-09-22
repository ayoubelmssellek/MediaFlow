import type { Metadata } from 'next';
import { JsonLd } from '@/components/json-ld';
import { ImageResizer } from '@/components/image-resizer';

const supported = ['youtube-thumbnail', 'instagram-post', 'instagram-story', 'tiktok', 'reddit-banner'];
export async function generateStaticParams() { return supported.map((target) => ({ target })); }
export async function generateMetadata({ params }: { params: { target: string } }): Promise<Metadata> {
  const target = params.target.replaceAll('-', ' ');
  return { title: `${target} image resizer`, description: `Resize and convert images for ${target} locally in your browser.`, alternates: { canonical: `/resize/${params.target}` } };
}
export default function ResizePage({ params }: { params: { target: string } }) {
  const target = params.target.replaceAll('-', ' ');
  return <main className="grid-paper min-h-screen"><JsonLd target={target} /><div className="mx-auto max-w-5xl px-5 py-12 md:px-8 md:py-20"><a href="/" className="text-sm font-bold text-moss">← mediaflow</a><header className="pb-10 pt-16"><p className="mb-3 text-xs font-bold uppercase tracking-[.18em] text-coral">{target} preset</p><h1 className="font-display text-5xl font-black tracking-[-.05em] md:text-6xl">Make the frame<br /><span className="text-moss">fit the moment.</span></h1><p className="mt-5 max-w-xl text-base leading-7 text-ink/60">Crop, compress, and convert {target} images without sending your files to a server.</p></header><ImageResizer /></div></main>;
}

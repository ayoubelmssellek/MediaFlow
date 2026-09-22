'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, ImagePlus, LockKeyhole, RotateCcw, WandSparkles } from 'lucide-react';
import { Button, Input } from './ui';

type Preset = { id: string; label: string; width: number; height: number };
const presets: Preset[] = [
  { id: 'youtube', label: 'YouTube thumb', width: 1280, height: 720 },
  { id: 'instagram', label: 'IG post', width: 1080, height: 1080 },
  { id: 'story', label: 'Story / TikTok', width: 1080, height: 1920 },
  { id: 'reddit', label: 'Reddit banner', width: 1920, height: 384 }
];

export function ImageResizer() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [source, setSource] = useState<HTMLImageElement | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [preset, setPreset] = useState(presets[0]);
  const [width, setWidth] = useState(1280);
  const [height, setHeight] = useState(720);
  const [format, setFormat] = useState('image/webp');
  const [quality, setQuality] = useState(82);
  const [targetKB, setTargetKB] = useState(2048);
  const [lock, setLock] = useState(true);
  const [status, setStatus] = useState('Drop an image to begin');
  const [output, setOutput] = useState<Blob | null>(null);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function loadFile(file?: File) {
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => { setSource(image); setStatus(`${image.naturalWidth} x ${image.naturalHeight} source loaded`); render(image, width, height, format, quality); URL.revokeObjectURL(url); };
    image.src = url;
  }

  function render(image = source, outputWidth = width, outputHeight = height, mime = format, compression = quality) {
    if (!image) return;
    const canvas = document.createElement('canvas');
    canvas.width = outputWidth; canvas.height = outputHeight;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.fillStyle = '#ffffff'; context.fillRect(0, 0, outputWidth, outputHeight);
    const scale = Math.max(outputWidth / image.naturalWidth, outputHeight / image.naturalHeight);
    const drawnWidth = image.naturalWidth * scale; const drawnHeight = image.naturalHeight * scale;
    context.drawImage(image, (outputWidth - drawnWidth) / 2, (outputHeight - drawnHeight) / 2, drawnWidth, drawnHeight);
    canvas.toBlob((blob) => { if (blob) { if (blob.size > targetKB * 1024 && compression > 20 && mime !== 'image/png') { render(image, outputWidth, outputHeight, mime, compression - 5); return; } setOutput(blob); setPreview(URL.createObjectURL(blob)); setStatus(`${Math.round(blob.size / 1024)} KB ready`); } }, mime, compression / 100);
  }

  function choosePreset(next: Preset) { setPreset(next); setWidth(next.width); setHeight(next.height); render(source, next.width, next.height); }
  function changeWidth(value: number) { setWidth(value); if (lock && source) { const ratio = height / width; const nextHeight = Math.round(value * ratio); setHeight(nextHeight); render(source, value, nextHeight); } else render(source, value, height); }
  function reset() { setSource(null); setOutput(null); setPreview(''); setStatus('Drop an image to begin'); }

  return <section className="overflow-hidden rounded-[2rem] border border-line bg-white shadow-soft">
    <div className="border-b border-line p-6 md:p-8">
      <div className="mb-6 flex items-start justify-between gap-4"><div><p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-coral">Local studio</p><h2 className="font-display text-2xl font-bold tracking-tight">Resize, crop, ship.</h2><p className="mt-2 max-w-md text-sm leading-6 text-ink/55">Your image never leaves this tab. Tune the frame, export format, and file weight in seconds.</p></div><WandSparkles className="mt-1 text-coral" size={22} /></div>
      <div className="grid gap-3 sm:grid-cols-2"><button onClick={() => inputRef.current?.click()} className="flex min-h-28 flex-col items-center justify-center rounded-2xl border border-dashed border-moss/35 bg-mint/35 p-4 text-center transition hover:bg-mint/65"><ImagePlus className="mb-2 text-moss" /><span className="text-sm font-bold">Choose an image</span><span className="mt-1 text-xs text-ink/50">PNG, JPG, WebP up to 20 MB</span></button><div className="grid min-h-28 place-items-center rounded-2xl bg-paper p-4 text-center">{preview ? <img src={preview} alt="Processed preview" className="max-h-28 max-w-full rounded-lg object-contain" /> : <div><LockKeyhole className="mx-auto mb-2 text-moss/50" size={20} /><span className="text-xs text-ink/50">100% browser-side processing</span></div>}</div></div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(event) => loadFile(event.target.files?.[0])} />
    </div>
    <div className="grid gap-8 p-6 md:grid-cols-[1fr_1.2fr] md:p-8">
      <div><label className="mb-3 block text-xs font-bold uppercase tracking-[.16em] text-ink/45">Presets</label><div className="flex flex-wrap gap-2">{presets.map((item) => <button key={item.id} onClick={() => choosePreset(item)} className={`rounded-full border px-3 py-2 text-xs font-bold transition ${preset.id === item.id ? 'border-moss bg-moss text-white' : 'border-line bg-paper text-ink/65 hover:border-moss/45'}`}>{item.label}</button>)}</div><div className="mt-7 grid grid-cols-2 gap-3"><div><label className="mb-2 block text-xs font-bold text-ink/50">Width</label><Input type="number" min={1} value={width} onChange={(event) => changeWidth(Number(event.target.value))} /></div><div><label className="mb-2 block text-xs font-bold text-ink/50">Height</label><Input type="number" min={1} value={height} onChange={(event) => { const next = Number(event.target.value); setHeight(next); render(source, width, next); }} /></div></div><button onClick={() => setLock(!lock)} className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-moss"><LockKeyhole size={14} /> {lock ? 'Aspect locked' : 'Aspect unlocked'}</button></div>
      <div className="space-y-6"><div><div className="mb-2 flex justify-between text-xs font-bold text-ink/50"><label>Quality</label><span>{quality}%</span></div><input className="w-full accent-coral" type="range" min="20" max="100" value={quality} onChange={(event) => { const next = Number(event.target.value); setQuality(next); render(source, width, height, format, next); }} /></div><div className="flex items-center gap-3"><label className="text-xs font-bold text-ink/50">Format</label><select value={format} onChange={(event) => { setFormat(event.target.value); render(source, width, height, event.target.value, quality); }} className="h-10 flex-1 rounded-xl border border-line bg-paper px-3 text-sm outline-none"><option value="image/webp">WebP - fastest</option><option value="image/jpeg">JPG - compatible</option><option value="image/png">PNG - lossless</option><option value="image/avif">AVIF - smallest</option></select></div><div className="flex items-center gap-3"><label className="text-xs font-bold text-ink/50">Under</label><Input type="number" min={50} value={targetKB} onChange={(event) => setTargetKB(Number(event.target.value))} className="h-10" /><span className="text-xs font-bold text-ink/45">KB target</span></div><div className="flex flex-wrap gap-3 pt-2"><Button onClick={() => output && (Object.assign(document.createElement('a'), { href: URL.createObjectURL(output), download: `mediaflow-${preset.id}.${format.split('/')[1]}` })).click()} disabled={!output} className="bg-coral text-white"><Download size={16} /> Download image</Button><Button onClick={reset} className="bg-paper text-ink"><RotateCcw size={16} /> Reset</Button></div><p className="text-xs text-ink/45">{status}. Export is rendered with HTML Canvas and stays on your device.</p></div>
    </div>
  </section>;
}

type JsonLdProps = { platform?: string; target?: string };

export function JsonLd({ platform, target }: JsonLdProps) {
  const label = platform ? `${platform} video downloader` : target ? `${target} image resizer` : 'media toolkit';
  const data = [
    { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'MediaFlow AI', applicationCategory: 'MultimediaApplication', operatingSystem: 'Web', description: `A fast ${label} for public media.` },
    { '@context': 'https://schema.org', '@type': 'HowTo', name: `How to use the ${label}`, step: [{ '@type': 'HowToStep', position: 1, name: 'Add your media', text: 'Paste a public URL or choose an image from your device.' }, { '@type': 'HowToStep', position: 2, name: 'Choose output', text: 'Select a quality, aspect ratio, or output format.' }, { '@type': 'HowToStep', position: 3, name: 'Export', text: 'Preview and download your result.' }] },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [{ '@type': 'Question', name: 'Does MediaFlow store my images?', acceptedAnswer: { '@type': 'Answer', text: 'No. Image processing happens locally in your browser.' } }, { '@type': 'Question', name: 'Can I download private media?', acceptedAnswer: { '@type': 'Answer', text: 'No. Only media you are authorized to access and that the platform makes available can be processed.' } }] }
  ];
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

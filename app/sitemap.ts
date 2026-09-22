import type { MetadataRoute } from 'next';

const platforms = ['youtube', 'tiktok', 'instagram', 'reddit', 'twitch', 'kick', 'facebook'];
const targets = ['youtube-thumbnail', 'instagram-post', 'instagram-story', 'tiktok', 'reddit-banner'];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://mediaflow.ai', lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    ...platforms.map((platform) => ({ url: `https://mediaflow.ai/download/${platform}`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: .8 })),
    ...targets.map((target) => ({ url: `https://mediaflow.ai/resize/${target}`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: .7 }))
  ];
}

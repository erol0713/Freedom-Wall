export default function sitemap() {
  return [
    {
      url: 'https://freedom-wall-liart.vercel.app',
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1,
    },
    {
      url: 'https://freedom-wall-liart.vercel.app/create',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://freedom-wall-liart.vercel.app/archive',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ]
}

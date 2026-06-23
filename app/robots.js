export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/keys', '/api/'],
    },
    sitemap: 'https://freedom-wall-liart.vercel.app/sitemap.xml',
  }
}

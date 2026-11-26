import type { MetadataRoute } from 'next';
import { absoluteUrl, homeSeo, legalSeo, quizSeo } from '../lib/seo.js';

export const dynamic = 'force-dynamic';

export default function sitemap(): MetadataRoute.Sitemap {
  return [homeSeo, ...Object.values(quizSeo), ...Object.values(legalSeo)]
    .map(({path}) => ({url: absoluteUrl(path)}));
}

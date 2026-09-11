import { useEffect } from 'react';

type PageType = 'website' | 'article';

export interface SeoConfig {
  title: string;
  description: string;
  path?: string;
  image?: string;
  keywords?: string;
  locale?: string;
  type?: PageType;
  siteName?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

function upsertMeta(attr: 'name' | 'property', key: string, value: string) {
  let tag = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', value);
}

function upsertCanonical(url: string) {
  let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

function upsertJsonLd(jsonLd: SeoConfig['jsonLd']) {
  const id = 'seo-json-ld';
  let script = document.getElementById(id) as HTMLScriptElement | null;

  if (!jsonLd) {
    script?.remove();
    return;
  }

  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    document.head.appendChild(script);
  }

  script.textContent = JSON.stringify(jsonLd);
}

export function useSEO(config: SeoConfig) {
  useEffect(() => {
    const {
      title,
      description,
      path,
      image = '/logo.jpeg',
      keywords,
      locale = 'en_PK',
      type = 'website',
      siteName = 'Jamia Taleem-ul-Quran Lil-Banat',
      twitterCard = 'summary_large_image',
      noindex = false,
      jsonLd,
    } = config;

    const origin = window.location.origin;
    const normalizedPath = path ?? window.location.pathname;
    const canonical = new URL(normalizedPath, origin).toString();
    const imageUrl = new URL(image, origin).toString();

    document.title = title;
    document.documentElement.setAttribute('lang', locale.toLowerCase().startsWith('ur') ? 'ur' : 'en');

    upsertMeta('name', 'description', description);
    if (keywords) upsertMeta('name', 'keywords', keywords);
    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow, noarchive' : 'index, follow, max-image-preview:large');
    upsertMeta('name', 'theme-color', '#e4572e');

    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:url', canonical);
    upsertMeta('property', 'og:image', imageUrl);
    upsertMeta('property', 'og:locale', locale);
    upsertMeta('property', 'og:site_name', siteName);

    upsertMeta('name', 'twitter:card', twitterCard);
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', imageUrl);

    upsertCanonical(canonical);
    upsertJsonLd(jsonLd);
  }, [config]);
}

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const OG_LOCALES: Record<string, string> = {
  en: 'en_US',
  ar: 'ar_IQ',
  ku: 'ku_IQ',
};

const SITE_URL =
  (typeof window !== 'undefined' ? window.location.origin : '') || 'https://edupay.iq';

function setMeta(selector: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    // Create meta if missing — handles fresh apps without index.html OG tags.
    const m = selector.match(/\[(name|property)="([^"]+)"\]/);
    if (!m) return;
    el = document.createElement('meta');
    el.setAttribute(m[1]!, m[2]!);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]:not([hreflang])`);
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

function ensureHreflang(lang: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(
    `link[rel="alternate"][hreflang="${lang}"]`
  );
  if (!el) {
    el = document.createElement('link');
    el.rel = 'alternate';
    el.setAttribute('hreflang', lang);
    document.head.appendChild(el);
  }
  el.href = href;
}

export function LandingSeo() {
  const { i18n, t } = useTranslation();
  const lang = i18n.resolvedLanguage ?? 'en';
  const title = t('landing.meta.title');
  const description = t('landing.meta.description');
  const url = `${SITE_URL}/?lng=${lang}`;

  useEffect(() => {
    document.title = title;
    setMeta('meta[name="description"]', description);
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[property="og:url"]', url);
    setMeta('meta[property="og:type"]', 'website');
    setMeta('meta[property="og:site_name"]', 'EduPay');
    setMeta('meta[property="og:locale"]', OG_LOCALES[lang] ?? 'en_US');
    setMeta('meta[name="twitter:card"]', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', title);
    setMeta('meta[name="twitter:description"]', description);
    setLink('canonical', url);
    ensureHreflang('en', `${SITE_URL}/?lng=en`);
    ensureHreflang('ar', `${SITE_URL}/?lng=ar`);
    ensureHreflang('ku', `${SITE_URL}/?lng=ku`);
    ensureHreflang('x-default', `${SITE_URL}/`);
  }, [title, description, url, lang]);

  return null;
}

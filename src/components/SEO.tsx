import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://adrianidea.ir';
const OG_IMAGE = `${SITE_URL}/og.png`;

interface SEOProps {
  title: string;
  description: string;
  path: string;
  lang?: 'fa' | 'en';
  robots?: string;
  jsonLd?: object;
}

export const SEO = ({ title, description, path, lang = 'fa', robots, jsonLd }: SEOProps) => {
  const cleanPath = path === '/' ? '' : path.replace(/\/$/, '');
  const canonical = lang === 'en'
    ? `${SITE_URL}/en${cleanPath}`
    : `${SITE_URL}${cleanPath || '/'}`;
  const faUrl = `${SITE_URL}${cleanPath || '/'}?lang=fa`;
  const enUrl = `${SITE_URL}${cleanPath || '/'}?lang=en`;
  const xDefault = `${SITE_URL}${cleanPath || '/'}`;
  const ogLocale = lang === 'fa' ? 'fa_IR' : 'en_US';
  const altLocale = lang === 'fa' ? 'en_US' : 'fa_IR';

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {robots && <meta name="robots" content={robots} />}

      <link rel="canonical" href={canonical} />
      <link rel="alternate" hrefLang="fa" href={faUrl} />
      <link rel="alternate" hrefLang="en" href={enUrl} />
      <link rel="alternate" hrefLang="x-default" href={xDefault} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content={ogLocale} />
      <meta property="og:locale:alternate" content={altLocale} />
      <meta property="og:site_name" content="Adrian Idea" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={OG_IMAGE} />

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
};

export default SEO;

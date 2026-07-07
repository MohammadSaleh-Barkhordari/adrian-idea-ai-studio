import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { homeCopy } from '@/translations/home';
import { HomeShell, PageHero, SecHead, FinalCTA } from '@/components/home/shared';
import elecompImage from '@/assets/elecomp-2025-exhibition.png';

const BlogPage = () => {
  const { language, t: appT } = useLanguage();
  const t = homeCopy[language].blog;
  const langPrefix = language === 'en' ? '/en' : '';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(t.allCategory);

  const posts = (appT?.blog?.posts || []).map((p: any) =>
    p.slug === 'elecomp-2025-exhibition-analysis'
      ? { ...p, image: elecompImage, imageLarge: elecompImage }
      : p
  );

  const catNames = new Set<string>();
  posts.forEach((p: any) => { if (p.category) catNames.add(p.category); });
  const categories = [t.allCategory, ...Array.from(catNames)];

  const filtered = posts.filter((p: any) => {
    const s = searchTerm.toLowerCase();
    const matchS = !s || p.title.toLowerCase().includes(s) || p.excerpt.toLowerCase().includes(s);
    const matchC = selectedCategory === t.allCategory || p.category === selectedCategory;
    return matchS && matchC;
  });

  return (
    <HomeShell>
      <PageHero
        crumb={t.crumb}
        titleHtml={<>{t.titlePre}<br /><span className="serif">{t.titleSerif}</span></>}
        intro={t.intro}
      />

      <section>
        <div className="wrap">
          <SecHead index={t.poIndex} titlePre={t.poTitlePre} titleSerif={t.poTitleSerif} />

          <div className="blog-tools">
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="blog-empty">
              <p>{t.empty}</p>
              <button onClick={() => { setSearchTerm(''); setSelectedCategory(t.allCategory); }}>{t.clear}</button>
            </div>
          ) : (
            <div className="post-grid">
              {filtered.map((p: any) => (
                <Link className="post-card fade-up" key={p.id} to={`${langPrefix}/blog/${p.slug}`}>
                  {p.image && <img className="post-img" src={p.image} alt={p.title} loading="lazy" />}
                  <div className="post-meta">
                    <span className="cat">{p.category}</span>
                    <span>{p.readTime}</span>
                  </div>
                  <h3>{p.title}</h3>
                  <p>{p.excerpt}</p>
                  <span className="read">{t.readMore} ↗</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <FinalCTA
        titleParts={{ l1: t.ctaTitleL1, l2Serif: t.ctaTitleL2Serif }}
        p={t.ctaP}
        cta1={t.ctaBtn1} cta1Href="/contact"
        cta2={t.ctaBtn2} cta2Href="https://adrianidea.ir/blog" cta2External
      />
    </HomeShell>
  );
};

export default BlogPage;

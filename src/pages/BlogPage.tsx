import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { homeCopy } from '@/translations/home';
import { HomeShell, PageHero, FinalCTA } from '@/components/home/shared';
import { SEO } from '@/components/SEO';

const BlogPage = () => {
  const { language } = useLanguage();
  const t = homeCopy[language].blog;

  return (
    <HomeShell>
      <SEO
        path="/blog"
        lang={language}
        title="Blog — Adrian Idea"
        description="The Adrian Idea blog — applied AI insights, case notes, and studio updates. New writing coming soon; in the meantime, get in touch to talk shop."
        robots="noindex, follow"
      />
      <PageHero
        crumb={t.crumb}
        titleHtml={<>{t.titlePre}<br /><span className="serif">{t.titleSerif}</span></>}
        intro={t.intro}
      />

      <section>
        <div className="wrap" style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div className="sec-index" style={{ marginBottom: 18 }}>{t.poIndex}</div>
          <h2 className="sec-title" style={{ marginBottom: 24 }}>
            <span className="serif">Coming soon</span>
          </h2>
          <p style={{ color: 'var(--ink-dim)', maxWidth: '52ch', margin: '0 auto 36px', lineHeight: 1.6 }}>
            We're preparing the first pieces of writing from the studio — applied AI notes, case
            breakdowns, and behind-the-scenes work. In the meantime, reach out directly if there's
            a topic you'd like us to cover, or a project you'd like to discuss.
          </p>
          <Link to="/contact" className="btn btn-fill magnetic" data-cursor="start">
            <span>{t.ctaBtn1 || 'Get in touch'}</span>
          </Link>
        </div>
      </section>

      <FinalCTA
        titleParts={{ l1: t.ctaTitleL1, l2Serif: t.ctaTitleL2Serif }}
        p={t.ctaP}
        cta1={t.ctaBtn1} cta1Href="/contact"
        cta2={t.ctaBtn2} cta2Href="/services"
      />
    </HomeShell>
  );
};

export default BlogPage;

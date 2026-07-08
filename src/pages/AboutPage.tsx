import { useLanguage } from '@/contexts/LanguageContext';
import { homeCopy } from '@/translations/home';
import { HomeShell, PageHero, SecHead, FinalCTA, Counter } from '@/components/home/shared';
import { SEO } from '@/components/SEO';

const AboutPage = () => {
  const { language } = useLanguage();
  const t = homeCopy[language].about;

  return (
    <HomeShell>
      <SEO
        path="/about"
        lang={language}
        title="About — Adrian Idea"
        description="Meet Adrian Idea (آدرین ایده کوشا): our mission, vision, values, and the milestones shaping our practical AI studio for measurable business impact."
      />
      <PageHero
        crumb={t.crumb}
        titleHtml={<>{t.titlePre}<br /><span className="serif">{t.titleSerif}</span></>}
        intro={t.intro}
      />

      <section>
        <div className="wrap">
          <SecHead index={t.mvIndex} titlePre={t.mvTitlePre} titleSerif={t.mvTitleSerif} />
          <div className="value-grid">
            {[t.mission, t.vision].map((v, i) => (
              <div className="value-card fade-up" key={i}>
                <span className="v-num">{v.tag}</span>
                <h3>{v.h}</h3>
                <p>{v.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="stat-row">
            {t.stats.map((s, i) => (
              <div className="stat-box fade-up" key={i}>
                <Counter target={s.target} decimals={s.decimals} unit={s.unit} />
                <small>{s.label}</small>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ borderTop: '1px solid var(--line)' }}>
        <div className="wrap">
          <SecHead index={t.valIndex} titlePre={t.valTitlePre} titleSerif={t.valTitleSerif} />
          <div className="value-grid">
            {t.values.map((v, i) => (
              <div className={`value-card fade-up${(v as any).wide ? ' wide' : ''}`} key={i}>
                <span className="v-num">{v.tag}</span>
                <h3>{v.h}</h3>
                <p>{v.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ borderTop: '1px solid var(--line)' }}>
        <div className="wrap">
          <SecHead index={t.tlIndex} titlePre={t.tlTitlePre} titleSerif={t.tlTitleSerif} />
          <div className="timeline">
            {t.timeline.map((it, i) => (
              <div className="tl-item fade-up" key={i}>
                <span className="tl-date">{it.date}</span>
                <h3>{it.h}</h3>
                <p>{it.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FinalCTA
        titleParts={{ l1: t.ctaTitleL1, l2Pre: t.ctaTitleL2Pre, l2Serif: t.ctaTitleL2Serif }}
        p={t.ctaP}
        cta1={t.ctaBtn1} cta1Href="/contact"
        cta2={t.ctaBtn2} cta2Href="/case-studies"
      />
    </HomeShell>
  );
};

export default AboutPage;

import { useLanguage } from '@/contexts/LanguageContext';
import { homeCopy } from '@/translations/home';
import { HomeShell, PageHero, SecHead, FinalCTA } from '@/components/home/shared';

const AIPhilosophyPage = () => {
  const { language } = useLanguage();
  const t = homeCopy[language].philosophy;

  return (
    <HomeShell>
      <PageHero
        crumb={t.crumb}
        titleHtml={<>{t.titlePre}<br /><span className="serif">{t.titleSerif}</span></>}
        intro={t.intro}
      />

      <section>
        <div className="wrap">
          <SecHead index={t.plIndex} titlePre={t.plTitlePre} titleSerif={t.plTitleSerif} />
          {t.pillars.map((p, i) => (
            <div className="pillar fade-up" key={i}>
              <div className="pillar-num">{p.n}</div>
              <div>
                <h3>{p.h}</h3>
                <p>{p.p}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="manifesto" aria-label="Method" style={{ borderTop: '1px solid var(--line)' }}>
        <span className="label fade-up">{t.meLabel}</span>
        <blockquote className="fade-up">
          {t.meQuotePre}<em>{t.meQuoteEm}</em>{t.meQuotePost}
        </blockquote>
        <div className="sign fade-up">{t.meSignPre}<b>{t.meSignBold}</b></div>
      </section>

      <section style={{ borderTop: '1px solid var(--line)' }}>
        <div className="wrap">
          <SecHead index={t.cmIndex} titlePre={t.cmTitlePre} titleSerif={t.cmTitleSerif} />
          <div className="commit-grid">
            {t.commits.map((c, i) => (
              <div className="value-card fade-up" key={i}>
                <span className="v-num">{c.tag}</span>
                <h3>{c.h}</h3>
                <p>{c.p}</p>
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

export default AIPhilosophyPage;

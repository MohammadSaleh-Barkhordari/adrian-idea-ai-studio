import { useLanguage } from '@/contexts/LanguageContext';
import { homeCopy } from '@/translations/home';
import { HomeShell, PageHero, SecHead, FinalCTA } from '@/components/home/shared';

const CaseStudiesPage = () => {
  const { language } = useLanguage();
  const t = homeCopy[language].cases;

  return (
    <HomeShell>
      <PageHero
        crumb={t.crumb}
        titleHtml={<>{t.titlePre}<br /><span className="serif">{t.titleSerif}</span></>}
        intro={t.intro}
      />

      <section>
        <div className="wrap">
          <SecHead index={t.csIndex} titlePre={t.csTitlePre} titleSerif={t.csTitleSerif} />
          <div className="case-grid">
            {t.items.map((c, i) => (
              <article className={`case-card fade-up${(c as any).featured ? ' featured' : ''}`} key={i}>
                <div className="case-top">
                  <span className="case-industry">{c.industry}</span>
                  <span className="case-num">{c.num}</span>
                </div>
                <h3>{c.h}</h3>
                <p className="case-body">
                  <b>{t.problemLabel}</b> {c.problem} <b>{t.solutionLabel}</b> {c.solution}
                </p>
                <div className="case-metrics">
                  {c.metrics.map((m, j) => (
                    <span className="case-metric" key={j}>
                      {m.pre}<b>{m.bold}</b>{m.post}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <FinalCTA
        titleParts={{ l1: t.ctaTitleL1, l2Pre: t.ctaTitleL2Pre, l2Serif: t.ctaTitleL2Serif }}
        p={t.ctaP}
        cta1={t.ctaBtn1} cta1Href="/contact"
        cta2={t.ctaBtn2} cta2Href="/services"
      />
    </HomeShell>
  );
};

export default CaseStudiesPage;

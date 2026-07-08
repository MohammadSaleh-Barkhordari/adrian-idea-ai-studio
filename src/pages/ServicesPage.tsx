import { useLanguage } from '@/contexts/LanguageContext';
import { homeCopy } from '@/translations/home';
import { HomeShell, PageHero, SecHead, FinalCTA } from '@/components/home/shared';
import { SEO } from '@/components/SEO';

const ServicesPage = () => {
  const { language } = useLanguage();
  const t = homeCopy[language].services;

  return (
    <HomeShell>
      <SEO
        path="/services"
        lang={language}
        title="Services — Adrian Idea"
        description="Applied AI services from Adrian Idea: strategy, automation, custom ML models, LLM integration, computer vision, and production-ready deployment."
      />
      <PageHero
        crumb={t.crumb}
        titleHtml={<>{t.titlePre}<br /><span className="serif">{t.titleSerif}</span></>}
        intro={t.intro}
      />

      <section>
        <div className="wrap">
          <SecHead index={t.svcIndex} titlePre={t.svcTitlePre} titleSerif={t.svcTitleSerif} />
          {t.items.map((s, i) => (
            <div className="svc-row fade-up" key={i}>
              <div className="svc-num">{s.n}</div>
              <div>
                <h3>{s.h}</h3>
                <p className="svc-desc">{s.desc}</p>
              </div>
              <ul className="svc-feats">
                {s.feats.map((f, j) => <li key={j}>{f}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <FinalCTA
        titleParts={{ l1: t.ctaTitleL1, l2Pre: t.ctaTitleL2Pre, l2Serif: t.ctaTitleL2Serif }}
        p={t.ctaP}
        cta1={t.ctaBtn1} cta1Href="/contact"
        cta2={t.ctaBtn2} cta2Href="/#process"
      />
    </HomeShell>
  );
};

export default ServicesPage;

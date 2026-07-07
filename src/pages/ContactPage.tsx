import { useLanguage } from '@/contexts/LanguageContext';
import { homeCopy } from '@/translations/home';
import { HomeShell, PageHero, SecHead } from '@/components/home/shared';
import Contact from '@/components/Contact';

const ContactPage = () => {
  const { language } = useLanguage();
  const t = homeCopy[language].contact;

  return (
    <HomeShell>
      <PageHero
        crumb={t.crumb}
        titleHtml={<>{t.titlePre}<br /><span className="serif">{t.titleSerif}</span></>}
        intro={t.intro}
      />

      <section>
        <div className="wrap contact-grid">
          <div>
            <div className="sec-index" style={{ marginBottom: 14 }}>{t.coIndex}</div>
            <h2 className="sec-title mask-reveal">
              <span className="w"><span>{t.coTitlePre}</span></span>{' '}
              <span className="w"><span className="serif">{t.coTitleSerif}</span></span>
            </h2>
            <p style={{ color: 'var(--ink-dim)', fontWeight: 300, margin: '24px 0 20px', maxWidth: '46ch' }}>{t.coP}</p>
            <ul className="console-points">
              {t.coPoints.map((pt, i) => (
                <li key={i}>
                  <span className="n">{pt.n}</span>
                  <span><b>{pt.bold}</b>{pt.rest}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="contact-cards">
            <a className="info-card fade-up" href="mailto:Contact@AdrianIdea.ir" data-cursor="mail">
              <span><span className="k">{t.ccEmail}</span><span className="v">Contact@AdrianIdea.ir</span></span>
              <span className="arr">↗</span>
            </a>
            <a className="info-card fade-up" href="tel:+989125633479" data-cursor="call">
              <span><span className="k">{t.ccPhone}</span><span className="v">+98 912 563 3479</span></span>
              <span className="arr">↗</span>
            </a>
            <a className="info-card fade-up" href="https://www.AdrianIdea.ir" data-cursor="web">
              <span><span className="k">{t.ccWeb}</span><span className="v">www.AdrianIdea.ir</span></span>
              <span className="arr">↗</span>
            </a>
            <div className="contact-note fade-up">
              <b>{t.ccNoteBold}</b>{t.ccNoteRest}
            </div>
          </div>
        </div>

        <div className="wrap contact-form-wrap">
          <h3>{t.formHeader}</h3>
          <Contact />
        </div>
      </section>
    </HomeShell>
  );
};

export default ContactPage;

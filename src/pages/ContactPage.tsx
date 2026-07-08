import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { homeCopy } from '@/translations/home';
import { HomeShell, PageHero, Field } from '@/components/home/shared';
import { SEO } from '@/components/SEO';
import { useToast } from '@/hooks/use-toast';

const ContactPage = () => {
  const { language } = useLanguage();
  const t = homeCopy[language].contact;
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    toast({ title: t.form.sent, description: t.form.sentDesc });
    (e.target as HTMLFormElement).reset();
    setIsSubmitting(false);
  };

  return (
    <HomeShell>
      <SEO
        path="/contact"
        lang={language}
        title="Contact — Adrian Idea"
        description="Get in touch with Adrian Idea. Email Contact@AdrianIdea.ir, call +98 912 563 3479, or send a project brief and we'll respond within one business day."
      />
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
          <form onSubmit={handleSubmit} className="ai-form">
            <div className="ai-form-row">
              <Field label={t.form.firstName}>
                <input name="firstName" required autoComplete="given-name" />
              </Field>
              <Field label={t.form.lastName}>
                <input name="lastName" required autoComplete="family-name" />
              </Field>
            </div>
            <Field label={t.form.email}>
              <input type="email" name="email" required autoComplete="email" />
            </Field>
            <Field label={t.form.company}>
              <input name="company" autoComplete="organization" />
            </Field>
            <Field label={t.form.details}>
              <textarea name="details" rows={5} placeholder={t.form.detailsPh} required />
            </Field>
            <button type="submit" disabled={isSubmitting} className="btn btn-fill magnetic" data-cursor="send">
              <span>{isSubmitting ? t.form.sending : t.form.send}</span>
            </button>
          </form>
        </div>
      </section>
    </HomeShell>
  );
};

export default ContactPage;

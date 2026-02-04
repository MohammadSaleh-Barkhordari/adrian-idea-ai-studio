import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const CookiePolicyPage = () => {
  const { language } = useLanguage();
  
  useEffect(() => {
    document.title = 'Cookie Policy | Adrian Idea';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Understand how Adrian Idea uses cookies and similar technologies on our website. Compliant with PECR and UK GDPR regulations.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Understand how Adrian Idea uses cookies and similar technologies on our website. Compliant with PECR and UK GDPR regulations.';
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Content */}
      <main className="container mx-auto px-6 py-16 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Cookie Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="prose prose-slate max-w-none space-y-8">
          {/* Introduction */}
          <section>
            <p className="text-lg leading-relaxed">
              This Cookie Policy explains how Adrian Idea ("we", "our", or "us") uses cookies and similar technologies on our website. This policy complies with the Privacy and Electronic Communications Regulations (PECR) and the UK General Data Protection Regulation (UK GDPR).
            </p>
          </section>

          {/* What Are Cookies */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">1. What Are Cookies?</h2>
            <p className="leading-relaxed mb-4">
              Cookies are small text files that are placed on your device (computer, smartphone, or other electronic device) when you visit a website. They are widely used to make websites work more efficiently and provide a better user experience, as well as to provide information to the website owners.
            </p>
            <p className="leading-relaxed">
              Cookies can be "persistent" or "session" cookies. Persistent cookies remain on your device after you close your browser until they are deleted or reach their expiry date. Session cookies are temporary and are deleted when you close your browser.
            </p>
          </section>

          {/* Why We Use Cookies */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">2. Why We Use Cookies</h2>
            <p className="leading-relaxed mb-4">
              We use cookies for several reasons:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To enable certain functions of our website</li>
              <li>To provide analytics and gather statistics about website usage</li>
              <li>To enhance your user experience by remembering your preferences</li>
              <li>To improve our website's performance and functionality</li>
              <li>To deliver relevant content and advertisements (where applicable)</li>
              <li>To understand how visitors interact with our website</li>
            </ul>
          </section>

          {/* Types of Cookies */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">3. Types of Cookies We Use</h2>
            
            <div className="space-y-6">
              {/* Essential Cookies */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3 text-foreground">3.1 Essential Cookies</h3>
                <p className="leading-relaxed mb-3">
                  <strong>Purpose:</strong> These cookies are strictly necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility.
                </p>
                <p className="leading-relaxed mb-3">
                  <strong>Examples:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Authentication cookies that keep you logged in</li>
                  <li>Security cookies that protect against fraudulent activities</li>
                  <li>Load balancing cookies that distribute traffic across servers</li>
                  <li>User interface customization cookies</li>
                </ul>
                <p className="leading-relaxed mt-3">
                  <strong>Legal Basis:</strong> These cookies are essential for the website to function and do not require your consent under PECR.
                </p>
                <p className="leading-relaxed mt-2">
                  <strong>Duration:</strong> Session or up to 12 months
                </p>
              </div>

              {/* Performance Cookies */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3 text-foreground">3.2 Performance Cookies</h3>
                <p className="leading-relaxed mb-3">
                  <strong>Purpose:</strong> These cookies collect information about how visitors use our website, such as which pages are visited most often and whether users receive error messages.
                </p>
                <p className="leading-relaxed mb-3">
                  <strong>Examples:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Analytics cookies that track page views and user journeys</li>
                  <li>Error tracking cookies that help us identify and fix issues</li>
                  <li>Testing cookies that help us improve website performance</li>
                </ul>
                <p className="leading-relaxed mt-3">
                  <strong>Legal Basis:</strong> These cookies require your consent under PECR.
                </p>
                <p className="leading-relaxed mt-2">
                  <strong>Duration:</strong> Up to 24 months
                </p>
              </div>

              {/* Functionality Cookies */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3 text-foreground">3.3 Functionality Cookies</h3>
                <p className="leading-relaxed mb-3">
                  <strong>Purpose:</strong> These cookies allow our website to remember choices you make (such as your language preference) and provide enhanced, more personalized features.
                </p>
                <p className="leading-relaxed mb-3">
                  <strong>Examples:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Language preference cookies</li>
                  <li>Theme preference cookies (dark mode/light mode)</li>
                  <li>Region or location cookies</li>
                  <li>Accessibility preference cookies</li>
                </ul>
                <p className="leading-relaxed mt-3">
                  <strong>Legal Basis:</strong> These cookies require your consent under PECR.
                </p>
                <p className="leading-relaxed mt-2">
                  <strong>Duration:</strong> Up to 12 months
                </p>
              </div>

              {/* Targeting Cookies */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3 text-foreground">3.4 Targeting/Advertising Cookies</h3>
                <p className="leading-relaxed mb-3">
                  <strong>Purpose:</strong> These cookies are used to deliver advertisements more relevant to you and your interests. They may also be used to limit the number of times you see an advertisement and to measure the effectiveness of advertising campaigns.
                </p>
                <p className="leading-relaxed mb-3">
                  <strong>Examples:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Advertising network cookies</li>
                  <li>Social media cookies for personalized ads</li>
                  <li>Retargeting cookies</li>
                </ul>
                <p className="leading-relaxed mt-3">
                  <strong>Legal Basis:</strong> These cookies require your explicit consent under PECR.
                </p>
                <p className="leading-relaxed mt-2">
                  <strong>Duration:</strong> Up to 24 months
                </p>
              </div>
            </div>
          </section>

          {/* Third-Party Cookies */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">4. Third-Party Cookies</h2>
            <p className="leading-relaxed mb-4">
              In addition to our own cookies, we may use various third-party cookies to report usage statistics of our website and deliver advertisements on and through our website. These third parties include:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Analytics Providers:</strong> To understand how visitors use our website</li>
              <li><strong>Advertising Partners:</strong> To deliver relevant advertisements</li>
              <li><strong>Social Media Platforms:</strong> To enable social media sharing and interactions</li>
              <li><strong>Content Delivery Networks:</strong> To ensure fast and reliable delivery of website content</li>
            </ul>
            <p className="leading-relaxed mt-4">
              Please note that we do not control these third-party cookies. You should check the third-party websites for more information about how they use cookies.
            </p>
          </section>

          {/* Consent Mechanism */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">5. How to Give or Withdraw Consent</h2>
            <p className="leading-relaxed mb-4">
              When you first visit our website, you will see a cookie banner that explains our use of cookies. You can choose to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Accept All Cookies:</strong> By clicking "Accept All", you consent to all cookies</li>
              <li><strong>Reject Non-Essential Cookies:</strong> By clicking "Reject", you consent only to essential cookies</li>
              <li><strong>Customize Your Preferences:</strong> By clicking "Cookie Settings", you can choose which categories of cookies to accept</li>
            </ul>
            <p className="leading-relaxed mt-4 mb-4">
              You can change your cookie preferences at any time by:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Clicking on the "Cookie Settings" link in our website footer</li>
              <li>Adjusting your browser settings (see section 6 below)</li>
              <li>Contacting us directly at contact@adrianidea.ir</li>
            </ul>
            <p className="leading-relaxed mt-4">
              Please note that if you choose to block all cookies (including essential cookies), some parts of our website may not function properly.
            </p>
          </section>

          {/* Browser Settings */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">6. Managing Cookies Through Your Browser</h2>
            <p className="leading-relaxed mb-4">
              Most web browsers allow you to manage your cookie preferences through their settings. You can set your browser to refuse cookies or to alert you when cookies are being sent. However, please note that if you disable cookies, some features of our website may not function properly.
            </p>
            <p className="leading-relaxed mb-4">
              Here are links to cookie management instructions for popular browsers:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><a href="https://support.google.com/chrome/answer/95647" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">Safari</a></li>
              <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
              <li><a href="https://help.opera.com/en/latest/web-preferences/#cookies" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">Opera</a></li>
            </ul>
            <p className="leading-relaxed mt-4">
              For more information about cookies and how to manage them, visit <a href="https://www.aboutcookies.org" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">www.aboutcookies.org</a> or <a href="https://www.allaboutcookies.org" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">www.allaboutcookies.org</a>.
            </p>
          </section>

          {/* Do Not Track */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">7. Do Not Track Signals</h2>
            <p className="leading-relaxed">
              Some browsers have a "Do Not Track" feature that lets you tell websites that you do not want to have your online activities tracked. At this time, we do not respond to browser "Do Not Track" signals. However, you can manage your cookie preferences as described in sections 5 and 6 above.
            </p>
          </section>

          {/* Updates to Policy */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">8. Changes to This Cookie Policy</h2>
            <p className="leading-relaxed">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the updated policy on our website and updating the "Last updated" date at the top of this page. We encourage you to review this Cookie Policy periodically.
            </p>
          </section>

          {/* Contact Us */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">9. Contact Us</h2>
            <p className="leading-relaxed mb-4">
              If you have any questions about our use of cookies or this Cookie Policy, please contact us:
            </p>
            <div className="bg-card border border-border rounded-lg p-6 space-y-2">
              <p><strong>Company Name:</strong> Adrian Idea</p>
              <p><strong>Email:</strong> <a href="mailto:contact@adrianidea.ir" className="text-accent hover:underline">contact@adrianidea.ir</a></p>
              <p><strong>Phone:</strong> <a href="tel:+989125633479" className="text-accent hover:underline">+98 912 563 3479</a></p>
            </div>
          </section>

          {/* ICO Information */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">10. Further Information</h2>
            <p className="leading-relaxed mb-4">
              For more information about cookies and your privacy rights, you can visit the Information Commissioner's Office (ICO) website:
            </p>
            <div className="bg-card border border-border rounded-lg p-6 space-y-2">
              <p><strong>Information Commissioner's Office</strong></p>
              <p>Website: <a href="https://www.ico.org.uk" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">www.ico.org.uk</a></p>
              <p>Cookie guidance: <a href="https://ico.org.uk/for-organisations/guide-to-pecr/cookies-and-similar-technologies/" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">ICO Cookie Guidance</a></p>
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CookiePolicyPage;
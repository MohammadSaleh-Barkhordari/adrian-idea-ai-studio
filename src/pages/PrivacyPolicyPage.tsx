import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const PrivacyPolicyPage = () => {
  const { language } = useLanguage();
  
  useEffect(() => {
    document.title = 'Privacy Policy | Adrian Idea';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Learn about how Adrian Idea collects, uses, and protects your personal data in compliance with UK GDPR and Data Protection Act 2018.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Learn about how Adrian Idea collects, uses, and protects your personal data in compliance with UK GDPR and Data Protection Act 2018.';
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Content */}
      <main className="container mx-auto px-6 py-16 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="prose prose-slate max-w-none space-y-8">
          {/* Introduction */}
          <section>
            <p className="text-lg leading-relaxed">
              Adrian Idea ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services. This policy complies with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
            </p>
          </section>

          {/* Data Controller Information */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">1. Data Controller Information</h2>
            <p className="leading-relaxed mb-4">
              Adrian Idea is the data controller responsible for your personal data. You can contact us at:
            </p>
            <div className="bg-card border border-border rounded-lg p-6 space-y-2">
              <p><strong>Company Name:</strong> Adrian Idea</p>
              <p><strong>Email:</strong> contact@adrianidea.ir</p>
              <p><strong>Phone:</strong> +98 912 563 3479</p>
              <p><strong>Address:</strong> Iran, Tehran</p>
            </div>
          </section>

          {/* Types of Data Collected */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">2. Types of Data We Collect</h2>
            <p className="leading-relaxed mb-4">We may collect and process the following categories of personal data:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Identity Data:</strong> Name, username, or similar identifier</li>
              <li><strong>Contact Data:</strong> Email address, telephone number, postal address</li>
              <li><strong>Technical Data:</strong> IP address, browser type and version, time zone setting, browser plug-in types and versions, operating system and platform</li>
              <li><strong>Usage Data:</strong> Information about how you use our website and services</li>
              <li><strong>Marketing and Communications Data:</strong> Your preferences in receiving marketing from us and our third parties and your communication preferences</li>
              <li><strong>Profile Data:</strong> Your username and password, purchases or orders made by you, your interests, preferences, feedback and survey responses</li>
            </ul>
          </section>

          {/* Purpose of Data Processing */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">3. Purpose of Data Processing</h2>
            <p className="leading-relaxed mb-4">We process your personal data for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide and maintain our services</li>
              <li>To notify you about changes to our services</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information so that we can improve our services</li>
              <li>To monitor the usage of our services</li>
              <li>To detect, prevent and address technical issues</li>
              <li>To provide you with news, special offers and general information about other goods, services and events which we offer</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          {/* Lawful Basis for Processing */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">4. Lawful Basis for Processing</h2>
            <p className="leading-relaxed mb-4">We process your personal data under the following lawful bases:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Consent:</strong> You have given clear consent for us to process your personal data for a specific purpose</li>
              <li><strong>Contract:</strong> Processing is necessary for a contract we have with you, or because you have asked us to take specific steps before entering into a contract</li>
              <li><strong>Legal Obligation:</strong> Processing is necessary for us to comply with the law</li>
              <li><strong>Legitimate Interests:</strong> Processing is necessary for our legitimate interests or the legitimate interests of a third party, unless there is a good reason to protect your personal data which overrides those legitimate interests</li>
            </ul>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">5. Data Retention Period</h2>
            <p className="leading-relaxed mb-4">
              We will retain your personal data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your personal data to the extent necessary to comply with our legal obligations (for example, if we are required to retain your data to comply with applicable laws), resolve disputes, and enforce our legal agreements and policies.
            </p>
            <p className="leading-relaxed">
              The criteria used to determine our retention periods include:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>The length of time we have an ongoing relationship with you</li>
              <li>Whether there is a legal obligation to which we are subject</li>
              <li>Whether retention is advisable in light of our legal position</li>
            </ul>
          </section>

          {/* Data Subject Rights */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">6. Your Rights Under UK GDPR</h2>
            <p className="leading-relaxed mb-4">Under UK GDPR, you have the following rights:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Right of Access:</strong> You have the right to request copies of your personal data</li>
              <li><strong>Right to Rectification:</strong> You have the right to request that we correct any information you believe is inaccurate or complete information you believe is incomplete</li>
              <li><strong>Right to Erasure:</strong> You have the right to request that we erase your personal data, under certain conditions</li>
              <li><strong>Right to Restrict Processing:</strong> You have the right to request that we restrict the processing of your personal data, under certain conditions</li>
              <li><strong>Right to Object to Processing:</strong> You have the right to object to our processing of your personal data, under certain conditions</li>
              <li><strong>Right to Data Portability:</strong> You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions</li>
            </ul>
            <p className="leading-relaxed mt-4">
              To exercise any of these rights, please contact us at contact@adrianidea.ir. We will respond to your request within one month.
            </p>
          </section>

          {/* Data Transfers */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">7. International Data Transfers</h2>
            <p className="leading-relaxed mb-4">
              Your personal data may be transferred to, and maintained on, computers located outside of your country where the data protection laws may differ from those of your jurisdiction.
            </p>
            <p className="leading-relaxed">
              If we transfer your personal data outside the UK, we will take steps to ensure that your personal data receives an adequate level of protection. This may include implementing standard contractual clauses approved by the UK authorities or ensuring the recipient is in a country that has been deemed to provide an adequate level of data protection.
            </p>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">8. Data Security</h2>
            <p className="leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal data against unauthorized or unlawful processing, accidental loss, destruction, or damage. These measures include encryption, access controls, and regular security assessments. However, no method of transmission over the Internet or method of electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">9. Third-Party Services</h2>
            <p className="leading-relaxed mb-4">
              We may employ third-party companies and individuals to facilitate our services, provide the service on our behalf, perform service-related services, or assist us in analyzing how our service is used. These third parties have access to your personal data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">10. Children's Privacy</h2>
            <p className="leading-relaxed">
              Our services are not intended for children under the age of 13. We do not knowingly collect personal data from children under 13. If you are a parent or guardian and you are aware that your child has provided us with personal data, please contact us. If we become aware that we have collected personal data from children without verification of parental consent, we take steps to remove that information from our servers.
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">11. Changes to This Privacy Policy</h2>
            <p className="leading-relaxed">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top of this Privacy Policy. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
            </p>
          </section>

          {/* Complaints */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">12. How to Complain</h2>
            <p className="leading-relaxed mb-4">
              If you have any concerns about our use of your personal data, you can make a complaint to us at contact@adrianidea.ir.
            </p>
            <p className="leading-relaxed mb-4">
              You can also complain to the Information Commissioner's Office (ICO) if you are unhappy with how we have used your data:
            </p>
            <div className="bg-card border border-border rounded-lg p-6 space-y-2">
              <p><strong>Information Commissioner's Office</strong></p>
              <p>Wycliffe House</p>
              <p>Water Lane</p>
              <p>Wilmslow</p>
              <p>Cheshire</p>
              <p>SK9 5AF</p>
              <p><strong>Helpline:</strong> 0303 123 1113</p>
              <p><strong>Website:</strong> <a href="https://www.ico.org.uk" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">www.ico.org.uk</a></p>
            </div>
          </section>

          {/* Contact Us */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">13. Contact Us</h2>
            <p className="leading-relaxed mb-4">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <div className="bg-card border border-border rounded-lg p-6 space-y-2">
              <p><strong>Email:</strong> <a href="mailto:contact@adrianidea.ir" className="text-accent hover:underline">contact@adrianidea.ir</a></p>
              <p><strong>Phone:</strong> <a href="tel:+989125633479" className="text-accent hover:underline">+98 912 563 3479</a></p>
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
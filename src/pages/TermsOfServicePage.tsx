import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const TermsOfServicePage = () => {
  const { language } = useLanguage();
  
  useEffect(() => {
    document.title = 'Terms of Service | Adrian Idea';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Read the Terms of Service for Adrian Idea. Understand your rights and responsibilities when using our AI-powered business solutions and services.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Read the Terms of Service for Adrian Idea. Understand your rights and responsibilities when using our AI-powered business solutions and services.';
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Content */}
      <main className="container mx-auto px-6 py-16 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="prose prose-slate max-w-none space-y-8">
          {/* Introduction */}
          <section>
            <p className="text-lg leading-relaxed">
              Welcome to Adrian Idea. These Terms of Service ("Terms") govern your access to and use of our website, services, and applications (collectively, the "Services"). By accessing or using our Services, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Services.
            </p>
          </section>

          {/* Acceptance of Terms */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">1. Acceptance of Terms</h2>
            <p className="leading-relaxed mb-4">
              By accessing or using the Services, you confirm that you accept these Terms and agree to comply with them. These Terms constitute a legally binding agreement between you and Adrian Idea.
            </p>
            <p className="leading-relaxed">
              If you are using the Services on behalf of an organization, you represent and warrant that you have the authority to bind that organization to these Terms, and your acceptance of these Terms will be treated as acceptance by that organization.
            </p>
          </section>

          {/* Eligibility */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">2. Eligibility</h2>
            <p className="leading-relaxed">
              You must be at least 18 years old to use our Services. By using our Services, you represent and warrant that you meet this age requirement. If you are under 18, you may only use our Services with the involvement and consent of a parent or guardian.
            </p>
          </section>

          {/* User Account */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">3. User Account</h2>
            <p className="leading-relaxed mb-4">
              To access certain features of our Services, you may be required to create an account. When you create an account, you agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your account by protecting your password and restricting access to your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
              <li>Accept responsibility for all activities that occur under your account</li>
            </ul>
            <p className="leading-relaxed mt-4">
              We reserve the right to suspend or terminate your account if any information provided proves to be inaccurate, false, or misleading.
            </p>
          </section>

          {/* User Responsibilities */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">4. User Responsibilities and Prohibited Activities</h2>
            <p className="leading-relaxed mb-4">
              When using our Services, you agree not to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Violate any applicable laws, regulations, or these Terms</li>
              <li>Infringe upon the intellectual property rights of others</li>
              <li>Upload, post, or transmit any content that is unlawful, harmful, threatening, abusive, defamatory, vulgar, obscene, or otherwise objectionable</li>
              <li>Impersonate any person or entity or falsely state or misrepresent your affiliation with a person or entity</li>
              <li>Interfere with or disrupt the Services or servers or networks connected to the Services</li>
              <li>Attempt to gain unauthorized access to any portion of the Services or any other systems or networks</li>
              <li>Use any automated means, including robots, crawlers, or scrapers, to access the Services</li>
              <li>Transmit any viruses, worms, defects, Trojan horses, or any items of a destructive nature</li>
              <li>Use the Services for any commercial purpose without our prior written consent</li>
              <li>Engage in any activity that could damage, disable, overburden, or impair the Services</li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">5. Intellectual Property Rights</h2>
            <p className="leading-relaxed mb-4">
              All content, features, and functionality of the Services, including but not limited to text, graphics, logos, icons, images, audio clips, video clips, data compilations, software, and the compilation thereof (collectively, the "Content"), are owned by Adrian Idea or its licensors and are protected by UK and international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
            </p>
            <p className="leading-relaxed mb-4">
              You are granted a limited, non-exclusive, non-transferable, and revocable license to access and use the Services for your personal, non-commercial use. This license does not include any right to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Resell or make any commercial use of the Services or the Content</li>
              <li>Modify, reproduce, distribute, create derivative works based upon, publicly display, or publicly perform any Content</li>
              <li>Download or copy any Content for the benefit of another merchant or any other third party</li>
              <li>Use any data mining, robots, or similar data gathering and extraction methods</li>
            </ul>
            <p className="leading-relaxed mt-4">
              Any unauthorized use of the Content or Services may violate copyright, trademark, and other laws and is strictly prohibited.
            </p>
          </section>

          {/* User Content */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">6. User-Generated Content</h2>
            <p className="leading-relaxed mb-4">
              Our Services may allow you to submit, post, or upload content ("User Content"). You retain all ownership rights in your User Content. However, by submitting User Content to the Services, you grant Adrian Idea a worldwide, non-exclusive, royalty-free, transferable license to use, reproduce, distribute, prepare derivative works of, display, and perform your User Content in connection with the Services.
            </p>
            <p className="leading-relaxed mb-4">
              You represent and warrant that:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You own or have the necessary rights to submit the User Content</li>
              <li>Your User Content does not violate the privacy rights, publicity rights, copyrights, or other rights of any person or entity</li>
              <li>Your User Content does not contain any defamatory, obscene, or otherwise unlawful material</li>
            </ul>
            <p className="leading-relaxed mt-4">
              We reserve the right to remove any User Content that violates these Terms or is otherwise objectionable, at our sole discretion.
            </p>
          </section>

          {/* Services Modification */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">7. Modification of Services</h2>
            <p className="leading-relaxed">
              We reserve the right to modify, suspend, or discontinue the Services (or any part thereof) at any time, with or without notice. We will not be liable to you or any third party for any modification, suspension, or discontinuance of the Services.
            </p>
          </section>

          {/* Payment and Fees */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">8. Payment and Fees</h2>
            <p className="leading-relaxed mb-4">
              Certain aspects of the Services may be subject to fees. If you choose to use paid features, you agree to pay all applicable fees as described on the Services. All fees are non-refundable unless otherwise stated.
            </p>
            <p className="leading-relaxed">
              We reserve the right to change our fees at any time. If we change our fees, we will provide you with advance notice. Your continued use of the Services after the fee change takes effect constitutes your agreement to pay the modified fees.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">9. Limitation of Liability</h2>
            <p className="leading-relaxed mb-4">
              To the fullest extent permitted by applicable law, Adrian Idea, its directors, employees, partners, agents, suppliers, or affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your access to or use of or inability to access or use the Services</li>
              <li>Any conduct or content of any third party on the Services</li>
              <li>Any content obtained from the Services</li>
              <li>Unauthorized access, use, or alteration of your transmissions or content</li>
            </ul>
            <p className="leading-relaxed mt-4">
              Our total liability to you for all claims arising from or related to the Services shall not exceed the amount you paid to us, if any, in the twelve (12) months preceding the event giving rise to the liability, or £100, whichever is greater.
            </p>
          </section>

          {/* Disclaimer of Warranties */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">10. Disclaimer of Warranties</h2>
            <p className="leading-relaxed mb-4">
              The Services are provided "as is" and "as available" without warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, non-infringement, or course of performance.
            </p>
            <p className="leading-relaxed">
              Adrian Idea does not warrant that the Services will be uninterrupted, secure, or error-free, that defects will be corrected, or that the Services or the servers that make them available are free of viruses or other harmful components.
            </p>
          </section>

          {/* Indemnification */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">11. Indemnification</h2>
            <p className="leading-relaxed">
              You agree to indemnify, defend, and hold harmless Adrian Idea, its officers, directors, employees, agents, licensors, and suppliers from and against all losses, expenses, damages, and costs, including reasonable attorneys' fees, resulting from any violation of these Terms or any activity related to your account (including negligent or wrongful conduct) by you or any other person accessing the Services using your account.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">12. Termination</h2>
            <p className="leading-relaxed mb-4">
              We may terminate or suspend your access to the Services immediately, without prior notice or liability, for any reason, including but not limited to a breach of these Terms.
            </p>
            <p className="leading-relaxed mb-4">
              Upon termination:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your right to use the Services will immediately cease</li>
              <li>We may delete your account and any content associated with it</li>
              <li>All provisions of these Terms which by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability</li>
            </ul>
            <p className="leading-relaxed mt-4">
              You may terminate your account at any time by contacting us at contact@adrianidea.ir.
            </p>
          </section>

          {/* Governing Law and Jurisdiction */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">13. Governing Law and Jurisdiction</h2>
            <p className="leading-relaxed mb-4">
              These Terms shall be governed by and construed in accordance with the laws of England and Wales, without regard to its conflict of law provisions.
            </p>
            <p className="leading-relaxed">
              Any disputes arising from or relating to these Terms or the Services shall be subject to the exclusive jurisdiction of the courts of England and Wales. However, we retain the right to bring legal proceedings in any jurisdiction where you reside or where a breach of these Terms occurs.
            </p>
          </section>

          {/* Dispute Resolution */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">14. Dispute Resolution</h2>
            <p className="leading-relaxed">
              In the event of any dispute arising from or relating to these Terms, we encourage you to contact us first to seek a resolution. We will endeavor to resolve complaints and disputes in a timely and efficient manner.
            </p>
          </section>

          {/* Severability */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">15. Severability</h2>
            <p className="leading-relaxed">
              If any provision of these Terms is held to be invalid or unenforceable by a court of competent jurisdiction, the remaining provisions will continue in full force and effect. The invalid or unenforceable provision will be deemed superseded by a valid, enforceable provision that most closely matches the intent of the original provision.
            </p>
          </section>

          {/* Entire Agreement */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">16. Entire Agreement</h2>
            <p className="leading-relaxed">
              These Terms constitute the entire agreement between you and Adrian Idea regarding the use of the Services and supersede all prior and contemporaneous understandings, agreements, representations, and warranties, both written and oral, regarding the Services.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">17. Changes to These Terms</h2>
            <p className="leading-relaxed mb-4">
              We reserve the right to modify these Terms at any time. If we make material changes to these Terms, we will notify you by:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Posting the updated Terms on the Services</li>
              <li>Updating the "Last updated" date at the top of these Terms</li>
              <li>Sending you an email notification (if you have provided us with your email address)</li>
            </ul>
            <p className="leading-relaxed mt-4">
              Your continued use of the Services after we post any modifications to the Terms will constitute your acknowledgment of the modifications and your consent to abide and be bound by the modified Terms.
            </p>
          </section>

          {/* Contact Us */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">18. Contact Information</h2>
            <p className="leading-relaxed mb-4">
              If you have any questions about these Terms, please contact us:
            </p>
            <div className="bg-card border border-border rounded-lg p-6 space-y-2">
              <p><strong>Company Name:</strong> Adrian Idea</p>
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

export default TermsOfServicePage;
import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const DataProcessingPage = () => {
  const { language } = useLanguage();
  
  useEffect(() => {
    document.title = 'Data Processing Agreement | Adrian Idea';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Review the Data Processing Agreement between Adrian Idea and clients. UK GDPR compliant terms for data controller and processor relationships.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Review the Data Processing Agreement between Adrian Idea and clients. UK GDPR compliant terms for data controller and processor relationships.';
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Content */}
      <main className="container mx-auto px-6 py-16 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Data Processing Agreement</h1>
        <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="prose prose-slate max-w-none space-y-8">
          {/* Introduction */}
          <section>
            <p className="text-lg leading-relaxed mb-4">
              This Data Processing Agreement ("DPA") forms part of the contract between Adrian Idea ("Data Processor") and the Client ("Data Controller") for the provision of services. This DPA is required under the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018 when a data controller engages a data processor to process personal data on its behalf.
            </p>
            <p className="leading-relaxed">
              This DPA sets out the rights and obligations of both parties with respect to the processing of personal data in connection with the services provided.
            </p>
          </section>

          {/* Definitions */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">1. Definitions</h2>
            <p className="leading-relaxed mb-4">
              In this DPA, the following terms have the meanings set out below:
            </p>
            <div className="bg-card border border-border rounded-lg p-6 space-y-3">
              <p><strong>"Data Controller"</strong> means the Client who determines the purposes and means of processing personal data.</p>
              <p><strong>"Data Processor"</strong> means Adrian Idea, who processes personal data on behalf of the Data Controller.</p>
              <p><strong>"Personal Data"</strong> means any information relating to an identified or identifiable natural person.</p>
              <p><strong>"Processing"</strong> means any operation or set of operations performed on personal data, such as collection, recording, organization, storage, adaptation, retrieval, use, disclosure, or erasure.</p>
              <p><strong>"Data Subject"</strong> means the individual to whom the personal data relates.</p>
              <p><strong>"Sub-processor"</strong> means any processor engaged by Adrian Idea to process personal data on behalf of the Data Controller.</p>
              <p><strong>"UK GDPR"</strong> means the UK General Data Protection Regulation.</p>
              <p><strong>"Data Protection Laws"</strong> means all applicable laws relating to the processing of personal data, including the UK GDPR and the Data Protection Act 2018.</p>
            </div>
          </section>

          {/* Scope of Processing */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">2. Scope and Nature of Processing</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">2.1 Subject Matter</h3>
                <p className="leading-relaxed">
                  The Data Processor shall process personal data on behalf of the Data Controller in connection with the provision of AI-powered business solutions, analytics, and consulting services as described in the main service agreement.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">2.2 Duration of Processing</h3>
                <p className="leading-relaxed">
                  The processing shall continue for the duration of the service agreement and for such period thereafter as may be necessary to fulfill the purposes set out in this DPA.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">2.3 Nature and Purpose of Processing</h3>
                <p className="leading-relaxed mb-3">The Data Processor may perform the following processing activities:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Collection, storage, and organization of personal data</li>
                  <li>Analysis and processing of data using AI and machine learning algorithms</li>
                  <li>Generation of reports, insights, and recommendations</li>
                  <li>Technical support and maintenance of systems</li>
                  <li>Quality assurance and service improvement activities</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">2.4 Types of Personal Data</h3>
                <p className="leading-relaxed mb-3">The personal data processed may include, but is not limited to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Contact information (names, email addresses, phone numbers)</li>
                  <li>Professional information (job titles, company names)</li>
                  <li>Usage data and analytics information</li>
                  <li>Business transaction data</li>
                  <li>Communication records</li>
                  <li>Technical data (IP addresses, device information)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">2.5 Categories of Data Subjects</h3>
                <p className="leading-relaxed mb-3">The data subjects may include:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Employees and contractors of the Data Controller</li>
                  <li>Customers and clients of the Data Controller</li>
                  <li>Suppliers and partners of the Data Controller</li>
                  <li>Website visitors and users</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Obligations of Processor */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">3. Obligations of the Data Processor</h2>
            <p className="leading-relaxed mb-4">
              The Data Processor shall:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Process personal data only on documented instructions from the Data Controller, unless required to do so by law</li>
              <li>Ensure that persons authorized to process personal data have committed themselves to confidentiality or are under an appropriate statutory obligation of confidentiality</li>
              <li>Implement appropriate technical and organizational measures to ensure a level of security appropriate to the risk (as detailed in Section 5)</li>
              <li>Respect the conditions for engaging sub-processors as set out in Section 4</li>
              <li>Assist the Data Controller in responding to data subject rights requests</li>
              <li>Assist the Data Controller in ensuring compliance with data protection obligations</li>
              <li>Delete or return all personal data to the Data Controller after the end of the provision of services, unless required by law to retain the data</li>
              <li>Make available to the Data Controller all information necessary to demonstrate compliance with this DPA</li>
              <li>Immediately inform the Data Controller if, in its opinion, an instruction infringes Data Protection Laws</li>
            </ul>
          </section>

          {/* Sub-processors */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">4. Sub-processors</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">4.1 Authorization</h3>
                <p className="leading-relaxed">
                  The Data Controller provides general written authorization for the Data Processor to engage sub-processors to process personal data, subject to the conditions set out in this Section.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">4.2 Sub-processor Requirements</h3>
                <p className="leading-relaxed mb-3">
                  When engaging sub-processors, the Data Processor shall:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Conduct appropriate due diligence to ensure the sub-processor can provide sufficient guarantees of data protection compliance</li>
                  <li>Impose the same data protection obligations on sub-processors as set out in this DPA</li>
                  <li>Ensure that sub-processors implement appropriate technical and organizational security measures</li>
                  <li>Remain fully liable to the Data Controller for the performance of the sub-processor's obligations</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">4.3 Notification of Sub-processors</h3>
                <p className="leading-relaxed mb-3">
                  The Data Processor shall inform the Data Controller of any intended changes concerning the addition or replacement of sub-processors at least 30 days in advance. Current sub-processors include:
                </p>
                <div className="bg-card border border-border rounded-lg p-6">
                  <ul className="space-y-2">
                    <li><strong>Cloud Hosting Providers:</strong> For data storage and infrastructure</li>
                    <li><strong>Analytics Services:</strong> For usage analysis and performance monitoring</li>
                    <li><strong>Email Service Providers:</strong> For communication services</li>
                    <li><strong>AI/ML Service Providers:</strong> For advanced data processing capabilities</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">4.4 Objection to Sub-processors</h3>
                <p className="leading-relaxed">
                  The Data Controller may object to the engagement of a new sub-processor on reasonable grounds relating to data protection. Such objection must be made within 14 days of notification. If the Data Controller objects, the parties shall discuss in good faith to find a mutually acceptable solution.
                </p>
              </div>
            </div>
          </section>

          {/* Security Measures */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">5. Security Measures</h2>
            <p className="leading-relaxed mb-4">
              The Data Processor shall implement and maintain appropriate technical and organizational measures to protect personal data against unauthorized or unlawful processing, accidental loss, destruction, or damage. These measures include:
            </p>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">5.1 Technical Measures</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Encryption of personal data in transit and at rest</li>
                  <li>Regular security updates and patch management</li>
                  <li>Secure authentication and access control mechanisms</li>
                  <li>Network security measures including firewalls and intrusion detection systems</li>
                  <li>Regular security testing and vulnerability assessments</li>
                  <li>Secure data backup and disaster recovery procedures</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">5.2 Organizational Measures</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Data protection policies and procedures</li>
                  <li>Staff training on data protection and security</li>
                  <li>Confidentiality agreements with employees and contractors</li>
                  <li>Access control and privilege management</li>
                  <li>Incident response and breach notification procedures</li>
                  <li>Regular audits and compliance reviews</li>
                  <li>Physical security of facilities and equipment</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">5.3 Review and Updates</h3>
                <p className="leading-relaxed">
                  The Data Processor shall regularly review and update its security measures to ensure they remain appropriate and effective, taking into account the state of the art, the costs of implementation, and the nature, scope, context, and purposes of processing, as well as the risks to individuals.
                </p>
              </div>
            </div>
          </section>

          {/* Data Subject Rights */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">6. Assistance with Data Subject Rights</h2>
            <p className="leading-relaxed mb-4">
              The Data Processor shall, taking into account the nature of the processing, assist the Data Controller by implementing appropriate technical and organizational measures, insofar as this is possible, for the fulfillment of the Data Controller's obligation to respond to requests for exercising data subject rights, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Right of access to personal data</li>
              <li>Right to rectification of inaccurate personal data</li>
              <li>Right to erasure ("right to be forgotten")</li>
              <li>Right to restriction of processing</li>
              <li>Right to data portability</li>
              <li>Right to object to processing</li>
              <li>Rights related to automated decision-making and profiling</li>
            </ul>
            <p className="leading-relaxed mt-4">
              The Data Processor shall forward any data subject requests received directly to the Data Controller without undue delay and shall not respond to such requests unless authorized by the Data Controller.
            </p>
          </section>

          {/* Data Breach Notification */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">7. Data Breach Notification</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">7.1 Notification Obligation</h3>
                <p className="leading-relaxed">
                  The Data Processor shall notify the Data Controller without undue delay, and in any event within 24 hours, after becoming aware of a personal data breach affecting the Data Controller's personal data.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">7.2 Breach Information</h3>
                <p className="leading-relaxed mb-3">
                  The notification shall include, to the extent possible:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>A description of the nature of the personal data breach, including the categories and approximate number of data subjects concerned and the categories and approximate number of personal data records concerned</li>
                  <li>The name and contact details of the Data Processor's data protection officer or other contact point</li>
                  <li>A description of the likely consequences of the personal data breach</li>
                  <li>A description of the measures taken or proposed to be taken to address the breach and mitigate its possible adverse effects</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">7.3 Cooperation</h3>
                <p className="leading-relaxed">
                  The Data Processor shall cooperate with the Data Controller and provide such assistance as may be reasonably requested to investigate and remediate the breach and to enable the Data Controller to comply with its obligations under Data Protection Laws, including notification to supervisory authorities and data subjects where required.
                </p>
              </div>
            </div>
          </section>

          {/* Audits and Compliance */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">8. Audits and Inspections</h2>
            <p className="leading-relaxed mb-4">
              The Data Processor shall make available to the Data Controller all information necessary to demonstrate compliance with this DPA and the obligations laid down in Data Protection Laws.
            </p>
            <p className="leading-relaxed mb-4">
              The Data Processor shall allow for and contribute to audits, including inspections, conducted by the Data Controller or another auditor mandated by the Data Controller, subject to the following conditions:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The Data Controller shall provide reasonable advance notice of any audit (at least 30 days)</li>
              <li>Audits shall be conducted during normal business hours and shall not unreasonably interfere with the Data Processor's business operations</li>
              <li>The Data Controller shall ensure that auditors are bound by appropriate confidentiality obligations</li>
              <li>Audits shall not be conducted more than once per year unless there is reasonable suspicion of non-compliance or a personal data breach has occurred</li>
              <li>The Data Processor may charge reasonable costs for cooperating with audits beyond what is strictly necessary to demonstrate compliance</li>
            </ul>
          </section>

          {/* Data Return and Deletion */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">9. Return and Deletion of Personal Data</h2>
            <p className="leading-relaxed mb-4">
              Upon termination of the service agreement or at the Data Controller's written request, the Data Processor shall, at the Data Controller's choice:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Return all personal data to the Data Controller in a structured, commonly used, and machine-readable format; and/or</li>
              <li>Securely delete all personal data from its systems and ensure that existing copies are not capable of being reconstructed</li>
            </ul>
            <p className="leading-relaxed mt-4">
              The Data Processor may retain personal data to the extent required by applicable law, provided that it ensures the confidentiality of such personal data and only processes it as necessary for the purpose(s) specified in the law requiring its retention.
            </p>
            <p className="leading-relaxed mt-4">
              The Data Processor shall provide written certification to the Data Controller that it has complied with this Section within 30 days of the request or termination.
            </p>
          </section>

          {/* Liability and Indemnification */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">10. Liability and Indemnification</h2>
            <p className="leading-relaxed mb-4">
              Each party shall be liable for any damage caused by its processing of personal data in violation of Data Protection Laws or this DPA. The Data Processor shall be liable for damages caused by processing only where it has not complied with obligations specifically directed to processors under Data Protection Laws or where it has acted outside or contrary to lawful instructions of the Data Controller.
            </p>
            <p className="leading-relaxed">
              The Data Processor shall indemnify and hold harmless the Data Controller from and against all claims, damages, losses, liabilities, costs, and expenses (including reasonable legal fees) arising from any breach by the Data Processor of its obligations under this DPA or Data Protection Laws.
            </p>
          </section>

          {/* Term and Termination */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">11. Term and Termination</h2>
            <p className="leading-relaxed mb-4">
              This DPA shall commence on the effective date of the main service agreement and shall continue until the termination or expiration of the service agreement, unless earlier terminated as provided herein.
            </p>
            <p className="leading-relaxed">
              Either party may terminate this DPA immediately upon written notice if the other party is in material breach of this DPA and fails to remedy such breach within 30 days of receiving written notice thereof. The provisions regarding data return, deletion, confidentiality, and liability shall survive termination.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">12. Governing Law and Jurisdiction</h2>
            <p className="leading-relaxed">
              This DPA shall be governed by and construed in accordance with the laws of England and Wales. Any disputes arising from or in connection with this DPA shall be subject to the exclusive jurisdiction of the courts of England and Wales.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">13. Contact Information</h2>
            <p className="leading-relaxed mb-4">
              For all matters relating to this DPA, please contact:
            </p>
            <div className="bg-card border border-border rounded-lg p-6 space-y-2">
              <p><strong>Company Name:</strong> Adrian Idea</p>
              <p><strong>Data Protection Contact:</strong> contact@adrianidea.ir</p>
              <p><strong>Phone:</strong> <a href="tel:+989125633479" className="text-accent hover:underline">+98 912 563 3479</a></p>
              <p><strong>Address:</strong> Iran, Tehran</p>
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DataProcessingPage;
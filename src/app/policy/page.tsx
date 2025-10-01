// @ts-nocheck
"use client"
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Search, Printer, Mail, ChevronRight, FileText, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '@/lib/features/auth/auth-slice';
import Image from 'next/image';
import { motion } from 'framer-motion';
import SharedNavigation from '@/components/layout/Navigation';

export default function PolicyPage() {
  const [activeSection, setActiveSection] = useState('');
  const [expandedSections, setExpandedSections] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showProgress, setShowProgress] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrolled = window.scrollY;
      const progress = (scrolled / documentHeight) * 100;
      setReadingProgress(progress);
      setShowProgress(scrolled > 100);

      // Update active section based on scroll position
      const sections = document.querySelectorAll('section[id]');
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 150 && rect.bottom >= 150) {
          setActiveSection(section.id);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const tableOfContents = [
    { id: 'privacy-policy', label: '1. Privacy Policy', subsections: ['1.1 Purpose', '1.2 Membership', '1.3 Cookies'] },
    { id: 'terms-service', label: '2. Terms of Service', subsections: ['2.1 Allowed Content', '2.2 Prohibited Content', '2.3 Content Ownership'] },
    { id: 'community-standards', label: '3. Community Standards', subsections: ['3.1 Behavior', '3.2 Moderation'] },
    { id: 'privacy-protection', label: '4. Privacy & Data Protection' },
    { id: 'collaboration', label: '5. Collaboration' },
    { id: 'acknowledgment', label: '6. Acknowledgment' },
    { id: 'partners', label: '7. Partners' },
    { id: 'policy-updates', label: '8. Policy Updates' },
    { id: 'contact', label: '9. Contact & Support' },
    { id: 'advertising', label: '10. Advertising Policy' }
  ];

  return (
    <div className="min-h-screen bg-white">
           <SharedNavigation />

  
      {showProgress && (
        <div className="fixed top-15 left-0 w-full h-1 bg-gray-200 z-50">
          <div
            className="h-full bg-gradient-to-r from-[#0158B7] to-[#0362C3] transition-all duration-300"
            style={{ width: `${readingProgress}%` }}
          />
        </div>
      )}

      {/* Floating Table of Contents - Desktop */}
      <aside className="hidden lg:block fixed left-8 top-32 w-64 max-h-[calc(100vh-200px)] overflow-y-auto">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-lg">
          <h3 className="text-sm font-bold text-[#1A1F3A] mb-3 flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Table of Contents
          </h3>
          <nav className="space-y-1">
            {tableOfContents.map((item) => (
              <div key={item.id}>
                <button
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full text-left px-2 py-1.5 rounded text-sm transition-all ${
                    activeSection === item.id
                      ? 'bg-[#0158B7] text-white font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </button>
              </div>
            ))}
          </nav>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Reading Progress</div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#0158B7] to-[#0362C3] transition-all duration-300"
                style={{ width: `${readingProgress}%` }}
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="max-w-[800px] mx-auto px-6 py-24">
        {/* Header Section */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-[#1A1F3A] mb-4">
            Legal Terms & Partnership Guide
          </h1>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-6">
            <span>Last Updated: January 2025</span>
            <span className="text-gray-400">•</span>
            <button className="text-[#0158B7] hover:underline">See changes</button>
          </div>
          <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Thank you for joining Ongera (Unique Rwandans research platform). At the Ongera research platform, 
            we value your privacy and want to be transparent about how we collect, use, and share your personal information.
          </p>
        </header>

        {/* Summary Table */}
        <div className="mb-16 overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-[#F9FAFB]">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-bold text-[#1A1F3A] border-b border-gray-200">Document</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-[#1A1F3A] border-b border-gray-200">Main Focus</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-[#1A1F3A] border-b border-gray-200">Purpose</th>
              </tr>
            </thead>
            <tbody>
              {[
                { doc: 'Privacy Policy', focus: 'Data protection & user privacy', purpose: 'Explains how we collect and use personal data' },
                { doc: 'Terms of Service', focus: 'Legal contract & usage rules', purpose: 'Defines what users can and cannot do' },
                { doc: 'Community Standards', focus: 'Conduct & content behavior', purpose: 'Promotes respectful and safe interactions' }
              ].map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200 font-semibold">{row.doc}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 border-b border-gray-200">{row.focus}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 border-b border-gray-200">{row.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Introduction */}
        <div className="mb-16 prose prose-lg max-w-none">
          <p className="text-gray-700 leading-relaxed mb-6">
            Welcome to Ongera collaboration space policies, terms, and commitments. At Ongera, we're passionate about 
            sharing knowledge and building skills, but we're equally committed to transparency, trust, and safety. When you 
            grow, our entire community grows with you!
          </p>
          <p className="text-gray-700 leading-relaxed">
            Whether you're a researcher, a learner, a content contributor, or a partner, this page helps you easily find 
            all the guidelines and agreements that shape how we work together. Explore our collection of policies and terms 
            to understand how Ongera strives to make knowledge-sharing open, inclusive, and secure for everyone.
          </p>
        </div>

        {/* Section 1: Privacy Policy */}
        <section id="privacy-policy" className="mb-16">
          <div className="border-l-4 border-[#0158B7] pl-6 mb-8">
            <h2 className="text-2xl font-bold text-[#1A1F3A] mb-2">1. Privacy Policy</h2>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-[#1A1F3A] mb-3">1.1 Purpose</h3>
              <p className="text-gray-700 leading-relaxed">
                Ongera is a digital platform designed to promote research, innovation, and skills-sharing among Rwandans 
                across the world. Our goal is to build a collaborative environment where students, Diaspora, professionals, 
                and researchers can learn, share, and grow together while upholding integrity, respect, and the pursuit of knowledge.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1A1F3A] mb-3">1.2 Membership and Eligibility</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Ongera is open to all Rwandan citizens at home and abroad, to all private and governmental institutions 
                that wish to share the research outcomes. Members must:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-[#0158B7] mr-2">•</span>
                  <span>Use their real names or a consistent professional identity.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#0158B7] mr-2">•</span>
                  <span>Agree to follow the Ongera Terms of Use and Privacy Policy.</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1A1F3A] mb-3">1.3 Cookies and Data Collection Tools</h3>
              <p className="text-gray-700 leading-relaxed">
                We use <strong>cookies</strong>, small text files saved by your web browser, to gather, store, and share 
                information about your activity across websites. These cookies help us remember details about your visits, 
                such as your preferred content, and make your experience on Ongera easier and more personalized.
              </p>
            </div>
          </div>
        </section>

        <hr className="my-16 border-gray-200" />

        {/* Section 2: Terms of Service */}
        <section id="terms-service" className="mb-16">
          <div className="border-l-4 border-[#0158B7] pl-6 mb-8">
            <h2 className="text-2xl font-bold text-[#1A1F3A] mb-2">2. Terms of Service</h2>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-[#1A1F3A] mb-3">2.1 Allowed Content</h3>
              <p className="text-gray-700 leading-relaxed mb-4">Members may post:</p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-[#0158B7] mr-2">•</span>
                  <span>Research papers, summaries, or project reports.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#0158B7] mr-2">•</span>
                  <span>Educational materials, guides, and tutorials.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#0158B7] mr-2">•</span>
                  <span>Professional experiences or case studies that promote learning.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#0158B7] mr-2">•</span>
                  <span>Collaborative projects, open data, or research calls.</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1A1F3A] mb-3">2.2 Prohibited Content</h3>
              <p className="text-gray-700 leading-relaxed mb-4">Members must not upload or share:</p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-[#0158B7] mr-2">•</span>
                  <span>Plagiarized, false, or misleading research.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#0158B7] mr-2">•</span>
                  <span>Content that violates copyright or intellectual property rights.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#0158B7] mr-2">•</span>
                  <span>Hate speech, discrimination, or any content targeting individuals or groups based on ethnicity, religion, gender, or background.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#0158B7] mr-2">•</span>
                  <span>Political propaganda or content unrelated to learning and professional growth.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#0158B7] mr-2">•</span>
                  <span>Pornographic, violent, or offensive materials.</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1A1F3A] mb-3">2.3 Content Ownership</h3>
              <p className="text-gray-700 leading-relaxed">
                All creators retain ownership of their work but grant Ongera a non-exclusive license to display and share 
                it within the platform. Members must credit all sources used in their posts or research materials.
              </p>
            </div>
          </div>
        </section>

        <hr className="my-16 border-gray-200" />

        {/* Section 3: Community Standards */}
        <section id="community-standards" className="mb-16">
          <div className="border-l-4 border-[#0158B7] pl-6 mb-8">
            <h2 className="text-2xl font-bold text-[#1A1F3A] mb-2">3. Community Standards</h2>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-[#1A1F3A] mb-3">3.1 Behavior and Conduct</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                To maintain a respectful and productive community:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-[#0158B7] mr-2">•</span>
                  <span>Respect others' opinions and engage in professional discussions.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#0158B7] mr-2">•</span>
                  <span>Do not harass, insult, or bully other members in your posts or comments.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#0158B7] mr-2">•</span>
                  <span>Use clear, respectful language when commenting or reviewing others' work.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#0158B7] mr-2">•</span>
                  <span>Report any inappropriate behavior or content to the platform moderators.</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1A1F3A] mb-3">3.2 Moderation and Enforcement</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                All content will be subject to review by moderators to ensure quality and compliance. Violations may lead to:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-[#0158B7] mr-2">•</span>
                  <span>Warning or content removal.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#0158B7] mr-2">•</span>
                  <span>Temporary suspension of the account and reported to the relevant authority.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#0158B7] mr-2">•</span>
                  <span>Permanent ban for repeated or serious violations.</span>
                </li>
              </ul>
              <div className="mt-4 p-4 bg-[#FEF9E7] border-l-4 border-[#F39C12] rounded">
                <p className="text-sm text-gray-700">
                  <strong>Note:</strong> Users can appeal disciplinary actions through Ongera's support channel within 
                  seven days of notification.
                </p>
              </div>
            </div>
          </div>
        </section>

        <hr className="my-16 border-gray-200" />

        {/* Section 4: Privacy and Data Protection */}
        <section id="privacy-protection" className="mb-16">
          <div className="border-l-4 border-[#0158B7] pl-6 mb-8">
            <h2 className="text-2xl font-bold text-[#1A1F3A] mb-2">4. Privacy and Data Protection</h2>
          </div>
          <p className="text-gray-700 leading-relaxed mb-4">
            Ongera respects user privacy and will not share personal data without consent. Members must also protect 
            the privacy of others, especially when sharing research data involving human participants.
          </p>
          <p className="text-gray-700 leading-relaxed">
            All users must comply with Rwanda's Data Protection and Privacy Law found at{' '}
            <a href="https://dpo.gov.rw/" target="_blank" rel="noopener noreferrer" className="text-[#0158B7] hover:underline font-semibold">
              https://dpo.gov.rw/
            </a>
          </p>
        </section>

        <hr className="my-16 border-gray-200" />

        {/* Section 5: Collaboration */}
        <section id="collaboration" className="mb-16">
          <div className="border-l-4 border-[#0158B7] pl-6 mb-8">
            <h2 className="text-2xl font-bold text-[#1A1F3A] mb-2">5. Collaboration</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">
            Members are encouraged to collaborate through group projects, mentorship, and open discussions. Research 
            involving institutions should have institutional approval before being uploaded.
          </p>
        </section>

        <hr className="my-16 border-gray-200" />

        {/* Section 6: Acknowledgment */}
        <section id="acknowledgment" className="mb-16">
          <div className="border-l-4 border-[#0158B7] pl-6 mb-8">
            <h2 className="text-2xl font-bold text-[#1A1F3A] mb-2">6. Acknowledgment</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">
            Proper acknowledgment and attribution are mandatory for all shared work, and awards will follow the project 
            team plans.
          </p>
        </section>

        <hr className="my-16 border-gray-200" />

        {/* Section 7: Partners */}
        <section id="partners" className="mb-16">
          <div className="border-l-4 border-[#0158B7] pl-6 mb-8">
            <h2 className="text-2xl font-bold text-[#1A1F3A] mb-2">7. Partners</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">
            If you are accessing Ongera through an organization or institution partnership, please review the specific 
            privacy terms that apply to that program. By using our Services, you confirm that you have read and agree 
            to this Privacy Policy.
          </p>
        </section>

        <hr className="my-16 border-gray-200" />

        {/* Section 8: Policy Updates */}
        <section id="policy-updates" className="mb-16">
          <div className="border-l-4 border-[#0158B7] pl-6 mb-8">
            <h2 className="text-2xl font-bold text-[#1A1F3A] mb-2">8. Policy Updates</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">
            Ongera may update this policy from time to time. Users will be notified of significant changes. Continued 
            use of the platform implies agreement with the latest version.
          </p>
        </section>

        <hr className="my-16 border-gray-200" />

        {/* Section 9: Contact and Support */}
        <section id="contact" className="mb-16">
          <div className="border-l-4 border-[#0158B7] pl-6 mb-8">
            <h2 className="text-2xl font-bold text-[#1A1F3A] mb-2">9. Contact and Support</h2>
          </div>
          <div className="p-6 bg-[#F0FDF4] border-l-4 border-[#10B981] rounded">
            <p className="text-gray-700 leading-relaxed mb-4">
              For any questions, reporting, or appeals, please contact us:
            </p>
            <a 
              href="mailto:bwengeorg@gmail.com" 
              className="inline-flex items-center gap-2 text-[#0158B7] hover:underline font-semibold"
            >
              <Mail className="w-4 h-4" />
              bwengeorg@gmail.com
            </a>
          </div>
        </section>

        <hr className="my-16 border-gray-200" />

        {/* Section 10: Advertising Policy */}
        <section id="advertising" className="mb-16">
          <div className="border-l-4 border-[#0158B7] pl-6 mb-8">
            <h2 className="text-2xl font-bold text-[#1A1F3A] mb-2">10. Advertising Policy</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">
            Ongera is committed to truthful and accurate advertising. We constantly work to ensure its advertising 
            practices comply with applicable laws, including restrictions against advertising targeted at minors. These 
            efforts include collaboration by cross-functional departments to establish advertising best practices and 
            incorporate compliance reviews of marketing and communications strategies and assets.
          </p>
        </section>

        {/* Footer Actions */}
        <div className="mt-16 pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            <p>Questions about our policies?</p>
            <a href="mailto:bwengeorg@gmail.com" className="text-[#0158B7] hover:underline font-semibold">
              Contact Support
            </a>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            <Printer className="w-4 h-4" />
            Print This Page
          </button>
        </div>
      </main>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          aside, button, .no-print {
            display: none !important;
          }
          main {
            max-width: 100% !important;
            padding: 20px !important;
          }
          body {
            background: white !important;
            color: black !important;
          }
          a {
            color: black !important;
            text-decoration: underline !important;
          }
          a::after {
            content: " (" attr(href) ")";
            font-size: 0.8em;
            color: #666;
          }
        }
      `}</style>
    </div>
  );
}
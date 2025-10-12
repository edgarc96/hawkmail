import React from 'react';
import Image from 'next/image';
import { Facebook, Twitter, Linkedin } from 'lucide-react';

const navSections = [
  {
    title: 'PRODUCT',
    links: [
      { name: 'Features', href: 'https://info.timetoreply.com/features' },
      { name: 'Pricing', href: 'https://timetoreply.com/pricing/' },
    ],
  },
  {
    title: 'INTEGRATIONS',
    links: [
      { name: 'Outlook', href: 'https://timetoreply.com/email-analytics-for-outlook-and-o365/' },
      { name: 'Gmail', href: 'https://timetoreply.com/email-analytics-for-gmail/' },
      { name: 'All Integrations', href: 'https://timetoreply.com/integrations/' },
    ],
  },
  {
    title: "WHO'S IT FOR",
    links: [
      { name: 'Corporate Travel', href: 'https://timetoreply.com/email-analytics-for-mid-market-large-corporate-travel-companies/' },
      { name: 'Insurance', href: 'https://timetoreply.com/email-analytics-for-insurance-companies/' },
      { name: 'Legal Services', href: 'https://timetoreply.com/email-analytics-for-leading-legal-services-companies/' },
      { name: 'Logistics', href: 'https://timetoreply.com/logistics-outbound/' },
      { name: 'Manufacturing', href: 'https://timetoreply.com/email-analytics-for-manufacturing-companies/' },
      { name: 'Professional Services', href: 'https://timetoreply.com/email-analytics-for-leading-professional-services-companies/' },
      { name: 'Property Management', href: 'https://timetoreply.com/email-analytics-for-large-property-management-companies/' },
      { name: 'Key Account Management Teams', href: '#' },
      { name: 'Customer Service Teams', href: '#' },
      { name: 'Remote Teams', href: '#' },
    ],
  },
  {
    title: 'RESOURCES',
    links: [
      { name: 'Case Studies', href: 'https://timetoreply.com/case-studies/' },
      { name: 'Guides', href: 'https://timetoreply.com/guides/' },
      { name: 'Blog', href: 'https://timetoreply.com/blog/' },
      { name: 'FAQs', href: 'https://timetoreply.com/quick-email-responses-faq/' },
      { name: 'Training', href: '#' },
      { name: 'User Manual', href: '#' },
      { name: 'Support', href: 'https://help.timetoreply.com' },
      { name: 'System Status', href: 'https://status.timetoreply.com/status/timetoreply' },
      { name: 'API Docs', href: '#' },
    ],
  },
  {
    title: 'OTHER',
    links: [
      { name: 'Contact Us', href: 'https://timetoreply.com/contact-support/' },
      { name: 'Email Response Management Software', href: '#' },
      { name: 'Email Analytics Software', href: 'https://timetoreply.com/' },
      { name: 'Email Reply Time Tracking', href: '#' },
      { name: 'Email Reporting Software', href: '#' },
      { name: 'Shared Mailbox Reporting Software', href: '#' },
      { name: 'Service Desk Analytics Software', href: '#' },
    ],
  },
];

const socialLinks = [
  { name: 'Facebook', href: 'https://www.facebook.com/timetoreply', icon: Facebook },
  { name: 'Twitter', href: 'https://twitter.com/time_to_reply', icon: Twitter },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/company/time-to-reply-ltd/', icon: Linkedin },
];

const legalLinksData = [
  { text: 'Security & Compliance', href: 'https://timetoreply.com/security/' },
  { text: 'SOC 2 Type II', href: 'https://timetoreply.com/wp-content/uploads/2025/09/Time-To-Reply-Ltd_Letter-of-Attestation-SOC-2-Type-2.pdf' },
  { text: 'ISO 27001', href: 'https://timetoreply.com/wp-content/uploads/2023/10/Timetoreply-Limited-ISO-IEC-27001-2022-Official-Certificate-2023-2024-bg.pdf' },
  { text: 'Google Security Audit', href: 'https://timetoreply.com/wp-content/uploads/2023/03/Time-to-Reply-Limited-GP-Timetoreply-Security-Assessment-2021-Testing-Letter-20210330-SIGNED.pdf' },
  { text: 'Incident Reporting', href: 'https://timetoreply.com/incident-reporting/' },
  { text: 'Terms & Conditions', href: 'https://timetoreply.com/terms-and-conditions/' },
  { text: 'Privacy Policy', href: 'https://timetoreply.com/privacy-policy/' },
  { text: 'GDPR', href: 'https://timetoreply.com/gdpr/' },
  { text: 'Status', href: 'https://status.timetoreply.com/status/timetoreply' },
];

const Footer = () => {
  return (
    <footer className="bg-white">
      <div className="max-w-[1200px] mx-auto py-16 px-8">
        <div className="flex flex-col lg:flex-row">
          <div className="mb-10 lg:mb-0 flex-shrink-0">
            <a href="https://timetoreply.com">
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/abd887e9-f493-4931-b980-ae13dd9c4515-timetoreply-com/assets/svgs/timetoreply-logo-1.svg?"
                alt="timetoreply logo"
                width={180}
                height={35}
              />
            </a>
          </div>
          <div className="flex-grow lg:ml-8 xl:ml-20">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
              {navSections.map((section) => (
                <div key={section.title}>
                  <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
                    {section.title}
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {section.links.map((link) => (
                      <li key={link.name}>
                        <a
                          href={link.href}
                          className="text-sm text-gray-600 hover:text-[#3EEDC3] transition-colors duration-200"
                        >
                          {link.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col-reverse md:flex-row md:justify-between md:items-center">
          <p className="text-xs text-gray-500 mt-8 md:mt-0 text-center md:text-left leading-relaxed">
            <span>© Copyright Timetoreply Limited 2025</span>
            {legalLinksData.map((link) => (
              <React.Fragment key={link.text}>
                <span className="mx-2">|</span>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#3EEDC3] transition-colors duration-200"
                >
                  {link.text}
                </a>
              </React.Fragment>
            ))}
          </p>
          <div className="flex space-x-6 md:order-last">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <span className="sr-only">{link.name}</span>
                <link.icon className="h-5 w-5" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
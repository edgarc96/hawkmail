import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Facebook, Twitter, Linkedin } from 'lucide-react';

const FooterColumn = ({ title, links }: { title: string; links: { text: string; href: string }[] }) => (
  <div>
    <h5 className="text-xs font-semibold uppercase tracking-widest text-primary-dark mb-6">
      {title}
    </h5>
    <ul className="space-y-4">
      {links.map((link) => (
        <li key={link.text}>
          {link.href.startsWith('/') ? (
            <Link href={link.href} className="text-base text-text-primary hover:text-primary-brand transition-colors">
              {link.text}
            </Link>
          ) : (
            <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-base text-text-primary hover:text-primary-brand transition-colors">
              {link.text}
            </a>
          )}
        </li>
      ))}
    </ul>
  </div>
);

const footerData = [
  {
    title: 'PRODUCT',
    links: [
      { text: 'Features', href: 'https://info.timetoreply.com/features' },
      { text: 'Pricing', href: '/pricing/' },
    ],
  },
  {
    title: 'INTEGRATIONS',
    links: [
      { text: 'Outlook', href: '/email-analytics-for-outlook-and-o365/' },
      { text: 'Gmail', href: '/email-analytics-for-gmail/' },
      { text: 'All Integrations', href: '/integrations/' },
    ],
  },
  {
    title: "WHO'S IT FOR",
    links: [
      { text: 'Corporate Travel', href: '/email-analytics-for-mid-market-large-corporate-travel-companies/' },
      { text: 'Insurance', href: '/email-analytics-for-insurance-companies/' },
      { text: 'Legal Services', href: '/email-analytics-for-leading-legal-services-companies/' },
      { text: 'Logistics', href: '/logistics-outbound/' },
      { text: 'Manufacturing', href: '/email-analytics-for-manufacturing-companies/' },
      { text: 'Professional Services', href: '/email-analytics-for-leading-professional-services-companies/' },
      { text: 'Property Management', href: '/email-analytics-for-large-property-management-companies/' },
      { text: 'Key Account Management Teams', href: '#' },
      { text: 'Customer Service Teams', href: '#' },
      { text: 'Remote Teams', href: '#' },
    ],
  },
  {
    title: 'RESOURCES',
    links: [
      { text: 'Case Studies', href: '/case-studies/' },
      { text: 'Guides', href: '/guides/' },
      { text: 'Blog', href: '/blog/' },
      { text: 'FAQs', href: '/quick-email-responses-faq/' },
      { text: 'Training', href: '#' },
      { text: 'User Manual', href: '#' },
      { text: 'Support', href: 'https://help.timetoreply.com/' },
      { text: 'System Status', href: 'https://status.timetoreply.com/status/timetoreply' },
      { text: 'API Docs', href: '#' },
    ],
  },
  {
    title: 'OTHER',
    links: [
      { text: 'Contact Us', href: '#' },
      { text: 'Email Response Management Software', href: '#' },
      { text: 'Email Analytics Software', href: '#' },
      { text: 'Email Reply Time Tracking', href: '#' },
      { text: 'Email Reporting Software', href: '#' },
      { text: 'Shared Mailbox Reporting Software', href: '#' },
    ],
  },
];

const legalLinks = [
  { text: 'Security & Compliance', href: '/security/' },
  { text: 'SOC 2 Type II', href: 'https://timetoreply.com/wp-content/uploads/2025/09/Time-To-Reply-Ltd_Letter-of-Attestation-SOC-2-Type-2.pdf' },
  { text: 'ISO 27001', href: 'https://timetoreply.com/wp-content/uploads/2023/10/Timetoreply-Limited-ISO-IEC-27001-2022-Official-Certificate-2023-2024-bg.pdf' },
  { text: 'Terms & Conditions', href: '/terms-and-conditions/' },
  { text: 'Privacy Policy', href: '/privacy-policy/' },
  { text: 'GDPR', href: '/gdpr/' },
  { text: 'Status', href: 'https://status.timetoreply.com/status/timetoreply' },
];

const LegalLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <>
    <span className="mx-1.5 text-text-secondary/50">|</span>
    {href.startsWith('/') ? (
      <Link href={href} className="hover:text-primary-dark transition-colors">{children}</Link>
    ) : (
      <a href={href} target="_blank" rel="noopener noreferrer" className="hover:text-primary-dark transition-colors">{children}</a>
    )}
  </>
);

const Footer = () => {
  return (
    <footer className="bg-background-primary pt-20 lg:pt-24 font-body">
      <div className="container mx-auto px-6 md:px-8">
        <div className="mb-16">
          <Link href="/">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/bed331a4-4ee3-449f-84a7-36725a6dadf3-timetoreply-com/assets/svgs/timetoreply-logo-1.svg?"
              alt="timetoreply logo"
              width={185}
              height={34}
              unoptimized
            />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-y-10 gap-x-8">
          {footerData.map((column) => (
            <FooterColumn key={column.title} title={column.title} links={column.links} />
          ))}
        </div>
      </div>

      <div className="mt-20 lg:mt-24 border-t border-border-divider">
        <div className="container mx-auto px-6 md:px-8 py-8">
          <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-y-6">
            <div className="flex flex-col md:flex-row items-center gap-y-4 md:gap-x-6 text-sm text-text-secondary">
              <div className="flex items-center space-x-6 order-first md:order-none">
                <a href="https://www.facebook.com/timetoreply" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <Facebook className="h-5 w-5 text-text-secondary hover:text-primary-dark transition-colors" />
                </a>
                <a href="https://twitter.com/time_to_reply" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <Twitter className="h-5 w-5 text-text-secondary hover:text-primary-dark transition-colors" />
                </a>
                <a href="https://www.linkedin.com/company/time-to-reply-ltd/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <Linkedin className="h-5 w-5 text-text-secondary hover:text-primary-dark transition-colors" />
                </a>
              </div>
              <p className="text-center">© Copyright Timetoreply Limited 2025</p>
            </div>
            <div className="text-center md:text-right text-sm text-text-secondary">
              <div className="flex flex-wrap items-center justify-center md:justify-end">
                {legalLinks.map((link, index) => (
                  <span key={link.text} className="whitespace-nowrap">
                    {index > 0 && <span className="mx-1.5 text-text-secondary/50">|</span>}
                    {link.href.startsWith('/') ? (
                        <Link href={link.href} className="hover:text-primary-dark transition-colors">{link.text}</Link>
                      ) : (
                        <a href={link.href} target="_blank" rel="noopener noreferrer" className="hover:text-primary-dark transition-colors">{link.text}</a>
                      )}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
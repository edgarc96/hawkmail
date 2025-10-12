"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    id: "item-1",
    question: "What is timetoreply, and how can it help my business improve email response times?",
    answer: "timetoreply is the only email analytics tool designed to help your team optimize email response times and meet their SLAs. It goes beyond just tracking response metrics—it makes them actionable by displaying real-time KPIs directly in your team’s inboxes, so they can stay proactive and deliver exceptional customer experiences.",
  },
  {
    id: "item-2",
    question: "Does timetoreply work with Outlook, Gmail, and other email platforms?",
    answer: "Yes, timetoreply seamlessly integrates with the two major email platforms, Outlook and Gmail. There’s no need to switch platforms or change the way your team works—our tool works with your existing email setup.",
  },
  {
    id: "item-3",
    question: "Can I measure response times for individual team members and shared mailboxes?",
    answer: "Absolutely! timetoreply lets you track email response metrics for both individual team members and shared mailboxes. You can even view performance live, filter by customer groups, and sort by internal or external communication to get a complete picture of your team’s email efficiency.",
  },
  {
    id: "item-4",
    question: "What insights and reports will I get from timetoreply?",
    answer: "With timetoreply, you’ll gain access to a custom dashboard where you can:\n\n- View individual or team response times.\n- Track SLA compliance in real time.\n- Filter by customer groups, communication type, or service tiers.\n- Export reports to share with stakeholders or use for coaching sessions.",
  },
  {
    id: "item-5",
    question: "Is there a free trial, and how much does it cost after the trial ends?",
    answer: "Yes, we offer a free trial so you can experience the power of timetoreply before committing. After the trial, our pricing depends on the size of your team and the features you need. Visit our pricing page or contact us for a tailored quote.",
  },
  {
    id: "item-6",
    question: "How does timetoreply ensure my email data stays secure?",
    answer: "We take your data security seriously. timetoreply is GDPR-compliant and doesn’t store email content. Instead, we work with metadata to provide analytics, ensuring your email communications remain private and secure.",
  },
  {
    id: "item-7",
    question: "Can I set specific response time goals (SLAs) and track how my team is performing?",
    answer: "Yes.! timetoreply allows you to set custom SLAs and KPIs for your team based on your specific goals. You can customize them per account, customer, or team, ensuring that every email gets the right level of attention and priority.",
  },
  {
    id: "item-8",
    question: "Will timetoreply help my team respond faster and improve customer satisfaction?",
    answer: "Absolutely. By displaying real-time response metrics and countdown timers directly in your team’s inboxes, timetoreply empowers them to stay on top of their targets. The result? Faster response times, improved customer satisfaction, and stronger customer relationships.",
  },
  {
    id: "item-9",
    question: "What kind of support can I expect when using timetoreply?",
    answer: "Our team is here to help you every step of the way. We provide hands-on onboarding, live chat, and email support to ensure you get the most out of timetoreply. Whether it’s setting up SLAs or interpreting reports, we’re just a message away.",
  },
  {
    id: "item-10",
    question: "How quickly can I get started with timetoreply?",
    answer: "Getting started is quick and easy. Just connect your email accounts, download the timetoreply extension, configure your SLAs, and start tracking live email performance. Most teams are up and running within minutes.",
  },
  {
    id: "item-11",
    question: "Can I connect with a real person for help during the free trial and beyond?",
    answer: "Yes! At timetoreply, we pride ourselves on providing exceptional support. During your free trial and after you become a customer, our friendly team is always available to assist. Whether you need help with setup, configuring SLAs, or understanding reports, you can reach us via live chat or email, and a helpful human will guide you every step of the way.",
  },
];

const FaqSection = () => {
  return (
    <section className="bg-[#faf8f5] px-8 py-16">
      <div className="mx-auto max-w-[900px]">
        <h2 className="mb-12 text-center text-[2rem] font-bold text-[#0f1729] md:text-[2.5rem]">
          FAQs
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item) => (
            <AccordionItem
              key={item.id}
              value={item.id}
              className="rounded-none border-b border-[#e5e7eb] bg-white last:border-b-0"
            >
              <AccordionTrigger className="py-6 px-6 text-left text-lg font-semibold text-[#0f1729] hover:bg-gray-50 hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="px-6 pt-4">
                <p className="whitespace-pre-line text-base leading-[1.6] text-gray-600">
                  {item.answer}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FaqSection;
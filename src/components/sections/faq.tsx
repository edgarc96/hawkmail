import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question:
      "What is timetoreply, and how can it help my business improve email response times?",
    answer:
      "timetoreply is the only email analytics tool designed to help your team optimize email response times and meet their SLAs. It goes beyond just tracking response metrics—it makes them actionable by displaying real-time KPIs directly in your team's inboxes, so they can stay proactive and deliver exceptional customer experiences.",
  },
  {
    question:
      "Does timetoreply work with Gmail?",
    answer:
      "Yes. Right now, timetoreply supports Gmail only. Support for additional platforms like Outlook is planned.",
  },
  {
    question:
      "Can I measure response times for individual team members and shared mailboxes?",
    answer:
      "Absolutely! timetoreply lets you track email response metrics for both individual team members and shared mailboxes. You can even view performance live, filter by customer groups, and sort by internal or external communication to get a complete picture of your team's email efficiency.",
  },
  {
    question: "What insights and reports will I get from timetoreply?",
    answer: (
      <div className="space-y-4">
        <p>
          With timetoreply, you'll gain access to a custom dashboard where you
          can:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>View individual or team response times.</li>
          <li>Track SLA compliance in real time.</li>
          <li>
            Filter by customer groups, communication type, or service tiers.
          </li>
          <li>
            Export reports to share with stakeholders or use for coaching
            sessions.
          </li>
        </ul>
      </div>
    ),
  },
  {
    question:
      "Is there a free trial, and how much does it cost after the trial ends?",
    answer:
      "Yes, we offer a free trial so you can experience the power of timetoreply before committing. After the trial, our pricing depends on the size of your team and the features you need. Visit our pricing page or contact us for a tailored quote.",
  },
  {
    question: "How does timetoreply ensure my email data stays secure?",
    answer:
      "We take your data security seriously. timetoreply is GDPR-compliant and doesn't store email content. Instead, we work with metadata to provide analytics, ensuring your email communications remain private and secure.",
  },
  {
    question:
      "Can I set specific response time goals (SLAs) and track how my team is performing?",
    answer:
      "Yes! timetoreply allows you to set custom SLAs and KPIs for your team based on your specific goals. You can customize them per account, customer, or team, ensuring that every email gets the right level of attention and priority.",
  },
  {
    question:
      "Will timetoreply help my team respond faster and improve customer satisfaction?",
    answer:
      "Absolutely. By displaying real-time response metrics and countdown timers directly in your team's inboxes, timetoreply empowers them to stay on top of their targets. The result? Faster response times, improved customer satisfaction, and stronger customer relationships.",
  },
  {
    question: "What kind of support can I expect when using timetoreply?",
    answer:
      "Our team is here to help you every step of the way. We provide hands-on onboarding, live chat, and email support to ensure you get the most out of timetoreply. Whether it's setting up SLAs or interpreting reports, we're just a message away.",
  },
  {
    question: "How quickly can I get started with timetoreply?",
    answer:
      "Getting started is quick and easy. Just connect your email accounts, download the timetoreply extension, configure your SLAs, and start tracking live email performance. Most teams are up and running within minutes.",
  },
  {
    question:
      "Can I connect with a real person for help during the free trial and beyond?",
    answer:
      "Yes! At timetoreply, we pride ourselves on providing exceptional support. During your free trial and after you become a customer, our friendly team is always available to assist. Whether you need help with setup, configuring SLAs, or understanding reports, you can reach us via live chat or email, and a helpful human will guide you every step of the way.",
  },
];

const FaqSection = () => {
  return (
    <section className="bg-background-primary py-16 font-body">
      <div className="container">
        <h2 className="text-center font-display text-4xl font-bold text-primary-dark lg:text-5xl">
          FAQs
        </h2>
        <div className="mx-auto mt-12 max-w-4xl">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="py-6 text-left text-lg font-semibold text-primary-dark hover:no-underline lg:text-xl">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="pt-0 pb-6 text-lg/relaxed text-text-primary">
                  {typeof item.answer === "string" ? (
                    <p>{item.answer}</p>
                  ) : (
                    item.answer
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
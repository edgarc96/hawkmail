import Image from 'next/image';

const departmentsData = [
  {
    iconSrc: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/bed331a4-4ee3-449f-84a7-36725a6dadf3-timetoreply-com/assets/images/1-1-18.png?",
    title: "Customer Success",
    description: "Ensure your teams are staying close to your most important upsell opportunities.",
    alt: "Customer success icon"
  },
  {
    iconSrc: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/bed331a4-4ee3-449f-84a7-36725a6dadf3-timetoreply-com/assets/images/2-1-19.png?",
    title: "Customer Service",
    description: "Prioritize customer responses by service tiers.",
    alt: "Customer service icon"
  },
  {
    iconSrc: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/bed331a4-4ee3-449f-84a7-36725a6dadf3-timetoreply-com/assets/images/3-1-20.png?",
    title: "Account Management",
    description: "Provide VIP accounts with incredibly swift response times.",
    alt: "Account management icon"
  },
];

const DepartmentsSection = () => {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-primary-dark lg:text-4xl max-w-4xl mx-auto">
            Timetoreply boosts email performance across departments.
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-y-12 md:grid-cols-3 md:gap-x-8 lg:gap-x-12">
          {departmentsData.map((department, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <Image
                src={department.iconSrc}
                alt={department.alt}
                width={80}
                height={80}
                className="mb-6"
              />
              <h3 className="text-2xl font-bold text-primary-dark mb-2">
                {department.title}
              </h3>
              <p className="text-lg text-text-secondary leading-relaxed max-w-xs">
                {department.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DepartmentsSection;
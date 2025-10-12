import React from 'react';
import Image from 'next/image';

const useCasesData = [
  {
    iconSrc: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/abd887e9-f493-4931-b980-ae13dd9c4515-timetoreply-com/assets/images/1-1-18.png?",
    title: "Customer Success",
    description: "Ensure your teams are staying close to your most important upsell opportunities."
  },
  {
    iconSrc: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/abd887e9-f493-4931-b980-ae13dd9c4515-timetoreply-com/assets/images/2-1-19.png?",
    title: "Customer Service",
    description: "Prioritize customer responses by service tiers."
  },
  {
    iconSrc: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/abd887e9-f493-4931-b980-ae13dd9c4515-timetoreply-com/assets/images/3-1-20.png?",
    title: "Account Management",
    description: "Provide VIP accounts with incredibly swift response times."
  }
];

const UseCasesSection = () => {
  return (
    <section className="bg-[#F5F3F0] py-16 px-8">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="text-center text-[#0f1729] text-[1.75rem] md:text-[2rem] font-bold mb-12">
          Timetoreply boosts email performance across departments.
        </h2>
        <div className="flex flex-col md:flex-row gap-8">
          {useCasesData.map((card, index) => (
            <div 
              key={index} 
              className="flex-1 bg-white rounded-xl p-10 shadow-[0_4px_24px_rgba(0,0,0,0.06)] text-center"
            >
              <Image
                src={card.iconSrc}
                alt={`${card.title} icon`}
                width={80}
                height={80}
                className="inline-block"
              />
              <h3 className="text-[#0f1729] text-2xl font-bold mt-6">
                {card.title}
              </h3>
              <p className="text-[#6B7280] text-base leading-[1.6] mt-3">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCasesSection;
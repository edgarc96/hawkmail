import Image from "next/image";
import { FC } from "react";

interface BenefitCardProps {
  iconSrc: string;
  iconAlt: string;
  title: string;
}

const benefitCards: BenefitCardProps[] = [
  {
    iconSrc: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/abd887e9-f493-4931-b980-ae13dd9c4515-timetoreply-com/assets/images/4-24.png?",
    iconAlt: "Increased revenue per customer icon",
    title: "Increased revenue per customer",
  },
  {
    iconSrc: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/abd887e9-f493-4931-b980-ae13dd9c4515-timetoreply-com/assets/images/5-25.png?",
    iconAlt: "Higher value customer relationships icon",
    title: "Higher value customer relationships",
  },
  {
    iconSrc: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/abd887e9-f493-4931-b980-ae13dd9c4515-timetoreply-com/assets/images/6-26.png?",
    iconAlt: "Increased loyalty from service-obsessed customers icon",
    title: "Increased loyalty from service-obsessed customers",
  },
];

const BenefitCard: FC<BenefitCardProps> = ({ iconSrc, iconAlt, title }) => (
  <div className="flex flex-col items-center bg-white rounded-xl p-10 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
    <Image
      src={iconSrc}
      alt={iconAlt}
      width={80}
      height={80}
      className="h-20 w-20"
    />
    <h3 className="mt-6 text-2xl font-bold text-[#0f1729]">
      {title}
    </h3>
  </div>
);

const BenefitsSection = () => {
  return (
    <section className="bg-white py-16 px-8">
      <div className="mx-auto max-w-[1200px]">
        <h2 className="mb-12 text-center text-[1.75rem] font-bold leading-tight text-[#0f1729] md:text-[2rem]">
          Delight customers with speed and efficiency... and reap the rewards.
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {benefitCards.map((card, index) => (
            <BenefitCard
              key={index}
              iconSrc={card.iconSrc}
              iconAlt={card.iconAlt}
              title={card.title}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
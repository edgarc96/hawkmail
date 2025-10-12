import React from 'react';

const statisticsData = [
  {
    value: "88%",
    description: "Of customers expect a reply within one hour of sending an email to a company",
    colorClass: "text-[#4ECDC4]",
  },
  {
    value: "86%",
    description: "Of customers expect their query to be resolved at the first contact",
    colorClass: "text-[#4ECDC4]",
  },
  {
    value: "Up to 15%",
    description: "Drop off in customer satisfaction for every interaction past the first",
    colorClass: "text-[#8B5CF6]",
  },
];

const StatCard = ({ value, description, colorClass }: { value: string; description: string; colorClass: string; }) => (
  <div className="flex-1 text-center">
    <p className={`text-[4rem] font-extrabold leading-none ${colorClass}`}>
      {value}
    </p>
    <p className="mt-2 text-base text-[#0f1729]">
      {description}
    </p>
  </div>
);

const StatisticsBanner = () => {
  return (
    <section className="w-full bg-[#faf8f5] py-12">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-start justify-center gap-6 md:gap-8">
          {statisticsData.map((stat, index) => (
            <StatCard
              key={index}
              value={stat.value}
              description={stat.description}
              colorClass={stat.colorClass}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatisticsBanner;
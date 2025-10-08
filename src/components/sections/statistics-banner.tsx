import React from 'react';

const statisticsData = [
  {
    value: "88%",
    description: "Of customers expect a reply within one hour of sending an email to a company",
    colorClass: "text-primary",
  },
  {
    value: "86%",
    description: "Of customers expect their query to be resolved at the first contact",
    colorClass: "text-[#35c6e8]", // Custom cyan blue from original website styling
  },
  {
    value: "Up to 15%",
    description: "Drop off in customer satisfaction for every interaction past the first",
    colorClass: "text-secondary-purple",
  },
];

const StatisticsBanner = () => {
  return (
    <section className="bg-background">
      <div className="container mx-auto">
        <div className="py-12 border-b border-border-divider">
          <div className="grid grid-cols-1 gap-y-10 md:grid-cols-3 md:gap-y-0 md:divide-x md:divide-border-divider">
            {statisticsData.map((stat, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-start space-y-3 px-8 text-center"
              >
                <p
                  className={`text-[4rem] font-bold leading-none ${stat.colorClass}`}
                >
                  {stat.value}
                </p>
                <p className="max-w-[280px] text-[15px] text-slate-600 leading-normal">
                  {stat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatisticsBanner;
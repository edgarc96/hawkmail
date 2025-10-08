import Image from 'next/image';

const benefitsData = [
  {
    iconSrc: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/bed331a4-4ee3-449f-84a7-36725a6dadf3-timetoreply-com/assets/images/4-24.png",
    title: "Increased revenue per customer",
  },
  {
    iconSrc: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/bed331a4-4ee3-449f-84a7-36725a6dadf3-timetoreply-com/assets/images/5-25.png",
    title: "Higher value customer relationships",
  },
  {
    iconSrc: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/bed331a4-4ee3-449f-84a7-36725a6dadf3-timetoreply-com/assets/images/6-26.png",
    title: "Increased loyalty from service-obsessed customers",
  },
];

const BenefitsSection = () => {
  return (
    <section className="bg-background-primary py-16">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-[2.5rem] font-bold leading-tight tracking-tight text-primary-dark lg:text-5xl">
            Delight customers with speed and efficiency... and reap the rewards.
          </h2>
        </div>
        <div className="mx-auto mt-16 grid max-w-none grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-3">
          {benefitsData.map((benefit, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <Image
                src={benefit.iconSrc}
                alt=""
                width={300}
                height={150}
                className="h-20 w-auto"
              />
              <h3 className="mt-6 text-2xl font-semibold text-primary-dark">
                {benefit.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
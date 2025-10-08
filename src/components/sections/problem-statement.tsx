import Image from 'next/image';

const problems = [
  {
    text: "You get generic metrics that don’t match your teams’ specific goals and priorities.",
  },
  {
    text: "You see where performance falls flat — but still need to coach your teams to improve.",
  },
  {
    text: "You tell your team they missed their targets after the fact... when it’s too late.",
  },
];

const ProblemStatement = () => {
  return (
    <section className="bg-background py-16">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-[2.5rem] font-bold text-primary-dark leading-[1.2] tracking-[-0.01em] md:text-[3rem] lg:max-w-4xl lg:mx-auto">
          On their own, dashboards deliver data — not improvement.
        </h2>
        <div className="mt-16 grid grid-cols-1 gap-y-16 md:grid-cols-3 md:gap-x-8">
          {problems.map((problem, index) => (
            <div key={index} className="flex flex-col items-center">
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/bed331a4-4ee3-449f-84a7-36725a6dadf3-timetoreply-com/assets/images/xmark-13.png?"
                alt="X-mark icon indicating a problem"
                width={80}
                height={80}
              />
              <p className="mt-6 text-lg leading-relaxed text-text-secondary lg:text-xl">
                {problem.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemStatement;
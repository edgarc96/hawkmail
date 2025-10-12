import Image from "next/image";

const painPointsData = [
  {
    id: 1,
    description: "You get generic metrics that don’t match your teams’ specific goals and priorities.",
  },
  {
    id: 2,
    description: "You see where performance falls flat — but still need to coach your teams to improve.",
  },
  {
    id: 3,
    description: "You tell your team they missed their targets after the fact... when it’s too late.",
  },
];

const ICON_URL = "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/abd887e9-f493-4931-b980-ae13dd9c4515-timetoreply-com/assets/images/xmark-13.png?";

const ProblemStatementSection = () => {
  return (
    <section className="bg-[#faf8f5] py-16 md:py-24">
      <div className="container mx-auto">
        <h2 className="text-center text-[2rem] md:text-[2.5rem] font-bold text-[#0f1729] mb-12 md:mb-16 leading-tight max-w-4xl mx-auto">
          On their own, dashboards deliver data — not improvement.
        </h2>
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-stretch justify-center">
          {painPointsData.map((point) => (
            <div 
              key={point.id} 
              className="flex-1 bg-white rounded-xl p-8 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)] flex flex-col items-center"
            >
              <div className="mb-6 md:mb-8">
                <Image
                  src={ICON_URL}
                  alt="A turquoise X icon indicating a problem"
                  width={60}
                  height={60}
                />
              </div>
              <h3 className="text-lg text-[#0f1729] font-semibold">
                {point.description}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemStatementSection;
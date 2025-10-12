import Image from "next/image";

const logos = [
  { src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/abd887e9-f493-4931-b980-ae13dd9c4515-timetoreply-com/assets/images/atpi-ltd-logo-vector-2.png?", alt: "ATPI logo" },
  { src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/abd887e9-f493-4931-b980-ae13dd9c4515-timetoreply-com/assets/images/Unknown-3.png?", alt: "Petronas logo" },
  { src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/abd887e9-f493-4931-b980-ae13dd9c4515-timetoreply-com/assets/images/Hiab-4.png?", alt: "Hiab logo" },
  { src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/abd887e9-f493-4931-b980-ae13dd9c4515-timetoreply-com/assets/images/Acuity-Brands-Logo-Green-306x44-2-5.png?", alt: "Acuity Brands logo" },
  { src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/abd887e9-f493-4931-b980-ae13dd9c4515-timetoreply-com/assets/images/aya-health-care-e1678790172692-6.png?", alt: "Aya Healthcare logo" },
  { src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/abd887e9-f493-4931-b980-ae13dd9c4515-timetoreply-com/assets/images/Willis-Towers-Watson-7.png?", alt: "WTW logo" },
  { src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/abd887e9-f493-4931-b980-ae13dd9c4515-timetoreply-com/assets/images/USRBP_Logo-8.jpg?", alt: "US Retirement & Benefits Partners logo" },
  { src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/abd887e9-f493-4931-b980-ae13dd9c4515-timetoreply-com/assets/images/1631642365864201-e1741819237876-9.png?", alt: "Charger Logistics logo" },
  { src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/abd887e9-f493-4931-b980-ae13dd9c4515-timetoreply-com/assets/images/Hit-Promo-Products-Logo-10.png?", alt: "Hit Promotional Products logo" },
  { src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/abd887e9-f493-4931-b980-ae13dd9c4515-timetoreply-com/assets/images/trillium-11.png?", alt: "Trillium Health Resources logo" },
  { src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/abd887e9-f493-4931-b980-ae13dd9c4515-timetoreply-com/assets/icons/Global-Furniture-Group-1.png?", alt: "Global Furniture Group logo" },
  { src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/abd887e9-f493-4931-b980-ae13dd9c4515-timetoreply-com/assets/images/munters-12.png?", alt: "Munters logo" },
];

const TrustedCompaniesLogos = () => {
  return (
    <section className="bg-white">
      <div className="max-w-[1200px] mx-auto py-16 px-8">
        <h2 className="text-center text-[#0f1729] text-2xl md:text-[2rem] font-bold mb-12">
          Trusted by companies who put their customers first
        </h2>
        <div className="flex justify-center items-center flex-wrap">
          {logos.map((logo, index) => (
            <div key={index} className="mx-4 my-6">
              <Image
                src={logo.src}
                alt={logo.alt}
                width={140}
                height={50}
                className="max-w-[100px] md:max-w-[140px] h-auto object-contain grayscale hover:grayscale-0 hover:scale-105 transition-all duration-300 ease-in-out"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustedCompaniesLogos;
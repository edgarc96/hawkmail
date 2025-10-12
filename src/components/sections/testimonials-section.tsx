import Image from 'next/image';

const testimonialsData = [
  {
    logoSrc: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/abd887e9-f493-4931-b980-ae13dd9c4515-timetoreply-com/assets/images/ontellus_logo_f-1@2x-21.webp?',
    logoAlt: 'Ontellus logo',
    logoWidth: 60,
    logoHeight: 40,
    quote: "In terms of responsiveness, it’s gone up from 62% to 86% as a company.",
    authorName: 'Lonnie Jackson',
    authorTitle: 'Vice President of Customer Management',
    grayscale: true,
  },
  {
    logoSrc: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/abd887e9-f493-4931-b980-ae13dd9c4515-timetoreply-com/assets/images/2019_Telarus_logo-03_viewimage-1@2x-22.webp?',
    logoAlt: 'Telarus logo',
    logoWidth: 114,
    logoHeight: 40,
    quote: "We have seen response times in particular groups go from 7 hours to 2 hours with the timetoreply data. This is getting information to our partners quicker and streamlining the way we work.",
    authorName: 'Kyra Augustus',
    authorTitle: 'Director of Partner Support – Central',
    grayscale: true, // Matches screenshot which shows it as grayscale
  },
  {
    logoSrc: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/abd887e9-f493-4931-b980-ae13dd9c4515-timetoreply-com/assets/images/Quantix-Logo-R-WB-RBG-23.webp?',
    logoAlt: 'Quantix logo',
    logoWidth: 175,
    logoHeight: 40,
    quote: "When it comes to communicating with our customers, timetoreply helps keep our teams performing at their best. The analytics help our leaders understand team performance and find opportunities to tweak and improve the service they're providing to our customers.",
    authorName: 'David Crowley',
    authorTitle: 'VP Operations',
    grayscale: false,
  },
];

interface TestimonialCardProps {
  logoSrc: string;
  logoAlt: string;
  logoWidth: number;
  logoHeight: number;
  quote: string;
  authorName: string;
  authorTitle: string;
  grayscale?: boolean;
}

const TestimonialCard = ({
  logoSrc,
  logoAlt,
  logoWidth,
  logoHeight,
  quote,
  authorName,
  authorTitle,
  grayscale = false,
}: TestimonialCardProps) => {
  return (
    <div className="flex flex-1 flex-col rounded-xl bg-white p-10 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
      <div className="mb-8 flex h-10 items-center">
        <Image
          src={logoSrc}
          alt={logoAlt}
          width={logoWidth}
          height={logoHeight}
          className={grayscale ? 'grayscale' : ''}
        />
      </div>
      <blockquote className="mb-8 flex-grow text-lg italic leading-[1.6] text-[#0A2540]">
        "{quote}"
      </blockquote>
      <div className="space-y-1 text-sm">
        <p className="font-bold text-[#0A2540]">{authorName}</p>
        <p className="text-[#6B7280]">{authorTitle}</p>
      </div>
    </div>
  );
};

const TestimonialsSection = () => {
  return (
    <section className="bg-[#faf8f5] px-8 py-16">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-col gap-6 md:flex-row md:gap-8">
          {testimonialsData.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
import Image from "next/image";

const testimonialsData = [
  {
    logoSrc: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/bed331a4-4ee3-449f-84a7-36725a6dadf3-timetoreply-com/assets/images/ontellus_logo_f-1@2x-21.webp?",
    logoAlt: "Ontellus logo",
    logoWidth: 125,
    logoHeight: 33,
    quote: "“In terms of responsiveness, it’s gone up from 62% to 86% as a company.”",
    authorName: "Lonnie Jackson",
    authorTitle: "Vice President of Customer Management",
  },
  {
    logoSrc: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/bed331a4-4ee3-449f-84a7-36725a6dadf3-timetoreply-com/assets/images/2019_Telarus_logo-03_viewimage-1@2x-22.webp?",
    logoAlt: "Telarus logo",
    logoWidth: 150,
    logoHeight: 41,
    quote: "“We have seen response times in particular groups go from 7 hours to 2 hours with the timetoreply data. This is getting information to our partners quicker and streamlining the way we work.”",
    authorName: "Kyra Augustus",
    authorTitle: "Director of Partner Support – Central",
  },
  {
    logoSrc: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/bed331a4-4ee3-449f-84a7-36725a6dadf3-timetoreply-com/assets/images/Quantix-Logo-R-WB-RBG-23.webp?",
    logoAlt: "Quantix logo",
    logoWidth: 153,
    logoHeight: 34,
    quote: "“When it comes to communicating with our customers, timetoreply helps keep our teams performing at their best. The analytics help our leaders understand team performance and find opportunities to tweak and improve the service they're providing to our customers.”",
    authorName: "David Crowley",
    authorTitle: "VP Operations",
  },
];

const Testimonials = () => {
  return (
    <section className="bg-background py-16">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonialsData.map((testimonial, index) => (
            <div 
              key={index} 
              className="flex flex-col bg-card p-6 rounded-lg border border-border shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
            >
              <div className="h-10 mb-6 flex items-center">
                <Image
                  src={testimonial.logoSrc}
                  alt={testimonial.logoAlt}
                  width={testimonial.logoWidth}
                  height={testimonial.logoHeight}
                  className="h-full w-auto object-contain object-left"
                />
              </div>
              <blockquote className="text-text-primary text-lg italic mb-6 flex-grow">
                {testimonial.quote}
              </blockquote>
              <div className="mt-auto">
                <p className="font-bold text-text-primary text-sm leading-snug">{testimonial.authorName}</p>
                <p className="text-text-secondary text-sm leading-snug">{testimonial.authorTitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
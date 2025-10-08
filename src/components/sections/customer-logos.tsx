import React from 'react';
import Image from 'next/image';

const logos = [
  { src: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/bed331a4-4ee3-449f-84a7-36725a6dadf3-timetoreply-com/assets/images/atpi-ltd-logo-vector-2.png?', alt: 'ATPI' },
  { src: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/bed331a4-4ee3-449f-84a7-36725a6dadf3-timetoreply-com/assets/images/Unknown-3.png?', alt: 'Petronas' },
  { src: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/bed331a4-4ee3-449f-84a7-36725a6dadf3-timetoreply-com/assets/images/Hiab-4.png?', alt: 'Hiab' },
  { src: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/bed331a4-4ee3-449f-84a7-36725a6dadf3-timetoreply-com/assets/images/Acuity-Brands-Logo-Green-306x44-2-5.png?', alt: 'Acuity Brands' },
  { src: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/bed331a4-4ee3-449f-84a7-36725a6dadf3-timetoreply-com/assets/images/aya-health-care-e1678790172692-6.png?', alt: 'Aya' },
  { src: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/bed331a4-4ee3-449f-84a7-36725a6dadf3-timetoreply-com/assets/images/Willis-Towers-Watson-7.png?', alt: 'WTW' },
  { src: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/bed331a4-4ee3-449f-84a7-36725a6dadf3-timetoreply-com/assets/images/USRBP_Logo-8.jpg?', alt: 'US Retirement & Benefit Partners' },
  { src: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/bed331a4-4ee3-449f-84a7-36725a6dadf3-timetoreply-com/assets/images/1631642365864201-e1741819237876-9.png?', alt: 'Charger Logistics' },
  { src: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/bed331a4-4ee3-449f-84a7-36725a6dadf3-timetoreply-com/assets/images/Hit-Promo-Products-Logo-10.png?', alt: 'Hit Promotional Products' },
  { src: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/bed331a4-4ee3-449f-84a7-36725a6dadf3-timetoreply-com/assets/images/trillium-11.png?', alt: 'Trillium Health Resources' },
  { src: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/bed331a4-4ee3-449f-84a7-36725a6dadf3-timetoreply-com/assets/icons/Global-Furniture-Group-1.png?', alt: 'Global Furniture Group' },
  { src: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/bed331a4-4ee3-449f-84a7-36725a6dadf3-timetoreply-com/assets/images/munters-12.png?', alt: 'Munters' },
];

const CustomerLogos = () => {
    return (
        <section className="bg-white py-16">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <h3 className="text-center text-primary-dark font-bold text-[32px] lg:text-4xl leading-[1.3] mb-16">
                    Trusted by companies who put their customers first
                </h3>
                <div className="flex flex-wrap justify-center items-center gap-8">
                    {logos.map((logo) => (
                        <div key={logo.alt} className="relative w-40 h-20 flex items-center justify-center">
                            <Image
                                src={logo.src}
                                alt={logo.alt}
                                fill
                                sizes="(max-width: 768px) 50vw, 160px"
                                className="object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CustomerLogos;
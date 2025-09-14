// src/components/home/AboutSection.tsx
import Image from "next/image";

interface AboutSectionProps {
  imageUrl: string;
}

export const AboutSection = ({ imageUrl }: AboutSectionProps) => {
  return (
    <section className="bg-white rounded-lg p-4 sm:p-6 md:p-8 mb-8 sm:mb-12">
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
        {/* Image - Shows first on mobile, left on desktop */}
        <div className="w-full md:w-1/3 flex justify-center order-1 md:order-1">
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-full overflow-hidden">
            <Image
              src={imageUrl}
              alt="About JasiriCup"
              fill
              style={{ objectFit: 'contain' }}
              className="rounded-full"
              sizes="(max-width: 640px) 192px, (max-width: 768px) 224px, 256px"
            />
          </div>
        </div>
        
        {/* Text Content */}
        <div className="w-full md:w-2/3 text-center md:text-left order-2 md:order-2">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-gray-800">
            About JasiriCup
          </h2>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
            This initiative targets girls in rural areas (ASAL Regions that remain inadequately served), who often lack access to affordable menstrual products and adequate education. This initiative targets girls in rural areas (ASAL Regions that remain inadequately served) products and adequate education.
          </p>
        </div>
      </div>
    </section>
  );
};
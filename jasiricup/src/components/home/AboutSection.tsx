import Image from "next/image";

interface AboutSectionProps {
  imageUrl: string;
  title: string;
  content: string;
}

export const AboutSection = ({ imageUrl, title, content }: AboutSectionProps) => {
  return (
    <section className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 md:p-8 mb-8 sm:mb-12 transition-colors duration-300">
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
        <div className="w-full md:w-1/3 flex justify-center order-1 md:order-1">
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-full overflow-hidden">
            <Image
              src={imageUrl}
              alt={title}
              fill
              style={{ objectFit: 'contain' }}
              className="rounded-full" 
              sizes="(max-width: 640px) 192px, (max-width: 768px) 224px, 256px"
            />
          </div>
        </div>
        
        <div className="w-full md:w-2/3 text-center md:text-left order-2 md:order-2">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-gray-800 dark:text-white transition-colors">
            {title}
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap transition-colors">
            {content}
          </p>
        </div>
      </div>
    </section>
  );
};
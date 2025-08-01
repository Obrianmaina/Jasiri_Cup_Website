import Image from "next/image";

interface AboutSectionProps {
  imageUrl: string; // Add imageUrl prop for Cloudinary integration
}

export const AboutSection = ({ imageUrl }: AboutSectionProps) => {
  return (
    <section className="bg-white rounded-lg p-8 mb-12 flex flex-col md:flex-row items-center">
      <div className="md:w-1/3 flex justify-center mb-8 md:mb-0">
        <Image
          src={imageUrl} // Use the imageUrl prop here
          alt="About JasiriCup"
          width={250}
          height={250}
          className="rounded-full shadow-lg"
        />
      </div>
      <div className="md:w-2/3 md:pl-8">
        <h2 className="text-3xl font-bold mb-4 text-gray-800 text-center md:text-left">About JasiriCup</h2>
        <p className="text-lg text-gray-600 text-center md:text-left">
          This initiative targets girls in rural areas (ASAL Regions that remain inadequately served), who often lack access to affordable menstrual products and adequate education. This initiative targets girls in rural areas (ASAL Regions that remain inadequately served) products and adequate education.
        </p>
      </div>
    </section>
  );
};

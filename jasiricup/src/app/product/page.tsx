import Image from "next/image";
import { HowToUseSection } from "@/components/product/HowToUseSection";
import { DownloadCard } from "@/components/product/DownloadCard";

export default function ProductPage() {
  // Placeholder Cloudinary URLs - replace 'dsvexizbx' with your actual Cloudinary cloud name
  const menstrualCupImage = "https://res.cloudinary.com/dsvexizbx/image/upload/v1754083512/cotton-mermaid-menstrual-cup-firm-plum-the-nappy-period-lady-removebg-preview_1_d8ltxm.png";
  const howToUseVideo = "https://res.cloudinary.com/dsvexizbx/video/upload/v1754084087/4487122-uhd_3840_2160_25fps_tlpncg.mp4"; // Assuming you'd host videos on Cloudinary too

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Product Overview Section */}
      <section className="bg-white rounded-lg p-8 mb-12 flex flex-col md:flex-row items-center justify-between">
        <div className="md:w-1/2 pr-8">
          <p className="text-sm text-gray-500 mb-2">Home / Product</p>
          <h1 className="text-4xl font-bold mb-4 text-gray-800">Menstrual Cup</h1>
          <p className="text-lg text-gray-600 mb-6">
            This initiative targets girls in rural areas (ASAL Regions that remain inadequately served), who often lack access to affordable menstrual products and adequate education.This initiative targets girls in rural areas (ASAL Regions that remain inadequately served) products and adequate education.
          </p>
        </div>
        <div className="md:w-1/2 mt-8 md:mt-0 flex justify-center">
          <Image
            src={menstrualCupImage} // Using the Cloudinary URL
            alt="Menstrual Cup"
            width={300}
            height={300}
            className="rounded-lg shadow-lg"
          />
        </div>
      </section>

      {/* How to Use Section - Updated to pass video URL */}
      <HowToUseSection videoUrl={howToUseVideo} />

      {/* Download Cards Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <DownloadCard
          title="How to Use"
          description="This initiative targets girls in rural areas (ASAL Regions that remain inadequately served), who often"
          icon="/icons/download-icon.svg" // Icons can remain local or be hosted externally
          downloadLink="https://res.cloudinary.com/dsvexizbx/image/upload/v1/documents/how-to-use-guide.pdf" // Example: PDF hosted on Cloudinary
        />
        <DownloadCard
          title="InfoSheet"
          description="This initiative targets girls in rural areas (ASAL Regions that remain inadequately served), who often"
          icon="/icons/download-icon.svg"
          downloadLink="https://res.cloudinary.com/dsvexizbx/image/upload/v1/documents/info-sheet.pdf"
        />
        <DownloadCard
          title="Hygiene Essentials"
          description="This initiative targets girls in rural areas (ASAL Regions that remain inadequately served), who often"
          icon="/icons/download-icon.svg"
          downloadLink="https://res.cloudinary.com/dsvexizbx/image/upload/v1/documents/hygiene-essentials.pdf"
        />
      </section>
    </div>
  );
}

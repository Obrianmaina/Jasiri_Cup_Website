import Image from "next/image";
import Link from "next/link"; // <-- import Link
import { HowToUseSection } from "@/components/product/HowToUseSection";
import { DownloadCard } from "@/components/product/DownloadCard";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";

export default function ProductPage() {
  const menstrualCupImage = "https://res.cloudinary.com/dsvexizbx/image/upload/v1754083512/cotton-mermaid-menstrual-cup-firm-plum-the-nappy-period-lady-removebg-preview_1_d8ltxm.png";

  const howToUseSteps = [
    {
      id: 1,
      title: "Step 1: Preparation",
      description: "Wash your hands thoroughly with soap and water. Sterilize the menstrual cup by boiling it in water for 5-10 minutes before first use.",
      videoUrl: "https://res.cloudinary.com/dsvexizbx/video/upload/v1754084087/4487122-uhd_3840_2160_25fps_tlpncg.mp4"
    },
    {
      id: 2,
      title: "Step 2: Insertion",
      description: "Fold the cup using your preferred folding technique. Insert the cup into your vagina at a 45-degree angle towards your tailbone.",
      videoUrl: "https://res.cloudinary.com/dsvexizbx/video/upload/v1754084087/4487122-uhd_3840_2160_25fps_tlpncg.mp4"
    },
    {
      id: 3,
      title: "Step 3: Removal",
      description: "Wash your hands, then gently pull the stem while bearing down with your pelvic muscles. Empty, rinse, and reinsert as needed.",
      videoUrl: "https://res.cloudinary.com/dsvexizbx/video/upload/v1754084087/4487122-uhd_3840_2160_25fps_tlpncg.mp4"
    }
  ];

  const productBreadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Product', href: '/product' },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-16 py-8">
      <Breadcrumbs items={productBreadcrumbs} />

      {/* Product Overview Section */}
      <section className="bg-white rounded-lg p-6 sm:p-8 mb-12 flex flex-col-reverse md:flex-row items-center justify-between">
        {/* Product Image */}
        <div className="w-full md:w-1/2 flex justify-center md:justify-start">
          <div className="relative w-full max-w-xs sm:max-w-sm aspect-square overflow-hidden rounded-lg">
            <Image
              src={menstrualCupImage}
              alt="Menstrual Cup"
              fill
              style={{ objectFit: 'contain' }}
              className="rounded-lg"
            />
          </div>
        </div>

        {/* Product Details */}
        <div className="w-full md:w-1/2 mt-6 md:mt-0 md:pr-8 text-center md:text-left">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-800">Menstrual Cup</h1>
          <p className="text-base sm:text-lg text-gray-600 mb-6">
            This initiative targets girls in rural areas (ASAL Regions that remain inadequately served), who often lack access to affordable menstrual products and adequate education. This initiative targets girls in rural areas (ASAL Regions that remain inadequately served) products and adequate education.
          </p>

          {/* Updated Link */}
          <Link
            href="/order"
            className="inline-block bg-[#7856BF] text-white px-6 py-3 rounded-full hover:bg-purple-700 transition-colors"
          >
            Get Yours Today
          </Link>
        </div>
      </section>

      {/* How to Use Section */}
      <HowToUseSection steps={howToUseSteps} />

      {/* Download Cards Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-12">
        <DownloadCard
          title="How to Use"
          description="This initiative targets girls in rural areas (ASAL Regions that remain inadequately served), who often"
          icon="/icons/download-icon.svg"
          downloadLink="https://res.cloudinary.com/dsvexizbx/image/upload/v1/documents/how-to-use-guide.pdf"
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

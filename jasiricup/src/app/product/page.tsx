// src/app/product/page.tsx
import Image from "next/image";
import Link from "next/link";
import { HowToUseSection } from "@/components/product/HowToUseSection";
import { DownloadCard } from "@/components/product/DownloadCard";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";

interface ProductStep {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
}

interface DownloadCardData {
  title: string;
  description: string;
  downloadLink: string;
}

interface ProductContent {
  title: string;
  description: string;
  heroImage: string;
  steps: ProductStep[];
  downloadCards: DownloadCardData[];
}

const FALLBACK_CONTENT: ProductContent = {
  title: 'Menstrual Cup',
  description: 'This initiative targets girls in rural areas (ASAL Regions that remain inadequately served), who often lack access to affordable menstrual products and adequate education. We provide safe, reusable, eco-friendly menstrual cups along with comprehensive education to help girls stay in school and thrive.',
  heroImage: 'https://res.cloudinary.com/dsvexizbx/image/upload/v1774461335/jasiricup/blog/arkg1r8epiy11wfu1zrw.png',
  steps: [
    {
      id: 1,
      title: 'Step 1: Preparation',
      description: 'Wash your hands thoroughly with soap and water. Sterilize the menstrual cup by boiling it in water for 5-10 minutes before first use.',
      videoUrl: 'https://res.cloudinary.com/dsvexizbx/video/upload/v1777722001/Step_1_mrs2fz.mp4',
    },
    {
      id: 2,
      title: 'Step 2: Insertion',
      description: 'Fold the cup using your preferred folding technique. Insert the cup into your vagina at a 45-degree angle towards your tailbone.',
      videoUrl: 'https://res.cloudinary.com/dsvexizbx/video/upload/v1777720696/Step_2_lojgkz.mp4',
    },
    {
      id: 3,
      title: 'Step 3: Removal',
      description: 'Wash your hands, then gently pull the stem while bearing down with your pelvic muscles. Empty, rinse, and reinsert as needed.',
      videoUrl: 'https://res.cloudinary.com/dsvexizbx/video/upload/v1777725550/Step_3_yzhvou.mp4',
    },
  ],
  downloadCards: [
    {
      title: 'How to Use',
      description: 'Download our comprehensive step-by-step guide for using the JasiriCup safely and effectively.',
      downloadLink: 'https://res.cloudinary.com/dsvexizbx/image/upload/v1/documents/how-to-use-guide.pdf',
    },
    {
      title: 'InfoSheet',
      description: 'Learn about the JasiriCup initiative, its impact, and how it helps girls in underserved communities.',
      downloadLink: 'https://res.cloudinary.com/dsvexizbx/image/upload/v1/documents/info-sheet.pdf',
    },
    {
      title: 'Hygiene Essentials',
      description: 'Tips and best practices for maintaining proper hygiene while using your menstrual cup.',
      downloadLink: 'https://res.cloudinary.com/dsvexizbx/image/upload/v1/documents/hygiene-essentials.pdf',
    },
  ],
};

async function getProductContent(): Promise<ProductContent> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const response = await fetch(`${baseUrl}/api/site-content?page=product`, {
      next: { tags: ['site-content-product'], revalidate: 300 },
    });

    if (!response.ok) return FALLBACK_CONTENT;

    const data = await response.json();
    const mainSection = data.data?.find((d: { section: string }) => d.section === 'main');

    if (mainSection?.content?.title) {
      // Merge with fallback to ensure all fields exist
      return {
        ...FALLBACK_CONTENT,
        ...mainSection.content,
        steps: mainSection.content.steps?.length > 0 ? mainSection.content.steps : FALLBACK_CONTENT.steps,
        downloadCards: mainSection.content.downloadCards?.length > 0 ? mainSection.content.downloadCards : FALLBACK_CONTENT.downloadCards,
      };
    }

    return FALLBACK_CONTENT;
  } catch {
    return FALLBACK_CONTENT;
  }
}

export default async function ProductPage() {
  const content = await getProductContent();

  const productBreadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Product', href: '/product' },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-16 py-8">
      <Breadcrumbs items={productBreadcrumbs} />

      {/* ── Hero Section ─────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-6 sm:p-10 mb-12 flex flex-col-reverse md:flex-row items-center justify-between gap-8 shadow-sm border border-purple-100">
        {/* Text */}
        <div className="w-full md:w-1/2 text-center md:text-left">
          <span className="inline-block bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
            Our Product
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-gray-900 leading-tight">
            {content.title}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mb-8 leading-relaxed max-w-md mx-auto md:mx-0">
            {content.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
            <Link
              href="/order"
              className="inline-flex items-center justify-center bg-purple-600 text-white px-8 py-3.5 rounded-full hover:bg-purple-700 transition-colors font-semibold shadow-md hover:shadow-lg"
            >
              Order Now →
            </Link>
            <a
              href="#how-to-use"
              className="inline-flex items-center justify-center border-2 border-purple-200 text-purple-700 px-8 py-3.5 rounded-full hover:border-purple-400 hover:bg-purple-50 transition-colors font-semibold"
            >
              How to Use
            </a>
          </div>
        </div>

        {/* Image */}
        <div className="w-full md:w-1/2 flex justify-center">
          <div className="relative w-72 h-72 sm:w-108 sm:h-108 rounded-2xl overflow-hidden border-4 border-white">
            <Image
              src={content.heroImage}
              alt={content.title}
              fill
              style={{ objectFit: 'contain' }}
              className="p-4"
              priority
            />
          </div>
        </div>
      </section>

      {/* ── Features Strip ───────────────────────────────────── */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {[
          { icon: '♻️', label: 'Eco-Friendly', sub: 'Reusable for years' },
          { icon: '💰', label: 'Cost-Effective', sub: 'Save money long-term' },
          { icon: '🏃‍♀️', label: 'Active Lifestyle', sub: 'Up to 12h protection' },
          { icon: '🌿', label: 'Body Safe', sub: 'Medical-grade silicone' },
        ].map(f => (
          <div key={f.label} className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100 hover:shadow-sm transition-shadow">
            <div className="text-2xl mb-2">{f.icon}</div>
            <p className="font-bold text-gray-800 text-sm">{f.label}</p>
            <p className="text-xs text-gray-500 mt-1">{f.sub}</p>
          </div>
        ))}
      </section>

      {/* ── How to Use ───────────────────────────────────────── */}
      <div id="how-to-use">
        <HowToUseSection steps={content.steps} />
      </div>

      {/* ── Download Cards ───────────────────────────────────── */}
      <section className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Resources & Downloads</h2>
          <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto">
            Access our guides, info sheets, and hygiene tips to get the most out of your JasiriCup.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {content.downloadCards.map((card, index) => (
            <DownloadCard
              key={index}
              title={card.title}
              description={card.description}
              icon="/icons/download-icon.svg"
              downloadLink={card.downloadLink}
            />
          ))}
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-8 sm:p-12 text-center text-white mb-4">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to Make a Change?</h2>
        <p className="text-purple-100 mb-6 max-w-md mx-auto text-sm sm:text-base">
          Join thousands of girls and women who have switched to JasiriCup for a healthier, more sustainable period experience.
        </p>
        <Link
          href="/order"
          className="inline-flex items-center justify-center bg-white text-purple-700 px-8 py-3.5 rounded-full font-bold hover:bg-purple-50 transition-colors shadow-md"
        >
          Get Yours Today
        </Link>
      </section>
    </div>
  );
}
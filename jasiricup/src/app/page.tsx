import Image from "next/image";
import { ImpactStoryCard } from "@/components/home/ImpactStoryCard";
import { AboutSection } from "@/components/home/AboutSection";
import { VisionMissionCards } from "@/components/home/VisionMissionCards";

export default function HomePage() {
  // In a real application, these image URLs would come from your database (e.g., MongoDB)
  // where you've stored the Cloudinary public URLs after uploading.
  const heroImageCloudinaryUrl = "https://res.cloudinary.com/dsvexizbx/image/upload/v1754082805/impact-story-hero_ilth4o.png"; // Placeholder Cloudinary URL
  const aboutImageCloudinaryUrl = "https://res.cloudinary.com/dsvexizbx/image/upload/v1754082804/about-jasiricup_y8uq1m.png"; // Placeholder Cloudinary URL

  // Mock data for blog posts - replace with actual data fetched from MongoDB
  // The imageSrc here would also eventually be a Cloudinary URL from your database
  const mockBlogPosts = [
    {
      id: '1',
      imageSrc: 'https://res.cloudinary.com/dsvexizbx/image/upload/v1/images/blog/impact-story-1.jpg',
      title: 'Impact Story Title 1',
      description: 'This initiative targets girls in rural areas (ASAL Regions that remain inadequately served), who often lack access to affordable menstrual products and adequate education.',
      linkHref: '/blog/impact-story-1'
    },
    // ... other blog posts (similar structure)
  ];


  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section - Updated to use a potential Cloudinary URL */}
      <section className="relative bg-gray-100 rounded-lg p-8 mb-12 flex flex-col md:flex-row items-center justify-between">
        <div className="md:w-1/2 pr-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">Impact Story Title</h1>
          <p className="text-lg text-gray-600 mb-6">
            This initiative targets girls in rural areas (ASAL regions that remain inadequately served), who often lack access to affordable menstrual products and adequate education.
          </p>
          <button className="bg-purple-600 text-white px-6 py-3 rounded-full hover:bg-purple-700 transition-colors">
            Read More
          </button>
        </div>
        <div className="md:w-1/2 mt-8 md:mt-0 flex justify-center">
          <Image
            src={heroImageCloudinaryUrl} // Using the Cloudinary URL
            alt="Impact Story Hero"
            width={400}
            height={400}
            className="rounded-lg shadow-lg"
          />
        </div>
      </section>

      {/* About JasiriCup Section - Updated to pass Cloudinary URL */}
      <AboutSection imageUrl={aboutImageCloudinaryUrl} />

      {/* Vision & Mission Section */}
      <VisionMissionCards />

      {/* Example of how ImpactStoryCard would receive Cloudinary URLs if used on this page */}
      {/*
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {mockBlogPosts.map(post => (
          <ImpactStoryCard
            key={post.id}
            imageSrc={post.imageSrc} // This would be the Cloudinary URL
            title={post.title}
            description={post.description}
            linkHref={post.linkHref}
          />
        ))}
      </section>
      */}
    </div>
  );
}

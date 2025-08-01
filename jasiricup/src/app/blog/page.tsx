import Image from "next/image";
import { BlogPostCard } from "@/components/blog/BlogPostCard";

export default function BlogPage() {
  // Placeholder Cloudinary URLs - replace 'dsvexizbx' with your actual Cloudinary cloud name
  const sustainablePeriodsHeroImage = "https://res.cloudinary.com/dsvexizbx/image/upload/v1754082792/forest_ganolr.png";

  // Mock data for blog posts - replace with actual data fetched from MongoDB
  // The imageSrc here would also eventually be a Cloudinary URL from your database
  const blogPosts = [
    {
      id: '1',
      imageSrc: 'https://res.cloudinary.com/dsvexizbx/image/upload/v1754082792/happy_girl-4_r7cwah.png',
      title: 'Impact Story Title 1',
      description: 'This initiative targets girls in rural areas (ASAL Regions that remain inadequately served), who often lack access to affordable menstrual products and adequate education.',
      linkHref: '/blog/impact-story-1'
    },
    {
      id: '2',
      imageSrc: 'https://res.cloudinary.com/dsvexizbx/image/upload/v1754082792/happy_girl-2_sgkfz4.png',
      title: 'Impact Story Title 2',
      description: 'This initiative targets girls in rural areas (ASAL Regions that remain inadequately served), who often lack access to affordable menstrual products and adequate education.',
      linkHref: '/blog/impact-story-2'
    },
    {
      id: '3',
      imageSrc: 'https://res.cloudinary.com/dsvexizbx/image/upload/v1754082792/happy_girl-3_ou7aqm.png', // Reusing image for demo
      title: 'Impact Story Title 3',
      description: 'This initiative targets girls in rural areas (ASAL Regions that remain inadequately served), who often lack access to affordable menstrual products and adequate education.',
      linkHref: '/blog/impact-story-3'
    },
    {
      id: '4',
      imageSrc: 'https://res.cloudinary.com/dsvexizbx/image/upload/v1754082792/happy_girl-5_ljvnx3.png', // Reusing image for demo
      title: 'Impact Story Title 4',
      description: 'This initiative targets girls in rural areas (ASAL Regions that remain inadequately served), who often lack access to affordable menstrual products and adequate education.',
      linkHref: '/blog/impact-story-4'
    },
    {
      id: '5',
      imageSrc: 'https://res.cloudinary.com/dsvexizbx/image/upload/v1754082792/happy_girl-1_dmdt6w.png', // Reusing image for demo
      title: 'Impact Story Title 5',
      description: 'This initiative targets girls in rural areas (ASAL Regions that remain inadequately served), who often lack access to affordable menstrual products and adequate education.',
      linkHref: '/blog/impact-story-5'
    },
    {
      id: '6',
      imageSrc: 'https://res.cloudinary.com/dsvexizbx/image/upload/v1754082792/happy_girl_iidnws.png', // Reusing image for demo
      title: 'Impact Story Title 6',
      description: 'This initiative targets girls in rural areas (ASAL Regions that remain inadequately served), who often lack access to affordable menstrual products and adequate education.',
      linkHref: '/blog/impact-story-6'
    },
  ];


  return (
    <div className="container mx-auto px-4 py-8">
      {/* Sustainable Periods Hero Section - Updated to use Cloudinary URL */}
      <section className="relative bg-gray-100 rounded-lg p-8 mb-12 flex flex-col md:flex-row items-center justify-between">
        <div className="md:w-1/2 pr-8">
          <p className="text-sm text-gray-500 mb-2">Home / Product / Blog</p>
          <h1 className="text-4xl font-bold mb-4 text-gray-800">Sustainable Periods</h1>
          <p className="text-lg text-gray-600 mb-6">
            This initiative targets girls in rural areas (ASAL Regions that remain inadequately served), who often lack access to affordable menstrual products and adequate education.
          </p>
          <button className="bg-purple-600 text-white px-6 py-3 rounded-full hover:bg-purple-700 transition-colors">
            Read More
          </button>
        </div>
        <div className="md:w-1/2 mt-8 md:mt-0 flex justify-center">
          <Image
            src={sustainablePeriodsHeroImage} // Using the Cloudinary URL
            alt="Sustainable Periods Hero"
            width={400}
            height={400}
            className="rounded-lg shadow-lg"
          />
        </div>
      </section>

      {/* Blog Post Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {blogPosts.map(post => (
          <BlogPostCard
            key={post.id}
            imageSrc={post.imageSrc} // This will be a Cloudinary URL from the mock data
            title={post.title}
            description={post.description}
            linkHref={post.linkHref}
          />
        ))}
      </section>
    </div>
  );
}

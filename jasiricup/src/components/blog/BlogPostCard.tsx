// src/components/blog/BlogPostCard.tsx
import Image from "next/image";
import Link from "next/link";

interface BlogPostCardProps {
  imageSrc: string;
  title: string;
  description: string;
  linkHref: string;
}

const DEFAULT_IMAGE = "https://res.cloudinary.com/dsvexizbx/image/upload/v1754082792/forest_ganolr.png";

export const BlogPostCard = ({ imageSrc, title, description, linkHref }: BlogPostCardProps) => {
  const imageSource = imageSrc && imageSrc.trim() ? imageSrc : DEFAULT_IMAGE;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden transform transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700 hover:shadow-xl h-full flex flex-col min-w-0 w-full">
      {/* Responsive Image Container */}
      <div className="relative w-full h-48 sm:h-56 bg-gray-100 dark:bg-gray-900 shrink-0">
        <Image
          src={imageSource}
          alt={title}
          fill
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      
      {/* Content Container */}
      {/* Added min-w-0 here to ensure flex children are allowed to shrink */}
      <div className="p-5 sm:p-6 flex flex-col flex-grow min-w-0">
        {/* Added break-words so long unbroken words wrap instead of breaking the layout */}
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3 transition-colors line-clamp-2 break-words">
          {title}
        </h3>
        {/* flex-grow pushes the button down if descriptions vary in length */}
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 transition-colors flex-grow line-clamp-3 break-words">
          {description}
        </p>
        
        <div className="mt-auto shrink-0">
          <Link 
            href={linkHref} 
            className="inline-block bg-purple-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 transition-colors shadow-sm"
          >
            Read More
          </Link>
        </div>
      </div>
    </div>
  );
};
// src/components/home/ImpactStoryCard.tsx
import Image from "next/image";
import Link from "next/link";

interface ImpactStoryCardProps {
  imageSrc: string;
  title: string;
  description: string;
  linkHref: string;
}

const DEFAULT_STORY_IMAGE = "https://res.cloudinary.com/dsvexizbx/image/upload/v1754082792/happy_girl-5_ljvnx3.png";

export const ImpactStoryCard = ({ imageSrc, title, description, linkHref }: ImpactStoryCardProps) => {
  const imageSource = imageSrc && imageSrc.trim() ? imageSrc : DEFAULT_STORY_IMAGE;
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transform transition-transform duration-300 hover:scale-105">
      <Image
        src={imageSource}
        alt={title}
        width={400}
        height={250}
        layout="responsive"
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-4">
          {description}
        </p>
        <Link href={linkHref} className="inline-block bg-purple-600 text-white px-4 py-2 rounded-full text-sm hover:bg-purple-700 transition-colors">
          Read More
        </Link>
      </div>
    </div>
  );
};
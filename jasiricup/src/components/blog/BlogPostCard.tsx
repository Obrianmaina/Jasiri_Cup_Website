import Image from "next/image";
import Link from "next/link";

interface BlogPostCardProps {
  imageSrc: string;
  title: string;
  description: string;
  linkHref: string;
}

export const BlogPostCard = ({ imageSrc, title, description, linkHref }: BlogPostCardProps) => {
  return (
    <div className="px-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden transform transition-transform duration-300 hover:scale-105">
        <Image
          src={imageSrc}
          alt={title}
          width={400}
          height={250}
          layout="responsive"
          className="w-full h-48 object-cover rounded-t-lg"
        />
        
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
          <p className="text-gray-600 text-sm mb-4" dangerouslySetInnerHTML={{ __html: description }} />
            
  
          <Link href={linkHref} className="inline-block bg-purple-600 text-white px-4 py-2 rounded-full text-sm hover:bg-purple-700 transition-colors">
            Read More
          </Link>
        </div>
      </div>
    </div>
  );
};

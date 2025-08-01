import Image from "next/image";
import Link from "next/link";

export const Header = () => {
  return (
    <header className="bg-white shadow-md py-4">
      <nav className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src="https://res.cloudinary.com/dsvexizbx/image/upload/v1754083461/logo_jrc0mv.png"
            alt="JasiriCup Logo"
            width={120}
            height={40}
            priority
          />
        </Link>
        <div className="flex space-x-8">
          <Link href="/" className="text-gray-700 hover:text-purple-600 font-medium">
            Home
          </Link>
          <Link href="/product" className="text-gray-700 hover:text-purple-600 font-medium">
            Product
          </Link>
          <Link href="/blog" className="text-gray-700 hover:text-purple-600 font-medium">
            Blog
          </Link>
          <Link href="/team" className="text-gray-700 hover:text-purple-600 font-medium">
            Team
          </Link>
        </div>
        <Link href="/get-in-touch" className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition-colors">
          Get In Touch
        </Link>
      </nav>
    </header>
  );
};

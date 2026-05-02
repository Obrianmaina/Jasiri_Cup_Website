// src/components/common/Footer.tsx
import Image from "next/image";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube } from 'react-icons/fa';

export const Footer = () => {
  const navLinks = [
    { name: 'Home',        href: '/' },
    { name: 'Product',     href: '/product' },
    { name: 'Blog',        href: '/blog' },
    { name: 'Team',        href: '/team' },
    { name: 'Get In Touch',href: '/get-in-touch' },
  ];

  const socialLinks = [
    { icon: FaFacebookF,  href: 'https://www.facebook.com/JasiriCup',   label: 'Facebook',  hoverClass: 'hover:text-blue-400' },
    { icon: FaInstagram,  href: 'https://www.instagram.com/JasiriCup',  label: 'Instagram', hoverClass: 'hover:text-pink-400' },
    { icon: FaLinkedinIn, href: 'https://www.linkedin.com/company/JasiriCup', label: 'LinkedIn', hoverClass: 'hover:text-blue-300' },
    { icon: FaYoutube,    href: 'https://www.youtube.com/JasiriCup',    label: 'YouTube',   hoverClass: 'hover:text-red-400' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-6 md:px-16 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Image
              src="https://res.cloudinary.com/dsvexizbx/image/upload/v1754083461/whitelogo_bpym4s.png"
              alt="JasiriCup Logo"
              width={130}
              height={44}
              className="object-contain"
            />
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              Providing menstrual products, health resources, and opportunities for youth development across Kenya.
            </p>
            <p className="text-xs text-gray-500">© {new Date().getFullYear()} JasiriCup. All rights reserved.</p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {navLinks.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social + Mission */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Connect With Us</h3>
            <div className="flex gap-4 mb-6">
              {socialLinks.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className={`text-gray-400 ${s.hoverClass} transition-colors`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <s.icon size={20} />
                </a>
              ))}
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Join us in making a positive impact! Every cup donated keeps a girl in school.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-6 md:px-16 py-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-gray-600">Built with ♥ for girls across Kenya</p>
          <Link href="/get-in-touch" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
            Partner with us →
          </Link>
        </div>
      </div>
    </footer>
  );
};
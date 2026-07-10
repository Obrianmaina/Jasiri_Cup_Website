// src/components/common/Footer.tsx
import Image from "next/image";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube, FaEnvelope } from 'react-icons/fa';

export const Footer = () => {
  // Split links into two categories for better footer layout
  const aboutLinks = [
    { name: 'Home',       href: '/' },
    { name: 'Product',    href: '/product' },
    { name: 'Guide',  href: '/guide' },
    { name: 'Our Impact', href: '/impact' },
    { name: 'Stories',    href: '/stories' },
    { name: 'Team',       href: '/team' },
    { name: 'Blog',       href: '/blog' },
  ];

  const getInvolvedLinks = [
    { name: 'Donate',       href: '/donate' },
    { name: 'Order a Cup',  href: '/order' },
    { name: 'Volunteer',    href: '/volunteer' },
    { name: 'Partners',     href: '/partners' },
    { name: 'Press',        href: '/press' },
    { name: 'Newsletter',   href: '/newsletter' },
    { name: 'Get In Touch', href: '/get-in-touch' },
  ];
  
  const socialLinks = [
    { icon: FaFacebookF,  href: 'https://www.facebook.com/JasiriCup',   label: 'Facebook',  hoverClass: 'hover:text-blue-400' },
    { icon: FaInstagram,  href: 'https://www.instagram.com/JasiriCup',  label: 'Instagram', hoverClass: 'hover:text-pink-400' },
    { icon: FaLinkedinIn, href: 'https://www.linkedin.com/company/JasiriCup', label: 'LinkedIn', hoverClass: 'hover:text-blue-300' },
    { icon: FaYoutube,    href: 'https://www.youtube.com/JasiriCup',    label: 'YouTube',   hoverClass: 'hover:text-red-400' },
    { icon: FaEnvelope,   href: 'mailto:correspondence@jasiricup.com', label: 'Email',     hoverClass: 'hover:text-green-400' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-6 md:px-16 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Image
              src="https://res.cloudinary.com/dsvexizbx/image/upload/v1754083461/whitelogo_bpym4s.png"
              alt="JasiriCup Logo"
              width={130}
              height={44}
              className="object-contain max-w-[130px] h-auto"
            />
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              Providing menstrual products, health resources, and opportunities for youth development across Kenya.
            </p>
            <p className="text-xs text-gray-500">© {new Date().getFullYear()} JasiriCup. All rights reserved.</p>
          </div>

          {/* Navigation Column 1 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">About JasiriCup</h3>
            <ul className="space-y-2">
              {aboutLinks.map(link => (
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

          {/* Navigation Column 2 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Get Involved</h3>
            <ul className="space-y-2">
              {getInvolvedLinks.map(link => (
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
        <div className="container mx-auto px-6 md:px-16 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-600">Built with 💚 for girls across Kenya</p>
          
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <Link href="/privacy" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/impressum" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Impressum
            </Link>
            <Link href="/get-in-touch" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
              Partner with us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
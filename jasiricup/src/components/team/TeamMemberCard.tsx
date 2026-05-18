import Image from "next/image";
import React from "react";
import { FaLinkedinIn, FaTwitter, FaFacebookF, FaInstagram, FaGlobe } from "react-icons/fa";

interface SocialLink {
  platform: string;
  url: string;
}

interface TeamMemberCardProps {
  imageSrc: string;
  name: string;
  role: string;
  description: string;
  cardColor: string;
  sqcardColor: string;
  reverseOrder?: boolean;
  socials?: SocialLink[];
}

export const TeamMemberCard = ({
  imageSrc,
  name,
  role,
  description,
  cardColor,
  sqcardColor,
  reverseOrder = false,
  socials,
}: TeamMemberCardProps) => {
  
  const getIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook': return <FaFacebookF size={18} />;
      case 'instagram': return <FaInstagram size={18} />;
      case 'x': 
      case 'twitter': return <FaTwitter size={18} />;
      case 'linkedin': return <FaLinkedinIn size={18} />;
      case 'website':
      default: return <FaGlobe size={18} />;
    }
  };

  return (
    <div className="px-4 md:px-8 lg:px-24">
      <div
        className={`flex flex-col md:flex-row items-center gap-8 md:gap-12 lg:gap-16 ${
          reverseOrder ? "md:flex-row-reverse" : ""
        }`}
      >
        {/* Image */}
        <div className="w-full md:w-2/5 lg:w-1/3 flex justify-center mb-4 md:mb-0 relative z-10">
          <Image
            src={imageSrc}
            alt={name}
            width={250}
            height={250}
            className="rounded-lg shadow-lg object-cover aspect-square w-48 md:w-56 lg:w-[250px] h-auto"
          />
        </div>

        {/* Text Card */}
        <div
          className={`w-full md:w-3/5 lg:w-2/3 ${cardColor} text-white rounded-lg p-6 md:p-8 shadow-md relative`}
        >
          <h3 className="text-xl md:text-2xl font-bold mb-1">{name}</h3>
          <p className="text-sm md:text-base font-semibold opacity-90 mb-4">
            {role}
          </p>
          <p className="text-base md:text-lg mb-6 leading-relaxed">
            {description}
          </p>

          {/* Dynamic Social Links */}
          {socials && socials.length > 0 && (
            <div className="flex gap-4 items-center">
              {socials.map((social, idx) => {
                if (!social.url) return null;
                return (
                  <a
                    key={idx}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/20 hover:bg-white/30 w-10 h-10 flex items-center justify-center rounded-full transition-colors"
                    aria-label={`${name}'s ${social.platform}`}
                  >
                    {getIcon(social.platform)}
                  </a>
                );
              })}
            </div>
          )}

          {/* Decorative square */}
          <div
            className={`absolute w-16 h-16 md:w-20 md:h-20 rounded-lg ${sqcardColor} ${
              reverseOrder
                ? "-top-8 -right-8 md:-top-10 md:-right-10 lg:-top-12 lg:-right-12"
                : "-top-8 -left-8 md:-top-10 md:-left-10 lg:-top-12 lg:-left-12"
            } hidden md:block`}
          ></div>
        </div>
      </div>
    </div>
  );
};
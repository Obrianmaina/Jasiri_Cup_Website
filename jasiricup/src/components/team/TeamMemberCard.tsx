import Image from "next/image";
import React from "react";

interface TeamMemberCardProps {
  imageSrc: string;
  name: string;
  description: string;
  cardColor: string;
  reverseOrder?: boolean; // Optional prop to reverse image/text order
}

export const TeamMemberCard = ({ imageSrc, name, description, cardColor, reverseOrder = false }: TeamMemberCardProps) => {
  return (
    <div className={`flex flex-col md:flex-row items-center gap-8 ${reverseOrder ? 'md:flex-row-reverse' : ''}`}>
      <div className="md:w-1/3 flex justify-center">
        <Image
          src={imageSrc}
          alt={name}
          width={250}
          height={250}
          className="rounded-full shadow-lg"
        />
      </div>
      <div className={`md:w-2/3 ${cardColor} text-white rounded-lg p-8 shadow-md relative`}>
        <h3 className="text-2xl font-bold mb-2">{name}</h3>
        <p className="text-lg">{description}</p>
        {/* Placeholder for the colored square/rectangle, adjust positioning with Tailwind */}
        <div className={`absolute w-16 h-16 rounded-lg ${cardColor} -top-4 ${reverseOrder ? '-left-4' : '-right-4'} hidden md:block`}></div>
      </div>
    </div>
  );
};

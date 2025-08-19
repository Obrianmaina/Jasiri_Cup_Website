import Image from "next/image";
import React from "react";

interface TeamMemberCardProps {
  imageSrc: string;
  name: string;
  description: string;
  cardColor: string;
  sqcardColor: string;
  reverseOrder?: boolean;
}

export const TeamMemberCard = ({
  imageSrc,
  name,
  description,
  cardColor,
  sqcardColor,
  reverseOrder = false,
}: TeamMemberCardProps) => {
  return (
    <div className="px-4 md:px-32"> {/* Smaller horizontal padding on mobile */}
      <div
        className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 ${
          reverseOrder ? "md:flex-row-reverse" : ""
        }`}
      >
        {/* Image */}
        <div className="w-full md:w-1/3 flex justify-center mb-4 md:mb-0">
          <Image
            src={imageSrc}
            alt={name}
            width={250}
            height={250}
            className="rounded-lg shadow-lg object-cover"
          />
        </div>

        {/* Text Card */}
        <div
          className={`w-full md:w-2/3 ${cardColor} text-white rounded-lg p-6 md:p-8 shadow-md relative`}
        >
          <h3 className="text-xl md:text-2xl font-bold mb-2">{name}</h3>
          <p className="text-base md:text-lg">{description}</p>

          {/* Decorative square */}
          <div
            className={`absolute w-16 h-16 md:w-20 md:h-20 rounded-lg ${sqcardColor} ${
              reverseOrder
                ? "-top-8 -right-8 md:-top-12 md:-right-12"
                : "-top-8 -left-8 md:-top-12 md:-left-12"
            } hidden md:block`}
          ></div>
        </div>
      </div>
    </div>
  );
};

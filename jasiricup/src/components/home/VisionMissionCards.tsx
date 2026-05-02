// src/components/home/VisionMissionCards.tsx
import React from 'react';

interface VisionMissionProps {
  vision: { title: string; content: string };
  mission: { title: string; content: string };
}

export const VisionMissionCards = ({ vision, mission }: VisionMissionProps) => {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-24 mb-8 md:mb-12 px-4 lg:px-16 mt-8">
      {/* Vision Card */}
      <div className="text-white rounded-lg p-6 sm:p-8 shadow-md relative isolate" style={{ backgroundColor: '#7856BF' }}>
        <h3 className="text-xl sm:text-2xl font-bold mb-3 md:mb-4 relative z-10">
          {vision.title}
        </h3>
        <p className="text-sm sm:text-base lg:text-lg leading-relaxed relative z-10 whitespace-pre-wrap">
          {vision.content}
        </p>
        {/* Decorative square popping out top right, hidden on mobile */}
        <div
           className="hidden sm:block absolute w-16 h-16 sm:w-20 sm:h-20 rounded-lg -top-6 -right-6 sm:-top-8 sm:-right-8 -z-10"
           style={{ backgroundColor: '#B998FF' }}
        ></div>
      </div>

      {/* Mission Card */}
      <div className="text-white rounded-lg p-6 sm:p-8 shadow-md relative isolate" style={{ backgroundColor: '#178E4E' }}>
        <h3 className="text-xl sm:text-2xl font-bold mb-3 md:mb-4 relative z-10">
          {mission.title}
        </h3>
        <p className="text-sm sm:text-base lg:text-lg leading-relaxed relative z-10 whitespace-pre-wrap">
          {mission.content}
        </p>
        {/* Decorative square popping out top right, hidden on mobile */}
        <div
           className="hidden sm:block absolute w-16 h-16 sm:w-20 sm:h-20 rounded-lg -top-6 -right-6 sm:-top-8 sm:-right-8 -z-10"
           style={{ backgroundColor: '#29EE84' }}
        ></div>
      </div>
    </section>
  );
};
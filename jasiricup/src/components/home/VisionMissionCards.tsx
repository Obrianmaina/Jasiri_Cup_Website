// src/components/home/VisionMissionCards.tsx
export const VisionMissionCards = () => {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-24 mb-8 md:mb-12 px-0 sm:px-4 lg:px-16">
      {/* Vision Card */}
      <div className="text-white rounded-lg p-6 sm:p-8 shadow-md relative overflow-hidden" style={{ backgroundColor: '#7856BF' }}>
        <h3 className="text-xl sm:text-2xl font-bold mb-3 md:mb-4 relative z-10">
          Jasiri Initiative Vision
        </h3>
        <p className="text-sm sm:text-base lg:text-lg leading-relaxed relative z-10">
          This initiative targets girls in rural areas (ASAL Regions that remain inadequately served), who often lack access to affordable menstrual products and adequate education.
        </p>
        {/* Decorative square - responsive sizing and positioning */}
        <div 
          className="absolute w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-lg -top-3 -right-3 sm:-top-6 sm:-right-6 lg:-top-12 lg:-right-12 opacity-80" 
          style={{ backgroundColor: '#B998FF' }}
        ></div>
      </div>

      {/* Mission Card */}
      <div className="text-white rounded-lg p-6 sm:p-8 shadow-md relative overflow-hidden" style={{ backgroundColor: '#178E4E' }}>
        <h3 className="text-xl sm:text-2xl font-bold mb-3 md:mb-4 relative z-10">
          Jasiri Initiative Mission
        </h3>
        <p className="text-sm sm:text-base lg:text-lg leading-relaxed relative z-10">
          This initiative targets girls in rural areas (ASAL Regions that remain inadequately served), who often lack access to affordable menstrual products and adequate education.
        </p>
        {/* Decorative square - responsive sizing and positioning */}
        <div 
          className="absolute w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-lg -top-3 -right-3 sm:-top-6 sm:-right-6 lg:-top-12 lg:-right-12 opacity-80" 
          style={{ backgroundColor: '#29EE84' }}
        ></div>
      </div>
    </section>
  );
};
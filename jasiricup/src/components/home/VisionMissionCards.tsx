export const VisionMissionCards = () => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-24 mb-8 md:mb-12 px-4 md:px-16">
      {/* Vision Card */}
      <div className="text-white rounded-lg p-6 md:p-8 shadow-md relative" style={{ backgroundColor: '#7856BF' }}>
        <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Jasiri Initiative Vision</h3>
        <p className="text-base md:text-lg leading-relaxed">
          This initiative targets girls in rural areas (ASAL Regions that remain inadequately served), who often lack access to affordable menstrual products and adequate education.
        </p>
        {/* Decorative square - responsive sizing and positioning */}
        <div 
          className="absolute w-12 h-12 md:w-20 md:h-20 rounded-lg -top-6 -right-6 md:-top-12 md:-right-12 hidden sm:block" 
          style={{ backgroundColor: '#B998FF' }}
        ></div>
      </div>

      {/* Mission Card */}
      <div className="text-white rounded-lg p-6 md:p-8 shadow-md relative" style={{ backgroundColor: '#178E4E' }}>
        <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Jasiri Initiative Mission</h3>
        <p className="text-base md:text-lg leading-relaxed">
          This initiative targets girls in rural areas (ASAL Regions that remain inadequately served), who often lack access to affordable menstrual products and adequate education.
        </p>
        {/* Decorative square - responsive sizing and positioning */}
        <div 
          className="absolute w-12 h-12 md:w-20 md:h-20 rounded-lg -top-6 -right-6 md:-top-12 md:-right-12 hidden sm:block" 
          style={{ backgroundColor: '#29EE84' }}
        ></div>
      </div>
    </section>
  );
};
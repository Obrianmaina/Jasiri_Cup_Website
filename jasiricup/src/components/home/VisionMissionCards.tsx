export const VisionMissionCards = () => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
      {/* Vision Card */}
      <div className="bg-purple-700 text-white rounded-lg p-8 shadow-md">
        <h3 className="text-2xl font-bold mb-4">Jasiri Initiative Vision</h3>
        <p className="text-lg">
          This initiative targets girls in rural areas (ASAL Regions that remain inadequately served), who often lack access to affordable menstrual products and adequate education.
        </p>
      </div>

      {/* Mission Card */}
      <div className="bg-green-600 text-white rounded-lg p-8 shadow-md">
        <h3 className="text-2xl font-bold mb-4">Jasiri Initiative Mission</h3>
        <p className="text-lg">
          This initiative targets girls in rural areas (ASAL Regions that remain inadequately served), who often lack access to affordable menstrual products and adequate education.
        </p>
      </div>
    </section>
  );
};

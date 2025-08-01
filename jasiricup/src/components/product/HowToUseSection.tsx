import React from 'react';

interface HowToUseSectionProps {
  videoUrl: string; // Add videoUrl prop for Cloudinary integration
}

export const HowToUseSection = ({ videoUrl }: HowToUseSectionProps) => {
  return (
    <section className="bg-white rounded-lg p-8 mb-12">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">How to use</h2>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2 space-y-6">
          <div className="flex items-start">
            <span className="bg-green-500 text-white w-8 h-8 flex items-center justify-center rounded-full text-lg font-bold mr-4 flex-shrink-0">1</span>
            <p className="text-lg text-gray-600">
              This initiative targets girls in rural areas (ASAL Regions that remain inadequately served),
            </p>
          </div>
          <div className="flex items-start">
            <span className="bg-green-500 text-white w-8 h-8 flex items-center justify-center rounded-full text-lg font-bold mr-4 flex-shrink-0">2</span>
            <p className="text-lg text-gray-600">
              This initiative targets girls in rural areas (ASAL Regions that remain inadequately served),
            </p>
          </div>
          <div className="flex items-start">
            <span className="bg-green-500 text-white w-8 h-8 flex items-center justify-center rounded-full text-lg font-bold mr-4 flex-shrink-0">3</span>
            <p className="text-lg text-gray-600">
              This initiative targets girls in rural areas (ASAL Regions that remain inadequately served),
            </p>
          </div>
        </div>
        <div className="md:w-1/2 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
          <video controls className="w-full h-full object-cover">
            <source src={videoUrl} type="video/mp4" /> {/* Use the videoUrl prop here */}
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </section>
  );
};

"use client";
import React from "react";

export interface MapCounty {
  name: string;
  region: string;
  girls: number;
  color: string;
  image?: string;
  imageAttribution?: string;
}

export interface MapData {
  title: string;
  subtitle: string;
  expansionNote: string;
  counties: MapCounty[];
}

const getHexColor = (colorClass: string) => {
  const supportedColors = [
    "purple", "green", "blue", "amber", "pink", "red", "orange",
    "yellow", "teal", "cyan", "indigo", "violet", "fuchsia", "rose", "slate", "gray",
  ];
  const matchedColor = supportedColors.find((color) => colorClass.includes(color));
  return matchedColor ? `bg-${matchedColor}-500` : "bg-purple-500";
};

const FALLBACK_IMAGE = "https://res.cloudinary.com/dsvexizbx/image/upload/v1754082792/happy_girl-5_ljvnx3.png";

export const ImpactCards = ({ mapData }: { mapData: MapData }) => {
  const hasCounties = mapData?.counties && mapData.counties.length > 0;

  // Fallback UI when there is no county data
  if (!hasCounties) {
    return (
      <section className="mb-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {mapData?.title || "Where We Work"}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            {mapData?.subtitle || "Mapping our impact across regions"}
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-800">
          <div className="bg-green-100 dark:bg-green-900/40 p-5 rounded-full mb-5">
            <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Regional Data Compiling</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md">
            We are currently aggregating our latest field distribution data to show our exact impact locations.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-20">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {mapData.title}
        </h2>
        <p className="text-gray-500 dark:text-gray-400">{mapData.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {mapData.counties.map((location, index) => (
          <div
            key={index}
            className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow"
          >
            {/* Background Image & Attribution */}
            <div className="absolute inset-0 z-0 flex justify-end pointer-events-auto">
              <div className="relative w-full sm:w-full h-full group/image">
                <img
                  src={location.image || FALLBACK_IMAGE}
                  alt={location.name}
                  className="absolute inset-0 w-full h-full object-cover object-center opacity-40 dark:opacity-30 transition-transform duration-700 group-hover/image:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent dark:from-gray-900 dark:via-gray-900/90 dark:to-transparent pointer-events-none"></div>

                {/* Attribution Tooltip */}
                {location.imageAttribution && (
                  <div className="absolute bottom-3 right-3 z-20 flex flex-col items-end">
                    <div className="mb-2 w-64 sm:w-72 break-words bg-gray-900/95 backdrop-blur-sm text-white text-[10px] sm:text-xs p-3 rounded-lg shadow-xl opacity-0 invisible group-hover/image:opacity-100 group-hover/image:visible transition-all duration-300 translate-y-2 group-hover/image:translate-y-0 [&_a]:text-blue-300 [&_a]:underline hover:[&_a]:text-blue-100">
                      <span dangerouslySetInnerHTML={{ __html: location.imageAttribution }} />
                    </div>
                    <div className="bg-black/60 backdrop-blur-md text-white/90 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm cursor-help border border-white/20">
                      ©
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Text Content */}
            <div className="relative z-10 p-6 sm:p-8 w-full sm:w-3/4 pointer-events-none">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-3 h-3 rounded-full shadow-sm ${getHexColor(location.color)}`} />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {location.name}
                </h3>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 font-medium">
                {location.region}
              </p>

              <div className="inline-flex flex-col">
                <span className="text-3xl font-black text-gray-900 dark:text-white leading-none mb-1">
                  {location.girls.toLocaleString()}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Girls Reached
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {mapData.expansionNote && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-full px-5 py-2 text-sm font-medium text-amber-700 dark:text-amber-400 shadow-sm">
            {mapData.expansionNote}
          </div>
        </div>
      )}
    </section>
  );
};
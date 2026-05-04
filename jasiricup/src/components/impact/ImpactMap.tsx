'use client';
import React from 'react';

export interface MapCounty {
  name: string;
  region: string;
  girls: number;
  color: string;
}

export interface MapData {
  title: string;
  subtitle: string;
  expansionNote: string;
  counties: MapCounty[];
}

// Recalibrated percentage positions for the new Kenya_location_map.svg
const countyPositions: Record<string, { top: string, left: string }> = {
  // Current Counties
  "Turkana": { top: "27%", left: "25%" },
  "Marsabit": { top: "31%", left: "55%" },
  "Mandera": { top: "22%", left: "91%" },
  "Wajir": { top: "41%", left: "80%" },
  "Garissa": { top: "60%", left: "79%" },
  "Kisumu": { top: "58%", left: "14%" },
  "Kilifi": { top: "86%", left: "72%" },
  "Kwale": { top: "93%", left: "69%" },
  
  // Future Expansion Counties (2025)
  "Lamu": { top: "75%", left: "84%" },
  "Isiolo": { top: "46%", left: "55%" },
  "Samburu": { top: "40%", left: "43%" },
  "West Pokot": { top: "40%", left: "19%" },
  "Tana River": { top: "70%", left: "66%" },
  
  // Reference
  "Nairobi": { top: "68%", left: "40%" }
};

export const ImpactMap = ({ mapData }: { mapData: MapData }) => {
  if (!mapData || !mapData.counties) return null;

  return (
    <section className="mb-20">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{mapData.title}</h2>
        <p className="text-gray-500 dark:text-gray-400">{mapData.subtitle}</p>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-6 sm:p-10 border border-green-100 dark:border-gray-700 mb-8">
        <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
          
          {/* Visual Map Area */}
          <div className="w-full lg:w-1/2 flex justify-center py-4">
            <div className="relative w-full max-w-[320px] aspect-[4/5] bg-blue-50/50 dark:bg-transparent rounded-xl">
              
              {/* Using the new Wikimedia map (stripped tracking parameters for clean loading) */}
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/2/2c/Kenya_location_map.svg" 
                alt="Map of Kenya" 
                className="w-full h-full object-contain opacity-90 transition-all mix-blend-multiply dark:mix-blend-normal" 
              />
              
              {/* Dynamic County Dots overlay from CMS Data */}
              {mapData.counties.map((county, index) => {
                const pos = countyPositions[county.name];
                if (!pos) return null;

                return (
                  <div 
                    key={index} 
                    className="absolute flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2 group"
                    style={{ top: pos.top, left: pos.left }}
                  >
                    {/* The Dot */}
                    <div className={`w-3 h-3 md:w-4 md:h-4 rounded-full shadow-md cursor-pointer transition-transform duration-300 group-hover:scale-150 ${county.color} border-2 border-white dark:border-gray-800`} />
                    
                    {/* Hover Tooltip Label */}
                    <span className="absolute top-full mt-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-[10px] md:text-xs font-bold px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 border border-gray-100 dark:border-gray-700">
                      {county.name}
                    </span>
                  </div>
                );
              })}

              {/* Static Reference Pin for Nairobi */}
              <div 
                className="absolute flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2"
                style={{ top: countyPositions["Nairobi"].top, left: countyPositions["Nairobi"].left }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm border-2 border-white dark:border-gray-800" />
                <span className="absolute top-full mt-1 text-amber-700 dark:text-amber-500 text-[9px] font-bold">Nairobi</span>
              </div>
            </div>
          </div>

          {/* County List */}
          <div className="w-full lg:w-1/2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mapData.counties.map((county, index) => (
                <div key={index} className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-800 transition-colors">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${county.color}`} />
                  <div className="min-w-0">
                    <div className="font-bold text-gray-800 dark:text-gray-100 text-sm">
                      {county.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {county.region} • {county.girls.toLocaleString()} girls
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {mapData.expansionNote && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-full px-5 py-2 text-sm font-medium text-amber-700 dark:text-amber-400">
            {mapData.expansionNote}
          </div>
        </div>
      )}
    </section>
  );
};
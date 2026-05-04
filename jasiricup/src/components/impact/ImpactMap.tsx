// src/components/impact/ImpactMap.tsx
// Static visual map of counties reached — no external map SDK needed

const countiesReached = [
  { name: 'Garissa', region: 'North East', girls: 2400, color: 'bg-purple-600' },
  { name: 'Turkana', region: 'Rift Valley', girls: 1800, color: 'bg-purple-500' },
  { name: 'Marsabit', region: 'North East', girls: 1200, color: 'bg-green-600' },
  { name: 'Kisumu', region: 'Nyanza', girls: 1600, color: 'bg-green-500' },
  { name: 'Kilifi', region: 'Coast', girls: 900, color: 'bg-purple-400' },
  { name: 'Mandera', region: 'North East', girls: 1100, color: 'bg-green-400' },
  { name: 'Wajir', region: 'North East', girls: 1300, color: 'bg-purple-600' },
  { name: 'Kwale', region: 'Coast', girls: 700, color: 'bg-green-600' },
];

export const ImpactMap = () => {
  return (
    <section className="mb-20">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Where We Work
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Active in 8 counties across Kenya, focusing on ASAL (Arid and Semi-Arid) regions
        </p>
      </div>

      {/* Kenya outline SVG (simplified schematic) */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-6 sm:p-10 border border-green-100 dark:border-gray-700 mb-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Schematic Kenya map using CSS shapes */}
          <div className="w-full lg:w-1/2 flex justify-center">
            <div className="relative w-64 h-72">
              {/* Kenya outline approximation */}
              <svg viewBox="0 0 200 240" className="w-full h-full">
                {/* Kenya polygon (simplified) */}
                <path
                  d="M60,10 L140,10 L170,40 L180,80 L170,130 L150,160 L130,200 L100,230 L70,200 L50,160 L30,130 L20,80 L30,40 Z"
                  fill="#f0fdf4"
                  stroke="#16a34a"
                  strokeWidth="2"
                  className="dark:fill-gray-800 dark:stroke-green-600"
                />
                {/* Lake Victoria */}
                <ellipse cx="45" cy="155" rx="18" ry="22" fill="#bfdbfe" opacity="0.7" />
                <text x="28" y="162" fontSize="7" fill="#3b82f6" className="font-medium">Lake</text>
                <text x="24" y="170" fontSize="7" fill="#3b82f6">Victoria</text>

                {/* County dots */}
                <circle cx="145" cy="65"  r="7" fill="#9333ea" opacity="0.85" /> {/* Mandera */}
                <circle cx="155" cy="90"  r="6" fill="#16a34a" opacity="0.85" /> {/* Wajir */}
                <circle cx="148" cy="115" r="8" fill="#9333ea" opacity="0.85" /> {/* Garissa */}
                <circle cx="60"  cy="55"  r="7" fill="#16a34a" opacity="0.85" /> {/* Turkana */}
                <circle cx="90"  cy="80"  r="5" fill="#9333ea" opacity="0.85" /> {/* Marsabit */}
                <circle cx="55"  cy="135" r="6" fill="#16a34a" opacity="0.85" /> {/* Kisumu */}
                <circle cx="120" cy="170" r="6" fill="#9333ea" opacity="0.85" /> {/* Kilifi */}
                <circle cx="100" cy="185" r="5" fill="#16a34a" opacity="0.85" /> {/* Kwale */}

                {/* Nairobi star */}
                <circle cx="95" cy="130" r="4" fill="#f59e0b" />
                <text x="100" y="128" fontSize="7" fill="#b45309">Nairobi</text>
              </svg>
            </div>
          </div>

          {/* County list */}
          <div className="w-full lg:w-1/2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {countiesReached.map((county) => (
                <div
                  key={county.name}
                  className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-700"
                >
                  <div className={`w-3 h-3 rounded-full ${county.color} flex-shrink-0`} />
                  <div className="min-w-0">
                    <div className="font-bold text-gray-800 dark:text-gray-100 text-sm">
                      {county.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {county.region} · {county.girls.toLocaleString()} girls
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block" />
                Primary focus
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-green-600 inline-block" />
                Active partner
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Expansion note */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-full px-5 py-2 text-sm font-medium text-amber-700 dark:text-amber-400">
          🗺️ Expanding to 5 new counties in 2025 — Lamu, Isiolo, Samburu, West Pokot, Tana River
        </div>
      </div>
    </section>
  );
};
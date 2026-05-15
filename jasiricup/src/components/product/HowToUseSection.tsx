// src/components/product/HowToUseSection.tsx
'use client';

interface ProductStep {
  id: number;
  title: string;
  description: string;
  videoUrl: string; // Kept for database backwards compatibility, but no longer rendered
}

interface HowToUseProps {
  steps: ProductStep[];
  mainVideoUrl?: string; // New optional prop for the bottom video
}

const SmartVideoPlayer = ({ url }: { url: string }) => {
  if (!url) return null;

  const lowerUrl = url.toLowerCase();

  // Handle YouTube Links
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
    const videoId = lowerUrl.includes('youtube.com/watch?v=') 
      ? url.split('v=')[1]?.split('&')[0] 
      : url.split('youtu.be/')[1]?.split('?')[0];
      
    return (
      <iframe className="w-full h-full absolute inset-0" src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
    );
  }

  // Handle Vimeo Links
  if (lowerUrl.includes('vimeo.com')) {
    const vimeoId = url.split('vimeo.com/')[1]?.split('?')[0];
    return (
      <iframe className="w-full h-full absolute inset-0" src={`https://player.vimeo.com/video/${vimeoId}`} frameBorder="0" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen></iframe>
    );
  }

  // --- THE CLOUDINARY FIX ---
  // Intercept the URL and inject web-optimization flags
  let optimizedUrl = url;
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    // If the URL doesn't already have optimization flags, add them.
    // f_auto = automatic format, q_auto = optimal quality/compression
    if (!url.includes('f_auto')) {
      optimizedUrl = url.replace('/upload/', '/upload/f_auto,q_auto/');
    }
  }

  // Handle Raw Video Files
  return (
    <video 
      key={optimizedUrl} 
      className="w-full h-full absolute inset-0 object-cover bg-black" 
      controls 
      playsInline 
      preload="auto" /* Forces the browser to aggressively fetch the start of the video */
    >
      <source src={optimizedUrl} type={optimizedUrl.includes('.webm') ? 'video/webm' : 'video/mp4'} />
      Your browser does not support the video tag.
    </video>
  );
};

export const HowToUseSection = ({ steps, mainVideoUrl }: HowToUseProps) => {
  if (!steps || steps.length === 0) return null;

  return (
    <section className="mb-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 transition-colors">How to Use JasiriCup</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Three simple steps to safe, comfortable, and sustainable period management.</p>
      </div>
      
      {/* Clean Grid Layout for Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-16">
        {steps.map((step, index) => (
          <div key={step.id || index} className="bg-white dark:bg-gray-900 p-8 pt-10 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 relative hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="absolute -top-6 left-6 bg-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold border-4 border-white dark:border-gray-950 shadow-sm transition-colors">
              {index + 1}
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white transition-colors">{step.title}</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base transition-colors">
              {step.description}
            </p>
          </div>
        ))}
      </div>

      {/* Optional Main Video at the bottom */}
      {mainVideoUrl && mainVideoUrl.trim() !== '' && (
        <div className="max-w-4xl mx-auto mt-20">
          <h3 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white transition-colors">Watch the Tutorial</h3>
          <div className="aspect-video w-full relative rounded-3xl bg-black dark:bg-gray-900 overflow-hidden shadow-xl border border-gray-100 dark:border-gray-800">
            <SmartVideoPlayer url={mainVideoUrl} />
          </div>
        </div>
      )}
    </section>
  );
};
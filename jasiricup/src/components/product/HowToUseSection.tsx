'use client';

import { useState } from 'react';

interface ProductStep {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
}

interface HowToUseProps {
  steps: ProductStep[];
}

// A smart component that handles YouTube, Vimeo, and raw videos seamlessly
const SmartVideoPlayer = ({ url }: { url: string }) => {
  if (!url) return <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-500">Video not available</div>;

  // Handle YouTube Links
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const videoId = url.includes('youtube.com/watch?v=') 
      ? url.split('v=')[1]?.split('&')[0] 
      : url.split('youtu.be/')[1]?.split('?')[0];
      
    return (
      <iframe
        className="w-full h-full absolute inset-0"
        src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    );
  }

  // Handle Vimeo Links
  if (url.includes('vimeo.com')) {
    const vimeoId = url.split('vimeo.com/')[1]?.split('?')[0];
    return (
      <iframe
        className="w-full h-full absolute inset-0"
        src={`https://player.vimeo.com/video/${vimeoId}`}
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      ></iframe>
    );
  }

  // Handle Raw Video Files (.mp4, .webm, etc.)
  return (
    <video
      className="w-full h-full absolute inset-0 object-cover"
      src={url}
      controls
      playsInline // Required for iOS to not force fullscreen
      preload="metadata"
    >
      Your browser does not support the video tag.
    </video>
  );
};

export const HowToUseSection = ({ steps }: HowToUseProps) => {
  const [activeStep, setActiveStep] = useState(0);

  if (!steps || steps.length === 0) return null;

  return (
    <section className="mb-20">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center transition-colors">How to Use JasiriCup</h2>
      
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
        
        {/* Left Side: The Interactive Steps */}
        <div className="w-full lg:w-1/2 space-y-4">
          {steps.map((step, index) => (
            <div 
              key={step.id || index} 
              onClick={() => setActiveStep(index)}
              className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${
                activeStep === index 
                  ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 shadow-md' 
                  : 'border-transparent bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-4 mb-3">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm transition-colors ${
                  activeStep === index ? 'bg-purple-600 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                }`}>
                  {index + 1}
                </div>
                <h3 className={`text-xl font-bold transition-colors ${activeStep === index ? 'text-purple-700 dark:text-purple-400' : 'text-gray-900 dark:text-white'}`}>
                  {step.title}
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 pl-12 transition-colors">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Right Side: The Smart Video Player */}
        <div className="w-full lg:w-1/2 lg:sticky lg:top-24">
          <div className="aspect-video w-full relative rounded-2xl bg-black dark:bg-gray-900 overflow-hidden shadow-xl border border-gray-100 dark:border-gray-800">
            <SmartVideoPlayer url={steps[activeStep]?.videoUrl} />
          </div>
        </div>

      </div>
    </section>
  );
};
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface HowToUseStep {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
}

interface HowToUseSectionProps {
  steps: HowToUseStep[];
}

export const HowToUseSection = ({ steps }: HowToUseSectionProps) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  const currentStep = steps.find(step => step.id === activeStep);

  // Detect screen size client-side
  useEffect(() => {
    const checkSize = () => setIsDesktop(window.innerWidth >= 1024);
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  // Safe play function that handles promises properly
  const safePlay = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      // Wait for any pending play promise to resolve first
      if (playPromiseRef.current) {
        await playPromiseRef.current;
      }
      
      const playPromise = videoRef.current.play();
      playPromiseRef.current = playPromise;
      
      await playPromise;
      playPromiseRef.current = null;
    } catch (err) {
      // Only log if it's not an AbortError (which is expected when interrupted)
      if (err.name !== 'AbortError') {
        console.error('Error playing video:', err);
      }
      playPromiseRef.current = null;
    }
  }, []);

  // Safe pause function
  const safePause = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      // Wait for any pending play promise to resolve before pausing
      if (playPromiseRef.current) {
        await playPromiseRef.current;
      }
      
      if (!videoRef.current.paused) {
        videoRef.current.pause();
      }
    } catch (err) {
      // Ignore AbortError as it's expected when play is interrupted
      if (err.name !== 'AbortError') {
        console.error('Error pausing video:', err);
      }
    } finally {
      playPromiseRef.current = null;
    }
  }, []);

  // Handle video playback when step changes
  useEffect(() => {
    if (videoRef.current && currentStep) {
      videoRef.current.load();
      if (isPlaying) {
        safePlay();
      }
    }
  }, [activeStep, currentStep, isPlaying, safePlay]);

  const handleActivateStep = useCallback((stepId: number) => {
    setActiveStep(stepId);
    setIsPlaying(true);
  }, []);

  const handleStepLeave = useCallback(() => {
    if (isDesktop) {
      setIsPlaying(false);
      safePause();
    }
  }, [isDesktop, safePause]);

  const handleVideoLoad = useCallback(() => {
    if (videoRef.current && isPlaying) {
      safePlay();
    }
  }, [isPlaying, safePlay]);

  return (
    <section className="bg-gray-50 rounded-lg p-8 mb-12">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">How to Use</h2>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Steps List */}
        <div className="w-full lg:w-1/2 space-y-4">
          {steps.map(step => (
            <button
              key={step.id}
              type="button"
              className={`w-full text-left p-6 rounded-lg transition-all duration-300 ${
                activeStep === step.id
                  ? 'bg-[#1AA75B] text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-100 hover:shadow-md'
              }`}
              onMouseEnter={() => isDesktop && handleActivateStep(step.id)}
              onMouseLeave={handleStepLeave}
              onClick={() => handleActivateStep(step.id)}
              aria-selected={activeStep === step.id}
            >
              <h3
                className={`text-xl font-semibold mb-2 ${
                  activeStep === step.id ? 'text-white' : 'text-gray-800'
                }`}
              >
                {step.title}
              </h3>
              <p
                className={`text-sm ${
                  activeStep === step.id ? 'text-gray-100' : 'text-gray-600'
                }`}
              >
                {step.description}
              </p>

              {/* Step indicator */}
              <div className="flex items-center mt-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    activeStep === step.id
                      ? 'bg-white text-[#1AA75B]'
                      : 'bg-[#1AA75B] text-white'
                  }`}
                >
                  {step.id}
                </div>
                {step.id < steps.length && (
                  <div
                    className={`flex-1 h-0.5 ml-2 ${
                      activeStep === step.id ? 'bg-white' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Video Player */}
        <div className="w-full lg:w-1/2">
          <div className="relative bg-white rounded-lg overflow-hidden shadow-lg">
            <video
              ref={videoRef}
              key={currentStep?.videoUrl || 'fallback'}
              className="w-full h-auto min-h-[300px] lg:min-h-[400px] object-cover"
              muted
              loop
              playsInline
              onLoadedData={handleVideoLoad}
              poster={
                activeStep === 0
                  ? "https://res.cloudinary.com/dsvexizbx/image/upload/v1754083512/cotton-mermaid-menstrual-cup-firm-plum-the-nappy-period-lady-removebg-preview_1_d8ltxm.png"
                  : undefined
              }
            >
              {currentStep && (
                <source src={currentStep.videoUrl} type="video/mp4" />
              )}
              Your browser does not support the video tag.
            </video>

            {/* Overlay info only when a step is active */}
            {currentStep && (
              <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-70 text-white p-4 rounded-lg">
                <h4 className="font-semibold text-lg mb-1">{currentStep.title}</h4>
                <p className="text-sm opacity-90">{currentStep.description}</p>
              </div>
            )}

            {/* Play indicator */}
            {currentStep && !isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center">
                  <span className="text-white text-lg">▶</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 text-center text-gray-600 text-sm">
            <p>Tap or hover over steps to play corresponding videos</p>
          </div>
        </div>
      </div>
    </section>
  );
};
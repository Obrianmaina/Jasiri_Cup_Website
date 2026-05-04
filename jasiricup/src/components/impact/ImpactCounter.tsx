'use client';
// src/components/impact/ImpactCounter.tsx
import { useEffect, useRef, useState } from 'react';

interface ImpactCounterProps {
  value: number;
  label: string;
  description: string;
  icon: string;
  color: string;
}

function useCountUp(target: number, duration = 2000, startOnMount = true) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!startOnMount) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.3 },
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started, startOnMount]);

  useEffect(() => {
    if (!started) return;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, target, duration]);

  return { count, ref };
}

export const ImpactCounter = ({
  value,
  label,
  description,
  icon,
  color,
}: ImpactCounterProps) => {
  const { count, ref } = useCountUp(value);

  const formatted =
    value >= 1000
      ? count.toLocaleString()
      : count.toString();

  return (
    <div
      ref={ref}
      className="group bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden relative"
    >
      {/* Background gradient accent */}
      <div
        className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${color} opacity-10 rounded-bl-full transition-all duration-300 group-hover:opacity-20 group-hover:w-28 group-hover:h-28`}
      />
      <div className="text-3xl mb-3">{icon}</div>
      <div
        className={`text-3xl sm:text-4xl font-black bg-gradient-to-r ${color} bg-clip-text text-transparent mb-1`}
      >
        {formatted}
        {value >= 1000 ? '+' : ''}
      </div>
      <div className="font-bold text-gray-800 dark:text-gray-100 text-sm sm:text-base mb-1">
        {label}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
};
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-hidden relative">
      {/* Animated gradient background */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
              rgba(255, 107, 107, 0.4) 0%, 
              transparent 50%),
            radial-gradient(circle at ${100 - mousePosition.x}% ${100 - mousePosition.y}%, 
              rgba(78, 205, 196, 0.3) 0%, 
              transparent 50%)
          `,

        }}
      />

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
        
      {/* Small tagline */}
      <div className="mb-6 flex items-center gap-2 sm:gap-3">
        <div className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent to-white/50" />
        <span className="text-[10px] sm:text-sm tracking-[0.2em] sm:tracking-[0.3em] text-white/60 uppercase font-light whitespace-nowrap">
          Movement • Connection • Flow
        </span>
        <div className="h-px w-8 sm:w-12 bg-gradient-to-l from-transparent to-white/50" />
      </div>

      {/* Main title */}
      <h1 className="text-center mb-8">
        <span 
          className="block text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight"
          style={{
            background: 'linear-gradient(135deg, #fff 0%, #fff 40%, #ff6b6b 60%, #4ecdc4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          ACRO
        </span>
        <span 
          className="block text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-extralight tracking-widest -mt-2 sm:-mt-4"
          style={{
            background: 'linear-gradient(135deg, #4ecdc4 0%, #fff 40%, #fff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          EVENTS
        </span>
      </h1>

        {/* Subtitle */}
        <p className="text-white/50 text-lg md:text-xl text-center max-w-md font-light mb-16">
          Curated acrobatic workshops and gatherings around the world
        </p>

        {/* Animated line */}
        <div className="w-px h-24 bg-gradient-to-b from-white/50 to-transparent mb-16 animate-pulse" />

      </div>

      {/* Events section - bottom of page */}
      <div className="relative z-10 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xs tracking-[0.4em] text-white/40 uppercase mb-8 text-center">
            Upcoming Events
          </h2>
          
          <Link 
            href="/paulo-thailand"
            className="group block"
          >
            <div className="relative border border-white/10 rounded-2xl p-8 backdrop-blur-sm 
                          hover:border-white/30 hover:bg-white/5 transition-all duration-500
                          overflow-hidden">
              
              {/* Hover glow effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                   style={{
                     background: 'radial-gradient(circle at 50% 50%, rgba(78, 205, 196, 0.1) 0%, transparent 70%)',
                   }} 
              />
              
              <div className="relative flex items-center justify-between">
                <div>
                  <span className="text-teal-400/80 text-xs tracking-widest uppercase">
                    Thailand • 2025
                  </span>
                  <h3 className="text-2xl md:text-3xl font-light mt-2 group-hover:text-teal-300 transition-colors">
                    Paulo&apos;s Acrobatic Intensive
                  </h3>
                  <p className="text-white/40 mt-2 font-light">
                    Multi-day workshops exploring standing acrobatics, L-base, and flow
                  </p>
                </div>
                
                {/* Arrow */}
                <div className="text-white/30 group-hover:text-teal-400 group-hover:translate-x-2 transition-all duration-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* Placeholder for future events */}
          <div className="mt-4 border border-dashed border-white/10 rounded-2xl p-8 text-center">
            <p className="text-white/20 text-sm">More events coming soon</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-8 text-center">
        <p className="text-white/40 text-sm mb-4">
          For colab, contact: <a href="mailto:contact@acrovents.com" className="text-teal-400 hover:text-teal-300 transition-colors">contact@acrovents.com</a>
        </p>
        <p className="text-white/20 text-xs tracking-widest">
          © 2025 ACRO EVENTS
        </p>
      </footer>
    </div>
  );
}

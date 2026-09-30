import React from 'react';
import { Sparkles, Wand2, Compass, Zap, Flame, Rocket, Star } from 'lucide-react';
import { INSPIRATION_IDEAS } from '../constants/presets';

interface ComicHeroProps {
  onStartCreating: () => void;
  onSelectInspiration: (idea: string) => void;
}

export const ComicHero: React.FC<ComicHeroProps> = ({
  onStartCreating,
  onSelectInspiration,
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-amber-300 via-amber-200 to-amber-100 border-b-4 border-black py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
      {/* Comic Halftone Overlay */}
      <div className="absolute inset-0 bg-halftone-dots opacity-40 pointer-events-none" />

      {/* Decorative Comic Stickers */}
      <div className="hidden lg:block absolute top-6 left-8 -rotate-12 select-none pointer-events-none animate-pulse">
        <div className="bg-red-600 text-yellow-300 font-bangers text-3xl px-4 py-2 border-3 border-black shadow-[4px_4px_0_0_#000] rounded-lg">
          POW!!
        </div>
      </div>

      <div className="hidden lg:block absolute bottom-6 right-10 rotate-6 select-none pointer-events-none">
        <div className="bg-cyan-400 text-black font-bangers text-2xl px-4 py-2 border-3 border-black shadow-[4px_4px_0_0_#000] rounded-lg">
          BAM! ✨
        </div>
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Top Comic Tag */}
        <div className="inline-flex items-center gap-2 bg-black text-amber-300 font-bangers text-base sm:text-lg px-4 py-1 rounded-full border-2 border-amber-400 shadow-[3px_3px_0_0_#ea580c] mb-4">
          <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
          <span>STUDENT & BEGINNER FRIENDLY AI COMIC STUDIO</span>
          <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
        </div>

        {/* Main Title */}
        <h1 className="font-bangers text-5xl sm:text-7xl lg:text-8xl tracking-wide text-black drop-shadow-[4px_4px_0_#ffffff] leading-none mb-3">
          ComicCraft
        </h1>

        {/* Big Catchy Slogan */}
        <p className="font-bangers text-2xl sm:text-4xl text-red-600 tracking-wide drop-shadow-[2px_2px_0_#fff] mb-4">
          “Turn Your Ideas Into Amazing Comics with AI”
        </p>

        {/* Subtitle */}
        <p className="font-comic text-base sm:text-xl text-slate-800 max-w-2xl mx-auto font-bold leading-relaxed mb-8">
          Enter any simple idea, pick a genre & visual style, and watch Google Gemini write character dialogues, dramatic narrations, scene descriptions, and complete panel-by-panel comic books!
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          <button
            onClick={onStartCreating}
            className="flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white font-bangers text-2xl sm:text-3xl px-8 py-3.5 rounded-2xl border-4 border-black shadow-[6px_6px_0_0_#000000] hover:translate-x-1 hover:translate-y-1 active:translate-x-2 active:translate-y-2 transition-all group"
          >
            <Wand2 className="w-7 h-7 text-yellow-300 group-hover:rotate-12 transition-transform" />
            <span>CREATE YOUR COMIC NOW</span>
            <Zap className="w-6 h-6 fill-yellow-300 text-yellow-300" />
          </button>
        </div>

        {/* Quick Inspiration Sparks */}
        <div className="bg-white/90 backdrop-blur-sm border-3 border-black rounded-2xl p-4 sm:p-5 comic-shadow max-w-3xl mx-auto text-left">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-5 h-5 text-red-600 fill-red-600" />
            <h3 className="font-bangers text-lg sm:text-xl text-black">
              Try an instant story starter (Click to craft!):
            </h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {INSPIRATION_IDEAS.slice(0, 4).map((idea, idx) => (
              <button
                key={idx}
                onClick={() => onSelectInspiration(idea)}
                className="text-left font-comic text-xs sm:text-sm font-bold bg-amber-50 hover:bg-yellow-200 border-2 border-black rounded-lg px-3 py-1.5 transition-colors flex items-center gap-1.5 shadow-[2px_2px_0_0_#000]"
              >
                <span>{idx === 0 ? '🤖' : idx === 1 ? '🐱' : idx === 2 ? '✏️' : '🛸'}</span>
                <span className="line-clamp-1">{idea}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

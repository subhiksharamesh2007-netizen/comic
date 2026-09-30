import React from 'react';
import { BookOpen, Sparkles, FolderHeart, Printer, Play, PlusCircle } from 'lucide-react';
import { ComicStory } from '../types/comic';

interface HeaderProps {
  currentStory: ComicStory | null;
  savedStoriesCount: number;
  onOpenCreator: () => void;
  onOpenLibrary: () => void;
  onOpenReader: () => void;
  onOpenExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStory,
  savedStoriesCount,
  onOpenCreator,
  onOpenLibrary,
  onOpenReader,
  onOpenExport,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-amber-400 border-b-4 border-black shadow-[0_4px_0_0_#000000] no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="bg-red-600 border-3 border-black p-2 rounded-xl rotate-[-3deg] shadow-[3px_3px_0_0_#000] flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-yellow-300 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bangers text-3xl sm:text-4xl tracking-wider text-black drop-shadow-[2px_2px_0_#fff]">
                ComicCraft
              </span>
              <span className="hidden sm:inline-block bg-black text-amber-300 font-bangers text-xs px-2 py-0.5 rounded rotate-2 uppercase tracking-wide">
                AI Powered
              </span>
            </div>
            <p className="text-xs font-bold text-black/80 font-comic tracking-tight hidden sm:block">
              Turn Your Ideas Into Amazing Comics with Gemini AI
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenCreator}
            className="flex items-center gap-2 bg-yellow-300 hover:bg-yellow-200 text-black font-bangers text-lg sm:text-xl px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border-3 border-black comic-shadow hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 transition-all"
            title="Create a new comic story"
          >
            <PlusCircle className="w-5 h-5 stroke-[2.5]" />
            <span>New Comic</span>
          </button>

          <button
            onClick={onOpenLibrary}
            className="flex items-center gap-1.5 bg-white hover:bg-amber-100 text-black font-bangers text-base sm:text-lg px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border-3 border-black comic-shadow hover:translate-x-0.5 hover:translate-y-0.5 transition-all relative"
            title="Browse saved comics"
          >
            <FolderHeart className="w-5 h-5" />
            <span className="hidden md:inline">Library</span>
            <span className="bg-red-600 text-white font-bangers text-xs px-1.5 py-0.2 rounded-full border border-black ml-1">
              {savedStoriesCount}
            </span>
          </button>

          {currentStory && (
            <>
              <button
                onClick={onOpenReader}
                className="flex items-center gap-1.5 bg-cyan-400 hover:bg-cyan-300 text-black font-bangers text-base sm:text-lg px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border-3 border-black comic-shadow hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                title="Immersive comic reader mode"
              >
                <Play className="w-4 h-4 fill-black" />
                <span className="hidden sm:inline">Reader Mode</span>
              </button>

              <button
                onClick={onOpenExport}
                className="flex items-center gap-1.5 bg-emerald-400 hover:bg-emerald-300 text-black font-bangers text-base sm:text-lg px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border-3 border-black comic-shadow hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                title="Print or export comic book"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden md:inline">Print / Export</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Maximize2,
  Play,
  Pause,
  Sparkles,
  Camera,
} from 'lucide-react';
import { ComicStory, ComicPanel } from '../types/comic';
import { generateComicBackdropSvg } from '../utils/comicArtRenderer';
import { playComicLineAudio } from '../services/geminiService';

interface ComicReaderModalProps {
  story: ComicStory;
  onClose: () => void;
}

export const ComicReaderModal: React.FC<ComicReaderModalProps> = ({
  story,
  onClose,
}) => {
  const [currentPanelIndex, setCurrentPanelIndex] = useState(0);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(false);

  const panel: ComicPanel = story.panels[currentPanelIndex];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPanelIndex, story.panels.length]);

  const handleNext = () => {
    if (currentPanelIndex < story.panels.length - 1) {
      setCurrentPanelIndex(currentPanelIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentPanelIndex > 0) {
      setCurrentPanelIndex(currentPanelIndex - 1);
    }
  };

  // Play narration & speech for active panel
  const handleReadCurrentPanel = async () => {
    if (isPlayingVoice || !panel) return;
    setIsPlayingVoice(true);
    try {
      if (panel.narration) {
        await playComicLineAudio(panel.narration, 'Puck');
        await new Promise((r) => setTimeout(r, 600));
      }
      for (const d of panel.dialogues) {
        await playComicLineAudio(`${d.speakerName}: ${d.text}`, 'Kore');
        await new Promise((r) => setTimeout(r, 500));
      }

      if (isAutoAdvancing && currentPanelIndex < story.panels.length - 1) {
        setCurrentPanelIndex((prev) => prev + 1);
      }
    } finally {
      setIsPlayingVoice(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 sm:p-6 text-white select-none backdrop-blur-md">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between max-w-5xl mx-auto w-full border-b-2 border-white/20 pb-3">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 text-yellow-300 font-bangers text-xs px-2.5 py-1 rounded border border-white">
            READER MODE
          </div>
          <div>
            <h2 className="font-bangers text-xl sm:text-2xl text-yellow-400 tracking-wide line-clamp-1">
              {story.title}
            </h2>
            <p className="font-comic text-xs text-slate-300 hidden sm:block">
              {story.issueNumber || '#1'} • {story.visualStyle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReadCurrentPanel}
            disabled={isPlayingVoice}
            className={`flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-black font-bangers text-sm sm:text-base px-3 py-1.5 rounded-lg border-2 border-black comic-shadow-sm transition-transform ${
              isPlayingVoice ? 'animate-pulse' : ''
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>{isPlayingVoice ? 'Reading Aloud...' : 'Read Aloud'}</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-red-600 text-white rounded-lg border border-white/30 transition-colors"
            title="Close reader"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Panel Cinema View */}
      <div className="flex-1 flex items-center justify-center my-3 relative max-w-4xl mx-auto w-full">
        {/* Previous Button */}
        <button
          onClick={handlePrev}
          disabled={currentPanelIndex === 0}
          className={`absolute left-0 sm:-left-12 z-30 p-2 sm:p-3 rounded-full border-2 border-black bg-yellow-400 text-black comic-shadow transition-transform hover:scale-110 active:scale-95 disabled:opacity-30 disabled:pointer-events-none`}
        >
          <ChevronLeft className="w-6 h-6 stroke-[3]" />
        </button>

        {/* Comic Panel Canvas Container */}
        <div className="relative w-full max-h-[75vh] aspect-[4/3] bg-slate-900 border-4 border-black rounded-3xl comic-shadow-xl overflow-hidden flex flex-col justify-between p-4 sm:p-6">
          {/* Visual Artwork Background */}
          {panel.imageUrl ? (
            <img
              src={panel.imageUrl}
              alt={panel.sceneDescription}
              className="absolute inset-0 w-full h-full object-cover z-0"
            />
          ) : (
            <div
              className="absolute inset-0 w-full h-full z-0 opacity-90"
              dangerouslySetInnerHTML={{
                __html: generateComicBackdropSvg(
                  panel.title || '',
                  panel.sceneDescription,
                  panel.cameraAngle,
                  story.visualStyle,
                  panel.panelNumber
                ),
              }}
            />
          )}

          {/* Halftone Texture */}
          <div className="absolute inset-0 bg-halftone-dots opacity-20 pointer-events-none z-1" />

          {/* Top Panel Badges */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="bg-black text-yellow-400 font-bangers text-base sm:text-lg px-3 py-1 rounded-md border-2 border-yellow-400 comic-shadow-sm">
              PANEL {panel.panelNumber} OF {story.panels.length}
            </span>

            <span className="bg-red-600 text-white font-bangers text-xs sm:text-sm px-2.5 py-1 rounded border-2 border-black">
              {panel.cameraAngle}
            </span>
          </div>

          {/* Narration Banner */}
          {panel.narration && (
            <div className="relative z-10 self-start max-w-[85%] bg-yellow-300 text-black border-3 border-black rounded-lg p-2.5 comic-shadow-sm rotate-[-0.5deg] my-2">
              <p className="font-comic text-xs sm:text-sm font-black leading-snug">
                {panel.narration}
              </p>
            </div>
          )}

          {/* Sound Effect Sticker */}
          {panel.soundEffect && (
            <div
              className="absolute z-10"
              style={{
                top: '40%',
                left: '45%',
                transform: `translate(-50%, -50%) rotate(${panel.soundEffect.rotation || '-10deg'})`,
              }}
            >
              <div className="bg-yellow-400 text-red-600 font-bangers text-4xl sm:text-6xl px-4 py-2 border-4 border-black rounded-xl shadow-[5px_5px_0_0_#000] tracking-wider animate-bounce">
                {panel.soundEffect.text}
              </div>
            </div>
          )}

          {/* Speech Bubbles */}
          <div className="relative z-10 flex flex-col gap-3 my-auto">
            {panel.dialogues.map((d) => (
              <div
                key={d.id}
                className={`max-w-[80%] p-3 rounded-2xl border-3 border-black comic-shadow-sm ${
                  d.bubbleType === 'shout'
                    ? 'bg-yellow-100 text-black border-red-600 shadow-[3px_3px_0_0_#dc2626] uppercase font-black'
                    : d.bubbleType === 'thought'
                    ? 'bg-white text-black border-dashed border-sky-600 rounded-3xl'
                    : 'bg-white text-black speech-bubble'
                } ${
                  d.position === 'top-right' || d.position === 'bottom-right'
                    ? 'self-end text-right'
                    : 'self-start text-left'
                }`}
              >
                <div className="font-bangers text-xs sm:text-sm text-red-600 uppercase tracking-wide">
                  {d.speakerName}
                </div>
                <p className="font-comic font-bold text-sm sm:text-base text-black">
                  "{d.text}"
                </p>
              </div>
            ))}
          </div>

          {/* Scene Direction Footer */}
          <div className="relative z-10 bg-black/80 backdrop-blur-xs p-2.5 rounded-xl border border-white/20 text-center">
            <p className="font-comic text-xs sm:text-sm text-yellow-300 font-bold">
              🎬 {panel.sceneDescription}
            </p>
          </div>
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={currentPanelIndex === story.panels.length - 1}
          className={`absolute right-0 sm:-right-12 z-30 p-2 sm:p-3 rounded-full border-2 border-black bg-yellow-400 text-black comic-shadow transition-transform hover:scale-110 active:scale-95 disabled:opacity-30 disabled:pointer-events-none`}
        >
          <ChevronRight className="w-6 h-6 stroke-[3]" />
        </button>
      </div>

      {/* Bottom Navigation Dots & Page Slider */}
      <div className="max-w-xl mx-auto w-full flex items-center justify-between border-t-2 border-white/20 pt-3">
        <span className="font-bangers text-base text-slate-300">
          Use Left / Right arrow keys to flip panels
        </span>

        <div className="flex items-center gap-1.5">
          {story.panels.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPanelIndex(idx)}
              className={`w-3.5 h-3.5 rounded-full border border-black transition-all ${
                currentPanelIndex === idx
                  ? 'bg-yellow-400 scale-125'
                  : 'bg-white/40 hover:bg-white/70'
              }`}
              title={`Jump to panel ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

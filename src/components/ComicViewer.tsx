import React, { useState } from 'react';
import {
  Volume2,
  Sparkles,
  Printer,
  Play,
  Plus,
  Grid,
  Rows,
  Users,
  Film,
  RotateCcw,
  Palette,
  Camera,
  Layers,
} from 'lucide-react';
import { ComicStory, ComicPanel } from '../types/comic';
import { ComicPanelCard } from './ComicPanelCard';
import { playComicLineAudio } from '../services/geminiService';

interface ComicViewerProps {
  story: ComicStory;
  onEditPanel: (panelNumber: number) => void;
  onGenerateArt: (panelNumber: number) => void;
  onGenerateAllArt: () => void;
  onAddPanel: () => void;
  onOpenReader: () => void;
  onOpenExport: () => void;
  onUpdateDialogueText: (panelNumber: number, dialogueId: string, newText: string) => void;
  onAddDialogue: (panelNumber: number) => void;
}

export const ComicViewer: React.FC<ComicViewerProps> = ({
  story,
  onEditPanel,
  onGenerateArt,
  onGenerateAllArt,
  onAddPanel,
  onOpenReader,
  onOpenExport,
  onUpdateDialogueText,
  onAddDialogue,
}) => {
  const [layoutMode, setLayoutMode] = useState<'grid' | 'strip'>('grid');
  const [isPlayingFullStory, setIsPlayingFullStory] = useState(false);

  // Play full story dialogues sequentially
  const handlePlayFullStory = async () => {
    if (isPlayingFullStory) return;
    setIsPlayingFullStory(true);
    try {
      // Announce title
      await playComicLineAudio(`${story.title}. An original AI comic story.`, 'Puck');
      await new Promise((r) => setTimeout(r, 600));

      for (const panel of story.panels) {
        if (panel.narration) {
          await playComicLineAudio(panel.narration, 'Puck');
          await new Promise((r) => setTimeout(r, 500));
        }
        for (const d of panel.dialogues) {
          await playComicLineAudio(
            `${d.speakerName}: ${d.text}`,
            d.bubbleType === 'shout' ? 'Fenrir' : 'Kore'
          );
          await new Promise((r) => setTimeout(r, 450));
        }
      }
    } finally {
      setIsPlayingFullStory(false);
    }
  };

  return (
    <div className="comic-book-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Comic Book Title Header Block */}
      <div className="relative bg-white border-4 border-black rounded-3xl comic-shadow-lg p-5 sm:p-8 mb-8 overflow-hidden">
        {/* Background Comic Texture */}
        <div className="absolute inset-0 bg-halftone-dots-amber opacity-30 pointer-events-none" />

        {/* Top Badges */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-red-600 text-yellow-300 font-bangers text-base sm:text-lg px-3 py-1 rounded-md border-2 border-black -rotate-2">
              {story.issueNumber || '#1 FIRST PRINT'}
            </span>
            <span className="bg-yellow-400 text-black font-bangers text-base sm:text-lg px-3 py-1 rounded-md border-2 border-black rotate-1">
              {story.genre}
            </span>
            <span className="bg-cyan-400 text-black font-bangers text-xs sm:text-sm px-2.5 py-1 rounded-md border-2 border-black">
              🎨 {story.visualStyle}
            </span>
          </div>

          {/* Action Toolbar (Hidden in print) */}
          <div className="flex items-center gap-2 no-print">
            {/* Layout switch */}
            <div className="bg-amber-100 border-2 border-black rounded-lg p-0.5 flex items-center">
              <button
                onClick={() => setLayoutMode('grid')}
                className={`p-1.5 rounded ${
                  layoutMode === 'grid' ? 'bg-yellow-400 text-black' : 'text-slate-600'
                }`}
                title="Grid Layout"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLayoutMode('strip')}
                className={`p-1.5 rounded ${
                  layoutMode === 'strip' ? 'bg-yellow-400 text-black' : 'text-slate-600'
                }`}
                title="Vertical Strip Layout"
              >
                <Rows className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handlePlayFullStory}
              disabled={isPlayingFullStory}
              className={`flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-black font-bangers text-sm sm:text-base px-3 py-1.5 rounded-lg border-2 border-black comic-shadow-sm transition-transform active:translate-y-0.5 ${
                isPlayingFullStory ? 'animate-pulse bg-red-400 text-white' : ''
              }`}
              title="Listen to full comic dialogue"
            >
              <Volume2 className="w-4 h-4" />
              <span className="hidden sm:inline">
                {isPlayingFullStory ? 'Narrating Comic...' : 'Listen to Comic'}
              </span>
            </button>

            <button
              onClick={onOpenReader}
              className="flex items-center gap-1 bg-cyan-400 hover:bg-cyan-300 text-black font-bangers text-sm sm:text-base px-3 py-1.5 rounded-lg border-2 border-black comic-shadow-sm"
              title="Fullscreen Slide Reader"
            >
              <Play className="w-4 h-4 fill-black" />
              <span className="hidden sm:inline">Reader</span>
            </button>

            <button
              onClick={onOpenExport}
              className="flex items-center gap-1 bg-emerald-400 hover:bg-emerald-300 text-black font-bangers text-sm sm:text-base px-3 py-1.5 rounded-lg border-2 border-black comic-shadow-sm"
              title="Print or Export PDF"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden md:inline">Print</span>
            </button>
          </div>
        </div>

        {/* Comic Title */}
        <h1 className="relative z-10 font-bangers text-4xl sm:text-6xl lg:text-7xl text-black tracking-wide leading-tight drop-shadow-[2px_2px_0_#fff]">
          {story.title}
        </h1>

        {/* Comic Logline & Narration Caption Box */}
        <div className="relative z-10 mt-3 p-3 sm:p-4 bg-yellow-200 border-3 border-black rounded-xl comic-shadow-sm max-w-4xl">
          <div className="font-comic font-black text-sm sm:text-base text-black flex items-start gap-2">
            <span className="bg-red-600 text-white font-bangers text-xs px-1.5 py-0.5 rounded border border-black uppercase shrink-0 mt-0.5">
              SYNOPSIS
            </span>
            <p className="italic">{story.synopsis || story.logline}</p>
          </div>
        </div>

        {/* Cast of Characters Showcase */}
        {story.characters && story.characters.length > 0 && (
          <div className="relative z-10 mt-6 pt-5 border-t-2 border-black/20">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-red-600" />
              <h3 className="font-bangers text-xl text-black">
                Featured Characters:
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {story.characters.map((char) => (
                <div
                  key={char.id}
                  className="bg-amber-50 border-2 border-black rounded-xl p-3 flex items-start gap-3 shadow-xs"
                >
                  <div
                    className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center font-bangers text-xl text-white shrink-0 comic-shadow-sm"
                    style={{ backgroundColor: char.colorHex || '#ea580c' }}
                  >
                    {char.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bangers text-lg text-black">{char.name}</span>
                      <span className="font-comic text-[10px] font-bold bg-white border border-black px-1.5 py-0.2 rounded">
                        {char.role}
                      </span>
                    </div>
                    <p className="font-comic text-xs font-bold text-slate-700 line-clamp-2 mt-0.5">
                      {char.appearance}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Panels Action Bar */}
      <div className="flex items-center justify-between gap-3 mb-6 no-print">
        <div className="flex items-center gap-2">
          <span className="font-bangers text-2xl text-black">
            Story Panels ({story.panels.length})
          </span>
          <span className="font-comic text-xs font-bold text-slate-600 hidden sm:inline">
            • Click text inside bubbles to edit inline!
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onGenerateAllArt}
            className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-black font-bangers text-sm sm:text-base px-3 py-1.5 rounded-xl border-2 border-black comic-shadow-sm transition-transform active:translate-y-0.5"
            title="Generate AI artwork for all panels"
          >
            <Sparkles className="w-4 h-4 text-red-600" />
            <span className="hidden sm:inline">Generate All Art</span>
            <span className="sm:hidden">All Art</span>
          </button>

          <button
            onClick={onAddPanel}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white font-bangers text-sm sm:text-base px-3 py-1.5 rounded-xl border-2 border-black comic-shadow-sm transition-transform active:translate-y-0.5"
            title="Add another scene to this comic"
          >
            <Plus className="w-4 h-4" />
            <span>Add Panel</span>
          </button>
        </div>
      </div>

      {/* Comic Panels Grid / Strip */}
      <div
        className={
          layoutMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 gap-6'
            : 'flex flex-col gap-8 max-w-3xl mx-auto'
        }
      >
        {story.panels.map((panel) => (
          <ComicPanelCard
            key={panel.panelNumber}
            panel={panel}
            visualStyle={story.visualStyle}
            characters={story.characters}
            onEditPanel={onEditPanel}
            onGenerateArt={onGenerateArt}
            onUpdateDialogueText={onUpdateDialogueText}
            onAddDialogue={onAddDialogue}
          />
        ))}
      </div>

      {/* Comic Bottom Closing Sign-Off */}
      <div className="mt-12 text-center p-6 bg-yellow-300 border-4 border-black rounded-3xl comic-shadow-lg max-w-2xl mx-auto">
        <h3 className="font-bangers text-3xl text-black mb-1">
          TO BE CONTINUED...
        </h3>
        <p className="font-comic font-bold text-sm text-black/80">
          Created with ComicCraft • Powered by Google Gemini AI
        </p>
      </div>
    </div>
  );
};

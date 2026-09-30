import React, { useState } from 'react';
import {
  Volume2,
  Sparkles,
  Edit3,
  MessageSquarePlus,
  Camera,
  Layers,
  Zap,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { ComicPanel, DialogueItem, ComicCharacter } from '../types/comic';
import { generateComicBackdropSvg } from '../utils/comicArtRenderer';
import { playComicLineAudio } from '../services/geminiService';

interface ComicPanelCardProps {
  panel: ComicPanel;
  visualStyle: string;
  characters: ComicCharacter[];
  onEditPanel: (panelNumber: number) => void;
  onGenerateArt: (panelNumber: number) => void;
  onUpdateDialogueText: (panelNumber: number, dialogueId: string, newText: string) => void;
  onAddDialogue: (panelNumber: number) => void;
}

export const ComicPanelCard: React.FC<ComicPanelCardProps> = ({
  panel,
  visualStyle,
  characters,
  onEditPanel,
  onGenerateArt,
  onUpdateDialogueText,
  onAddDialogue,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeEditingDialogueId, setActiveEditingDialogueId] = useState<string | null>(null);

  // Play narration and dialogues in sequence
  const handlePlayPanelAudio = async () => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    try {
      if (panel.narration) {
        await playComicLineAudio(panel.narration, 'Puck');
        await new Promise((r) => setTimeout(r, 600));
      }
      for (const d of panel.dialogues) {
        const textToRead = `${d.speakerName} says: ${d.text}`;
        await playComicLineAudio(textToRead, d.bubbleType === 'shout' ? 'Fenrir' : 'Kore');
        await new Promise((r) => setTimeout(r, 500));
      }
    } finally {
      setIsPlayingAudio(false);
    }
  };

  // Sound effect color classes
  const getSoundEffectClasses = (colorTheme?: string) => {
    switch (colorTheme) {
      case 'red':
        return 'bg-red-500 text-yellow-200 border-red-900';
      case 'cyan':
        return 'bg-cyan-400 text-black border-cyan-800';
      case 'purple':
        return 'bg-purple-600 text-white border-purple-950';
      case 'orange':
        return 'bg-orange-500 text-yellow-100 border-orange-900';
      case 'green':
        return 'bg-emerald-500 text-black border-emerald-900';
      case 'yellow':
      default:
        return 'bg-yellow-400 text-red-600 border-black';
    }
  };

  // Character color helper
  const getSpeakerColor = (speakerName: string) => {
    const char = characters.find(
      (c) => c.name.toLowerCase() === speakerName.toLowerCase()
    );
    return char?.colorHex || '#ea580c';
  };

  return (
    <div className="comic-panel group relative bg-white border-4 border-black rounded-2xl comic-shadow overflow-hidden flex flex-col transition-all hover:comic-shadow-lg">
      {/* Top Panel Info Bar */}
      <div className="bg-black text-white px-3 py-1.5 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <span className="font-bangers text-yellow-400 text-lg tracking-wider">
            PANEL #{panel.panelNumber}
          </span>
          {panel.title && (
            <span className="font-comic font-bold text-xs text-slate-200 hidden sm:inline truncate max-w-[150px]">
              {panel.title}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 bg-yellow-400 text-black text-[11px] font-bangers px-2 py-0.5 rounded border border-black">
            <Camera className="w-3 h-3" />
            <span>{panel.cameraAngle}</span>
          </span>

          <button
            onClick={handlePlayPanelAudio}
            disabled={isPlayingAudio}
            className={`p-1 rounded text-yellow-400 hover:text-yellow-200 transition-colors ${
              isPlayingAudio ? 'animate-bounce text-red-400' : ''
            }`}
            title="Listen to panel narration and dialogues"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Art & Dialogues Stage Area */}
      <div className="relative aspect-[4/3] w-full bg-slate-900 overflow-hidden flex flex-col justify-between p-3 select-none">
        {/* Background Visual Layer */}
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
                visualStyle,
                panel.panelNumber
              ),
            }}
          />
        )}

        {/* Comic Halftone Overlay Grain */}
        <div className="absolute inset-0 bg-halftone-dots opacity-20 pointer-events-none z-1" />

        {/* Scene Description Overlay Tag (bottom subtle backdrop preview) */}
        {!panel.imageUrl && (
          <div className="absolute bottom-2 left-2 right-2 bg-black/75 backdrop-blur-xs text-white p-2 rounded-lg border border-white/20 z-5 pointer-events-none">
            <p className="font-comic text-[11px] leading-tight text-slate-200 line-clamp-2">
              🎬 <strong className="text-yellow-300">Scene:</strong> {panel.sceneDescription}
            </p>
          </div>
        )}

        {/* Comic Narration Box (Classic Yellow Banner) */}
        {panel.narration && (
          <div className="relative z-10 self-start max-w-[85%] bg-yellow-300 text-black border-2 border-black rounded p-2 comic-shadow-sm rotate-[-0.5deg] mb-2">
            <div className="font-comic text-xs font-black tracking-tight leading-snug">
              {panel.narration}
            </div>
          </div>
        )}

        {/* Comic Sound Effect Sticker (Onomatopoeia) */}
        {panel.soundEffect && (
          <div
            className="absolute z-10 pointer-events-auto cursor-pointer"
            style={{
              top: '38%',
              left: '42%',
              transform: `translate(-50%, -50%) rotate(${panel.soundEffect.rotation || '-8deg'})`,
            }}
            title="Comic Sound Effect"
          >
            <div
              className={`font-bangers text-3xl sm:text-4xl px-3 py-1 border-3 rounded-lg shadow-[3px_3px_0_0_#000] tracking-wider select-none transform hover:scale-110 active:scale-95 transition-transform ${getSoundEffectClasses(
                panel.soundEffect.colorTheme
              )}`}
            >
              {panel.soundEffect.text}
            </div>
          </div>
        )}

        {/* Speech Bubbles Layer */}
        <div className="relative z-10 flex flex-col gap-2.5 my-auto pointer-events-auto">
          {panel.dialogues.map((dialogue) => {
            const isEditing = activeEditingDialogueId === dialogue.id;
            const speakerColor = getSpeakerColor(dialogue.speakerName);

            // Bubble Styling classes based on type
            let bubbleStyle = 'bg-white text-black border-3 border-black rounded-2xl speech-bubble speech-tail-bl';
            if (dialogue.bubbleType === 'shout') {
              bubbleStyle =
                'bg-yellow-100 text-black border-3 border-red-600 rounded-lg shadow-[2px_2px_0_0_#dc2626] font-extrabold uppercase';
            } else if (dialogue.bubbleType === 'thought') {
              bubbleStyle =
                'bg-white text-black border-3 border-dashed border-sky-600 rounded-3xl opacity-95';
            } else if (dialogue.bubbleType === 'whisper') {
              bubbleStyle =
                'bg-slate-50 text-slate-700 border-2 border-dashed border-black rounded-xl italic';
            }

            return (
              <div
                key={dialogue.id}
                className={`max-w-[85%] sm:max-w-[75%] p-2.5 comic-shadow-sm transition-all ${bubbleStyle} ${
                  dialogue.position === 'top-right' || dialogue.position === 'bottom-right'
                    ? 'self-end text-right'
                    : 'self-start text-left'
                }`}
              >
                {/* Speaker Tag */}
                <div
                  className="font-bangers text-xs tracking-wider uppercase mb-0.5 inline-block px-1.5 py-0.2 rounded border border-black/40 text-white"
                  style={{ backgroundColor: speakerColor }}
                >
                  {dialogue.speakerName}
                  {dialogue.bubbleType === 'thought' && ' (Thinking)'}
                  {dialogue.bubbleType === 'shout' && ' (Yelling!)'}
                </div>

                {/* Editable Bubble Text */}
                {isEditing ? (
                  <div className="flex items-center gap-1 mt-1">
                    <input
                      type="text"
                      autoFocus
                      defaultValue={dialogue.text}
                      onBlur={(e) => {
                        onUpdateDialogueText(panel.panelNumber, dialogue.id, e.target.value);
                        setActiveEditingDialogueId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          onUpdateDialogueText(
                            panel.panelNumber,
                            dialogue.id,
                            (e.target as HTMLInputElement).value
                          );
                          setActiveEditingDialogueId(null);
                        }
                      }}
                      className="w-full text-xs font-comic font-bold p-1 bg-yellow-50 border border-black rounded focus:outline-none"
                    />
                    <button
                      onClick={() => setActiveEditingDialogueId(null)}
                      className="p-1 bg-green-500 text-white rounded border border-black"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <p
                    onClick={() => setActiveEditingDialogueId(dialogue.id)}
                    className="font-comic font-bold text-xs sm:text-sm text-black leading-tight cursor-pointer hover:bg-yellow-100/60 rounded px-1 -mx-1 transition-colors"
                    title="Click to edit dialogue text"
                  >
                    "{dialogue.text}"
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Loading Indicator for AI Image Generation */}
        {panel.isGeneratingImage && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center text-white z-30">
            <Sparkles className="w-10 h-10 text-yellow-300 animate-spin mb-2" />
            <span className="font-bangers text-xl tracking-wider text-yellow-300">
              Generating Artwork with Gemini...
            </span>
            <span className="font-comic text-xs text-slate-300 mt-1">
              Painting "{visualStyle}" scene
            </span>
          </div>
        )}
      </div>

      {/* Bottom Panel Actions Bar */}
      <div className="bg-amber-100 border-t-3 border-black p-2 flex items-center justify-between text-xs font-bangers">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onGenerateArt(panel.panelNumber)}
            disabled={panel.isGeneratingImage}
            className="flex items-center gap-1 bg-yellow-400 hover:bg-yellow-300 text-black px-2.5 py-1 rounded border-2 border-black comic-shadow-sm transition-all"
            title="Generate custom visual illustration using Gemini Image AI"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>{panel.imageUrl ? 'Redo Art' : 'AI Artwork'}</span>
          </button>

          <button
            onClick={() => onAddDialogue(panel.panelNumber)}
            className="flex items-center gap-1 bg-white hover:bg-slate-100 text-black px-2 py-1 rounded border-2 border-black comic-shadow-sm transition-all"
            title="Add a new dialogue bubble"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span>Bubble</span>
          </button>
        </div>

        <button
          onClick={() => onEditPanel(panel.panelNumber)}
          className="flex items-center gap-1 bg-red-500 hover:bg-red-400 text-white px-2.5 py-1 rounded border-2 border-black comic-shadow-sm transition-all"
          title="Edit scene, dialogues, sound effect, and prompts"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Panel</span>
        </button>
      </div>
    </div>
  );
};

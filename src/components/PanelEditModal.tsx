import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  Camera,
  MessageSquare,
  Volume2,
  Save,
  Check,
} from 'lucide-react';
import { ComicPanel, DialogueItem, ComicCharacter, BubbleType, BubblePosition } from '../types/comic';
import { SOUND_EFFECT_PRESETS } from '../constants/presets';

interface PanelEditModalProps {
  panel: ComicPanel;
  characters: ComicCharacter[];
  onSave: (updatedPanel: ComicPanel) => void;
  onClose: () => void;
}

export const PanelEditModal: React.FC<PanelEditModalProps> = ({
  panel,
  characters,
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState(panel.title || `Panel ${panel.panelNumber}`);
  const [sceneDescription, setSceneDescription] = useState(panel.sceneDescription);
  const [cameraAngle, setCameraAngle] = useState(panel.cameraAngle);
  const [narration, setNarration] = useState(panel.narration || '');
  const [soundEffectText, setSoundEffectText] = useState(panel.soundEffect?.text || '');
  const [soundEffectColor, setSoundEffectColor] = useState<any>(
    panel.soundEffect?.colorTheme || 'yellow'
  );
  const [dialogues, setDialogues] = useState<DialogueItem[]>([...panel.dialogues]);
  const [visualPrompt, setVisualPrompt] = useState(panel.visualPrompt);

  const handleAddDialogue = () => {
    const defaultSpeaker = characters[0]?.name || 'Hero';
    const newDialogue: DialogueItem = {
      id: `d-new-${Date.now()}`,
      speakerName: defaultSpeaker,
      text: 'What happens next?!',
      bubbleType: 'speech',
      position: 'top-left',
    };
    setDialogues([...dialogues, newDialogue]);
  };

  const handleUpdateDialogue = (index: number, updates: Partial<DialogueItem>) => {
    const updated = [...dialogues];
    updated[index] = { ...updated[index], ...updates };
    setDialogues(updated);
  };

  const handleDeleteDialogue = (index: number) => {
    setDialogues(dialogues.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedPanel: ComicPanel = {
      ...panel,
      title: title.trim(),
      sceneDescription: sceneDescription.trim(),
      cameraAngle,
      narration: narration.trim(),
      soundEffect: soundEffectText.trim()
        ? {
            text: soundEffectText.trim(),
            colorTheme: soundEffectColor,
            rotation: panel.soundEffect?.rotation || '-8deg',
          }
        : null,
      dialogues,
      visualPrompt: visualPrompt.trim(),
    };
    onSave(updatedPanel);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border-4 border-black rounded-3xl comic-shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-yellow-400 border-b-4 border-black p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bangers text-3xl text-black">
              Edit Panel #{panel.panelNumber}
            </span>
            <span className="bg-red-600 text-white font-bangers text-xs px-2 py-0.5 rounded border border-black">
              Story Editor
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-white hover:bg-red-500 hover:text-white rounded-lg border-2 border-black transition-colors"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Panel Title & Camera Angle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bangers text-lg text-black block mb-1">
                Panel Title / Headline
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 bg-amber-50 border-2 border-black rounded-xl font-comic font-bold text-sm"
              />
            </div>

            <div>
              <label className="font-bangers text-lg text-black block mb-1">
                Camera Angle
              </label>
              <select
                value={cameraAngle}
                onChange={(e) => setCameraAngle(e.target.value)}
                className="w-full p-2.5 bg-amber-50 border-2 border-black rounded-xl font-comic font-bold text-sm"
              >
                <option value="Wide Cinematic Shot">Wide Cinematic Shot</option>
                <option value="Dynamic Low Angle">Dynamic Low Angle</option>
                <option value="Dramatic Close-Up">Dramatic Close-Up</option>
                <option value="Over-the-Shoulder">Over-the-Shoulder</option>
                <option value="High-Angle Bird's Eye">High-Angle Bird's Eye</option>
                <option value="Extreme Close-Up">Extreme Close-Up</option>
              </select>
            </div>
          </div>

          {/* Scene Description */}
          <div>
            <label className="font-bangers text-lg text-black block mb-1">
              Scene Action Description
            </label>
            <textarea
              rows={2}
              value={sceneDescription}
              onChange={(e) => setSceneDescription(e.target.value)}
              className="w-full p-2.5 bg-amber-50 border-2 border-black rounded-xl font-comic font-bold text-sm"
            />
          </div>

          {/* Narration Banner */}
          <div>
            <label className="font-bangers text-lg text-black flex items-center justify-between mb-1">
              <span>Narration Caption (Yellow Box)</span>
              <span className="font-comic text-xs font-normal text-slate-500">Optional</span>
            </label>
            <input
              type="text"
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              placeholder="e.g. Meanwhile, deep beneath the university..."
              className="w-full p-2.5 bg-yellow-100 border-2 border-black rounded-xl font-comic font-bold text-sm"
            />
          </div>

          {/* Dialogues Section */}
          <div className="border-3 border-black rounded-2xl p-4 bg-amber-50/60 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bangers text-xl text-black flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-red-600" />
                Dialogue Speech Bubbles ({dialogues.length})
              </label>
              <button
                type="button"
                onClick={handleAddDialogue}
                className="flex items-center gap-1 bg-yellow-400 hover:bg-yellow-300 text-black font-bangers text-sm px-2.5 py-1 rounded-lg border-2 border-black comic-shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Bubble</span>
              </button>
            </div>

            {dialogues.map((d, idx) => (
              <div
                key={d.id || idx}
                className="p-3 bg-white border-2 border-black rounded-xl space-y-2 shadow-xs"
              >
                <div className="flex items-center gap-2">
                  {/* Speaker selector */}
                  <div className="w-1/3">
                    <label className="text-[11px] font-comic font-bold text-slate-600 block">
                      Speaker
                    </label>
                    <select
                      value={d.speakerName}
                      onChange={(e) =>
                        handleUpdateDialogue(idx, { speakerName: e.target.value })
                      }
                      className="w-full p-1.5 border border-black rounded font-comic font-bold text-xs bg-amber-50"
                    >
                      {characters.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                      {!characters.some((c) => c.name === d.speakerName) && (
                        <option value={d.speakerName}>{d.speakerName}</option>
                      )}
                    </select>
                  </div>

                  {/* Bubble Type */}
                  <div className="w-1/3">
                    <label className="text-[11px] font-comic font-bold text-slate-600 block">
                      Bubble Type
                    </label>
                    <select
                      value={d.bubbleType}
                      onChange={(e) =>
                        handleUpdateDialogue(idx, {
                          bubbleType: e.target.value as BubbleType,
                        })
                      }
                      className="w-full p-1.5 border border-black rounded font-comic font-bold text-xs bg-amber-50"
                    >
                      <option value="speech">Normal Speech</option>
                      <option value="shout">Shout / Yell ⚡</option>
                      <option value="thought">Thought 💭</option>
                      <option value="whisper">Whisper 🤫</option>
                    </select>
                  </div>

                  {/* Bubble Position */}
                  <div className="w-1/3">
                    <label className="text-[11px] font-comic font-bold text-slate-600 block">
                      Position
                    </label>
                    <select
                      value={d.position}
                      onChange={(e) =>
                        handleUpdateDialogue(idx, {
                          position: e.target.value as BubblePosition,
                        })
                      }
                      className="w-full p-1.5 border border-black rounded font-comic font-bold text-xs bg-amber-50"
                    >
                      <option value="top-left">Top Left</option>
                      <option value="top-right">Top Right</option>
                      <option value="bottom-left">Bottom Left</option>
                      <option value="bottom-right">Bottom Right</option>
                      <option value="center-top">Center</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteDialogue(idx)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded mt-4"
                    title="Remove bubble"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <input
                    type="text"
                    value={d.text}
                    onChange={(e) => handleUpdateDialogue(idx, { text: e.target.value })}
                    placeholder="Dialogue spoken by this character..."
                    className="w-full p-2 bg-yellow-50/50 border border-black rounded font-comic font-bold text-xs"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Sound Effect (Onomatopoeia) */}
          <div className="border-2 border-black rounded-xl p-3 bg-white space-y-2">
            <label className="font-bangers text-lg text-black block">
              Sound Effect Sticker (POW! BAM! etc.)
            </label>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={soundEffectText}
                onChange={(e) => setSoundEffectText(e.target.value)}
                placeholder="e.g. POW!, BAM!, BZZZT! (leave empty for none)"
                className="flex-1 p-2 border-2 border-black rounded-lg font-bangers text-base"
              />

              <select
                value={soundEffectColor}
                onChange={(e) => setSoundEffectColor(e.target.value)}
                className="p-2 border-2 border-black rounded-lg font-comic font-bold text-xs bg-amber-50"
              >
                <option value="yellow">Yellow</option>
                <option value="red">Red</option>
                <option value="cyan">Cyan</option>
                <option value="orange">Orange</option>
                <option value="purple">Purple</option>
                <option value="green">Green</option>
              </select>
            </div>

            {/* Quick sound effect buttons */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {SOUND_EFFECT_PRESETS.map((fx) => (
                <button
                  key={fx.text}
                  type="button"
                  onClick={() => {
                    setSoundEffectText(fx.text);
                    setSoundEffectColor(fx.colorTheme);
                  }}
                  className="font-bangers text-xs px-2 py-0.5 rounded border border-black bg-amber-100 hover:bg-amber-300 transition-colors"
                >
                  {fx.text}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setSoundEffectText('')}
                className="text-xs font-comic text-slate-500 hover:underline px-2"
              >
                Clear
              </button>
            </div>
          </div>

          {/* AI Visual Prompt */}
          <div>
            <label className="font-bangers text-lg text-black block mb-1">
              Visual Artwork Generation Prompt
            </label>
            <textarea
              rows={2}
              value={visualPrompt}
              onChange={(e) => setVisualPrompt(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border-2 border-black rounded-xl font-comic text-xs font-bold"
            />
            <p className="text-[11px] font-comic text-slate-500 mt-0.5">
              Gemini uses this prompt when you click "AI Artwork" on this panel.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-black">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border-2 border-black rounded-xl font-bangers text-base hover:bg-slate-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-5 py-2 rounded-xl border-3 border-black comic-shadow font-bangers text-xl hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              <Save className="w-5 h-5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

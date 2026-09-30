import React, { useState } from 'react';
import {
  Wand2,
  Sparkles,
  Shuffle,
  Layers,
  Palette,
  Film,
  Smile,
  Users,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import {
  GENRE_PRESETS,
  VISUAL_STYLE_PRESETS,
  TONE_PRESETS,
  INSPIRATION_IDEAS,
} from '../constants/presets';
import { CreateComicParams } from '../types/comic';

interface ComicCreatorFormProps {
  initialPrompt?: string;
  isGenerating: boolean;
  onGenerate: (params: CreateComicParams) => Promise<void>;
  onCancel?: () => void;
}

export const ComicCreatorForm: React.FC<ComicCreatorFormProps> = ({
  initialPrompt = '',
  isGenerating,
  onGenerate,
  onCancel,
}) => {
  const [prompt, setPrompt] = useState(
    initialPrompt || 'Two college students discover a mysterious robot inside their classroom.'
  );
  const [genre, setGenre] = useState('Sci-Fi & Mystery');
  const [panelCount, setPanelCount] = useState(4);
  const [visualStyle, setVisualStyle] = useState('Classic Pop-Art Comic Book');
  const [tone, setTone] = useState('Fun & Exciting');
  const [characterNames, setCharacterNames] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const handleRandomize = () => {
    const randomIdea = INSPIRATION_IDEAS[Math.floor(Math.random() * INSPIRATION_IDEAS.length)];
    setPrompt(randomIdea);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    // Start animated loading steps
    setLoadingStep(1);
    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 1800);

    try {
      await onGenerate({
        prompt: prompt.trim(),
        genre,
        panelCount,
        visualStyle,
        tone,
        characterNames: characterNames.trim() || undefined,
      });
    } finally {
      clearInterval(stepInterval);
    }
  };

  return (
    <div className="bg-amber-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Form Card */}
        <div className="bg-white border-4 border-black rounded-3xl comic-shadow-lg overflow-hidden">
          {/* Header Banner */}
          <div className="bg-yellow-400 border-b-4 border-black p-5 sm:p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-red-600 text-white p-2 rounded-xl border-3 border-black comic-shadow-sm -rotate-3">
                <Wand2 className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="font-bangers text-3xl sm:text-4xl text-black tracking-wide">
                  Comic Story Studio
                </h2>
                <p className="font-comic font-bold text-xs sm:text-sm text-black/80">
                  Beginner-Friendly • Powered by Google Gemini AI
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRandomize}
              className="flex items-center gap-1.5 bg-white hover:bg-yellow-100 text-black font-bangers text-base px-3 py-1.5 rounded-lg border-2 border-black comic-shadow-sm transition-transform active:translate-y-0.5"
              title="Generate a random creative prompt"
            >
              <Shuffle className="w-4 h-4 text-red-600" />
              <span className="hidden sm:inline">Surprise Me!</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-7">
            {/* Step 1: Story Idea */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-bangers text-2xl text-black flex items-center gap-2">
                  <span className="bg-red-600 text-white text-base px-2 py-0.5 rounded-md border-2 border-black">
                    1
                  </span>
                  What is your comic idea?
                </label>
                <span className="font-comic text-xs font-bold text-slate-500 hidden sm:inline">
                  Write anything simple or wild!
                </span>
              </div>

              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  placeholder="e.g. Two college students discover a mysterious robot inside their classroom..."
                  disabled={isGenerating}
                  className="w-full text-base sm:text-lg font-comic font-bold p-4 bg-amber-50/50 border-3 border-black rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-yellow-400 transition-all placeholder:text-slate-400 text-black shadow-inner resize-y min-h-[90px]"
                />
              </div>

              {/* Quick Prompt Suggestions */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-xs font-bold text-slate-600 font-comic">Quick ideas:</span>
                <button
                  type="button"
                  onClick={() =>
                    setPrompt(
                      'Two college students discover a mysterious robot inside their classroom.'
                    )
                  }
                  className="text-xs font-comic font-bold bg-yellow-100 hover:bg-yellow-200 border border-black px-2 py-0.5 rounded-md transition-colors"
                >
                  🤖 Classroom Robot
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPrompt(
                      'A street stray cat secretly puts on a cape and defends the alley at night.'
                    )
                  }
                  className="text-xs font-comic font-bold bg-yellow-100 hover:bg-yellow-200 border border-black px-2 py-0.5 rounded-md transition-colors"
                >
                  🐱 Night Hero Cat
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPrompt(
                      'A young student finds an ancient magic compass in the university library.'
                    )
                  }
                  className="text-xs font-comic font-bold bg-yellow-100 hover:bg-yellow-200 border border-black px-2 py-0.5 rounded-md transition-colors"
                >
                  🧭 Library Secret
                </button>
              </div>
            </div>

            {/* Step 2: Choose Genre */}
            <div>
              <label className="font-bangers text-2xl text-black flex items-center gap-2 mb-3">
                <span className="bg-red-600 text-white text-base px-2 py-0.5 rounded-md border-2 border-black">
                  2
                </span>
                Pick Comic Genre
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {GENRE_PRESETS.map((g) => {
                  const isSelected = genre === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGenre(g.id)}
                      disabled={isGenerating}
                      className={`text-left p-3 rounded-xl border-3 border-black transition-all ${
                        isSelected
                          ? 'bg-yellow-300 comic-shadow translate-x-0.5 translate-y-0.5 font-bold'
                          : 'bg-white hover:bg-amber-50'
                      }`}
                    >
                      <div className="text-2xl mb-1">{g.icon}</div>
                      <div className="font-bangers text-lg text-black leading-tight">{g.name}</div>
                      <div className="font-comic text-xs text-slate-600 line-clamp-1 mt-0.5">
                        {g.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Choose Visual Art Style */}
            <div>
              <label className="font-bangers text-2xl text-black flex items-center gap-2 mb-3">
                <span className="bg-red-600 text-white text-base px-2 py-0.5 rounded-md border-2 border-black">
                  3
                </span>
                Visual Art Style
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {VISUAL_STYLE_PRESETS.map((style) => {
                  const isSelected = visualStyle === style.id;
                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setVisualStyle(style.id)}
                      disabled={isGenerating}
                      className={`text-left p-3.5 rounded-2xl border-3 border-black transition-all relative overflow-hidden ${
                        isSelected
                          ? 'bg-amber-200 comic-shadow scale-[1.02]'
                          : 'bg-white hover:bg-amber-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`text-xs font-bangers px-2 py-0.5 rounded-full border border-black ${style.accent} text-black`}
                        >
                          {style.badge}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-black fill-yellow-400" />
                        )}
                      </div>
                      <div className="font-bangers text-xl text-black leading-snug">
                        {style.name}
                      </div>
                      <div className="font-comic text-xs text-slate-700 font-bold mt-1">
                        {style.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Panels & Tone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              {/* Panel Count */}
              <div>
                <label className="font-bangers text-xl text-black flex items-center gap-2 mb-2">
                  <Layers className="w-5 h-5 text-red-600" />
                  Number of Comic Panels
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[2, 4, 6, 8].map((count) => {
                    const isSelected = panelCount === count;
                    return (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setPanelCount(count)}
                        disabled={isGenerating}
                        className={`py-3 rounded-xl border-3 border-black text-center transition-all ${
                          isSelected
                            ? 'bg-red-500 text-white comic-shadow font-bold'
                            : 'bg-white hover:bg-amber-50 text-black'
                        }`}
                      >
                        <div className="font-bangers text-2xl">{count}</div>
                        <div className="font-comic text-[10px] uppercase font-bold tracking-tight">
                          {count === 2
                            ? 'Quick Gag'
                            : count === 4
                            ? 'Standard'
                            : count === 6
                            ? 'Story Page'
                            : 'Double Page'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Story Tone */}
              <div>
                <label className="font-bangers text-xl text-black flex items-center gap-2 mb-2">
                  <Smile className="w-5 h-5 text-amber-600" />
                  Story Tone
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  disabled={isGenerating}
                  className="w-full py-3.5 px-4 bg-white border-3 border-black rounded-xl font-comic font-bold text-base focus:outline-none focus:ring-4 focus:ring-yellow-400"
                >
                  {TONE_PRESETS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Optional Character Names Accordion */}
            <div className="border-2 border-dashed border-black/40 rounded-xl p-3 bg-amber-50/40">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between font-bangers text-lg text-black text-left"
              >
                <span className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-slate-700" />
                  Custom Character Names (Optional)
                </span>
                <span className="text-sm font-comic underline font-bold">
                  {showAdvanced ? 'Hide' : 'Add custom names'}
                </span>
              </button>

              {showAdvanced && (
                <div className="mt-3 pt-3 border-t border-black/20">
                  <input
                    type="text"
                    value={characterNames}
                    onChange={(e) => setCharacterNames(e.target.value)}
                    placeholder="e.g. Maya (smart engineering student), Leo (anxious friend)"
                    className="w-full p-2.5 border-2 border-black rounded-lg font-comic text-sm font-bold bg-white"
                  />
                  <p className="text-xs font-comic text-slate-600 mt-1">
                    Leave blank to let Gemini AI invent the coolest characters for you!
                  </p>
                </div>
              )}
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isGenerating || !prompt.trim()}
                className={`w-full py-4 px-6 rounded-2xl border-4 border-black font-bangers text-2xl sm:text-3xl text-white tracking-wide transition-all flex items-center justify-center gap-3 ${
                  isGenerating || !prompt.trim()
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-500 comic-shadow-lg hover:translate-x-1 hover:translate-y-1 active:translate-x-2 active:translate-y-2'
                }`}
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-8 h-8 text-yellow-300 animate-spin" />
                    <span>GEMINI AI IS WRITING YOUR COMIC...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-8 h-8 text-yellow-300" />
                    <span>GENERATE COMIC WITH GEMINI AI</span>
                  </>
                )}
              </button>

              {/* Animated Progress Steps when generating */}
              {isGenerating && (
                <div className="mt-6 bg-yellow-100 border-3 border-black rounded-2xl p-4 comic-shadow animate-pulse">
                  <div className="flex items-center gap-3 mb-2">
                    <Sparkles className="w-6 h-6 text-red-600 animate-spin" />
                    <h4 className="font-bangers text-xl text-black">
                      Story Production in Progress...
                    </h4>
                  </div>
                  <div className="space-y-1.5 font-comic text-xs sm:text-sm font-bold text-slate-800">
                    <p className={loadingStep >= 1 ? 'text-black flex items-center gap-2' : 'text-slate-400'}>
                      {loadingStep >= 1 ? '✅' : '⏳'} Step 1: Crafting title, synopsis & characters with Gemini...
                    </p>
                    <p className={loadingStep >= 2 ? 'text-black flex items-center gap-2' : 'text-slate-400'}>
                      {loadingStep >= 2 ? '✅' : '⏳'} Step 2: Designing {panelCount} comic scenes & camera angles...
                    </p>
                    <p className={loadingStep >= 3 ? 'text-black flex items-center gap-2' : 'text-slate-400'}>
                      {loadingStep >= 3 ? '✅' : '⏳'} Step 3: Writing witty dialogue bubbles & sound effects...
                    </p>
                    <p className={loadingStep >= 4 ? 'text-black flex items-center gap-2' : 'text-slate-400'}>
                      {loadingStep >= 4 ? '✅' : '⏳'} Step 4: Assembling your complete comic book strip!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

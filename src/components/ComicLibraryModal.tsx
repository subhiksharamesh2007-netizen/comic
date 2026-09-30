import React from 'react';
import {
  X,
  BookOpen,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  ArrowRight,
  Copy,
} from 'lucide-react';
import { ComicStory } from '../types/comic';
import { SAMPLE_INITIAL_COMICS } from '../constants/presets';

interface ComicLibraryModalProps {
  stories: ComicStory[];
  activeStoryId: string | null;
  onSelectStory: (storyId: string) => void;
  onDeleteStory: (storyId: string) => void;
  onCloneStory: (story: ComicStory) => void;
  onLoadSamples: () => void;
  onNewComic: () => void;
  onClose: () => void;
}

export const ComicLibraryModal: React.FC<ComicLibraryModalProps> = ({
  stories,
  activeStoryId,
  onSelectStory,
  onDeleteStory,
  onCloneStory,
  onLoadSamples,
  onNewComic,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-amber-50 border-4 border-black rounded-3xl comic-shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-yellow-400 border-b-4 border-black p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 text-white p-2 rounded-xl border-3 border-black comic-shadow-sm -rotate-3">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bangers text-3xl sm:text-4xl text-black">
                Comic Library ({stories.length})
              </h2>
              <p className="font-comic font-bold text-xs text-black/80">
                Your saved comic adventures and story drafts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-white hover:bg-red-500 hover:text-white rounded-lg border-2 border-black transition-colors"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="bg-white border-b-2 border-black/20 p-3 sm:p-4 flex items-center justify-between">
          <button
            onClick={() => {
              onNewComic();
              onClose();
            }}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white font-bangers text-lg px-3.5 py-1.5 rounded-xl border-2 border-black comic-shadow-sm transition-transform active:translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Comic</span>
          </button>

          <button
            onClick={onLoadSamples}
            className="flex items-center gap-1.5 text-xs font-comic font-bold bg-amber-100 hover:bg-yellow-200 border-2 border-black px-3 py-1.5 rounded-lg transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>Restore Sample Comics</span>
          </button>
        </div>

        {/* Stories List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5">
          {stories.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border-3 border-dashed border-black/40 p-6">
              <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <h3 className="font-bangers text-2xl text-black">No comics yet!</h3>
              <p className="font-comic text-sm font-bold text-slate-600 mt-1 mb-4">
                Generate your very first comic story or load our pre-made starters.
              </p>
              <button
                onClick={onLoadSamples}
                className="bg-yellow-400 text-black font-bangers text-lg px-4 py-2 rounded-xl border-2 border-black comic-shadow-sm"
              >
                Load Starter Comics
              </button>
            </div>
          ) : (
            stories.map((story) => {
              const isActive = story.id === activeStoryId;
              const formattedDate = new Date(story.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={story.id}
                  className={`bg-white border-3 border-black rounded-2xl p-4 transition-all relative ${
                    isActive
                      ? 'comic-shadow bg-amber-50/80 border-red-600 ring-2 ring-red-400'
                      : 'hover:bg-amber-50/40'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bangers text-2xl text-black">
                          {story.title}
                        </span>
                        {isActive && (
                          <span className="bg-red-600 text-white font-bangers text-xs px-2 py-0.5 rounded border border-black">
                            Active
                          </span>
                        )}
                        <span className="bg-yellow-300 text-black font-bangers text-xs px-2 py-0.5 rounded border border-black">
                          {story.genre}
                        </span>
                        <span className="bg-slate-100 text-slate-800 font-comic font-bold text-[11px] px-2 py-0.5 rounded border border-black/30">
                          {story.panels.length} Panels
                        </span>
                      </div>

                      <p className="font-comic text-xs font-bold text-slate-700 line-clamp-1">
                        {story.logline || story.synopsis}
                      </p>

                      <div className="flex items-center gap-4 text-[11px] font-comic font-bold text-slate-500 pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formattedDate}
                        </span>
                        <span>• Style: {story.visualStyle}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => {
                          onSelectStory(story.id);
                          onClose();
                        }}
                        className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-black font-bangers text-base px-3 py-1.5 rounded-xl border-2 border-black comic-shadow-sm transition-transform active:translate-y-0.5"
                      >
                        <span>Open</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onCloneStory(story)}
                        className="p-1.5 bg-white hover:bg-amber-100 text-slate-700 rounded-lg border-2 border-black"
                        title="Duplicate comic"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDeleteStory(story.id)}
                        className="p-1.5 bg-white hover:bg-red-100 text-red-600 rounded-lg border-2 border-black"
                        title="Delete comic"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

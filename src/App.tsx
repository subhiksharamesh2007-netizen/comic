import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { ComicHero } from './components/ComicHero';
import { ComicCreatorForm } from './components/ComicCreatorForm';
import { ComicViewer } from './components/ComicViewer';
import { PanelEditModal } from './components/PanelEditModal';
import { ComicReaderModal } from './components/ComicReaderModal';
import { ComicLibraryModal } from './components/ComicLibraryModal';
import { ExportModal } from './components/ExportModal';
import { ComicStory, ComicPanel, CreateComicParams, DialogueItem } from './types/comic';
import {
  loadAllStoriesFromStorage,
  saveStoryToStorage,
  deleteStoryFromStorage,
  getActiveStoryId,
  setActiveStoryId,
  generateComicStoryWithGemini,
  generatePanelImage,
} from './services/geminiService';
import { SAMPLE_INITIAL_COMICS } from './constants/presets';

export default function App() {
  const [stories, setStories] = useState<ComicStory[]>([]);
  const [activeStoryId, setActiveStoryIdState] = useState<string | null>(null);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [creatorInitialPrompt, setCreatorInitialPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [editingPanelNumber, setEditingPanelNumber] = useState<number | null>(null);
  const [statusToast, setStatusToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Initialize from storage on mount
  useEffect(() => {
    const loaded = loadAllStoriesFromStorage();
    setStories(loaded);
    const savedActiveId = getActiveStoryId();
    if (savedActiveId && loaded.some((s) => s.id === savedActiveId)) {
      setActiveStoryIdState(savedActiveId);
    } else if (loaded.length > 0) {
      setActiveStoryIdState(loaded[0].id);
      setActiveStoryId(loaded[0].id);
    }
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setStatusToast({ message, type });
    setTimeout(() => setStatusToast(null), 4000);
  };

  const currentStory = stories.find((s) => s.id === activeStoryId) || stories[0] || null;

  // Handle generating a new comic story
  const handleGenerateStory = async (params: CreateComicParams) => {
    setIsGenerating(true);
    try {
      const newStory = await generateComicStoryWithGemini(params);
      setStories((prev) => [newStory, ...prev.filter((s) => s.id !== newStory.id)]);
      setActiveStoryIdState(newStory.id);
      setIsCreatorOpen(false);

      // Trigger celebratory comic confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#ef4444', '#06b6d4', '#10b981'],
        });
      } catch (e) {}

      showToast(`🎉 "${newStory.title}" created successfully!`, 'success');
    } catch (err: any) {
      console.error('Failed to generate story:', err);
      showToast(err.message || 'Failed to create comic story. Please try again.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate artwork for a single panel
  const handleGenerateArt = async (panelNumber: number) => {
    if (!currentStory) return;

    const panelIndex = currentStory.panels.findIndex((p) => p.panelNumber === panelNumber);
    if (panelIndex === -1) return;

    const panel = currentStory.panels[panelIndex];

    // Set panel loading flag
    const updatedPanels = [...currentStory.panels];
    updatedPanels[panelIndex] = { ...panel, isGeneratingImage: true };
    const storyWithLoading: ComicStory = { ...currentStory, panels: updatedPanels };
    updateAndSaveStory(storyWithLoading);

    try {
      const imageUrl = await generatePanelImage(panel.visualPrompt, currentStory.visualStyle);
      const panelsAfterGen = [...currentStory.panels];
      panelsAfterGen[panelIndex] = {
        ...panel,
        imageUrl: imageUrl || panel.imageUrl,
        isGeneratingImage: false,
      };
      const finalStory: ComicStory = { ...currentStory, panels: panelsAfterGen };
      updateAndSaveStory(finalStory);

      if (imageUrl) {
        showToast(`✨ Artwork for Panel #${panelNumber} generated!`, 'success');
      } else {
        showToast(`Rendered stylized comic backdrop for Panel #${panelNumber}.`, 'info');
      }
    } catch (e: any) {
      const panelsAfterError = [...currentStory.panels];
      panelsAfterError[panelIndex] = { ...panel, isGeneratingImage: false };
      updateAndSaveStory({ ...currentStory, panels: panelsAfterError });
      showToast('Notice: Using dynamic comic visual graphics.', 'info');
    }
  };

  // Generate artwork for all panels sequentially
  const handleGenerateAllArt = async () => {
    if (!currentStory) return;
    showToast('Starting AI art generation for all panels...', 'info');
    for (const panel of currentStory.panels) {
      await handleGenerateArt(panel.panelNumber);
      await new Promise((r) => setTimeout(r, 600));
    }
    showToast('🎉 All panel artwork generated!', 'success');
  };

  // Add a new panel to current comic
  const handleAddPanel = () => {
    if (!currentStory) return;
    const nextNumber = currentStory.panels.length + 1;
    const newPanel: ComicPanel = {
      panelNumber: nextNumber,
      title: `Episode Continuation ${nextNumber}`,
      sceneDescription: 'The characters react to the aftermath of the previous scene.',
      cameraAngle: 'Dynamic Medium Shot',
      narration: 'And the adventure escalates...',
      soundEffect: { text: 'WHAM!', colorTheme: 'yellow', rotation: '-8deg' },
      dialogues: [
        {
          id: `d-${nextNumber}-1`,
          speakerName: currentStory.characters[0]?.name || 'Protagonist',
          text: 'We are just getting started!',
          bubbleType: 'speech',
          position: 'top-left',
        },
      ],
      visualPrompt: `Comic panel of characters reacting to an exciting discovery, in ${currentStory.visualStyle} style.`,
      imageUrl: null,
      isGeneratingImage: false,
    };

    const updatedStory: ComicStory = {
      ...currentStory,
      panels: [...currentStory.panels, newPanel],
    };
    updateAndSaveStory(updatedStory);
    showToast(`Added Panel #${nextNumber}!`, 'success');
  };

  // Quick inline update of dialogue text
  const handleUpdateDialogueText = (panelNumber: number, dialogueId: string, newText: string) => {
    if (!currentStory) return;
    const updatedPanels = currentStory.panels.map((p) => {
      if (p.panelNumber !== panelNumber) return p;
      return {
        ...p,
        dialogues: p.dialogues.map((d) => (d.id === dialogueId ? { ...d, text: newText } : d)),
      };
    });
    updateAndSaveStory({ ...currentStory, panels: updatedPanels });
  };

  // Add a new dialogue bubble directly from panel card
  const handleAddDialogue = (panelNumber: number) => {
    if (!currentStory) return;
    const defaultSpeaker = currentStory.characters[0]?.name || 'Character';
    const updatedPanels = currentStory.panels.map((p) => {
      if (p.panelNumber !== panelNumber) return p;
      const newD: DialogueItem = {
        id: `d-${panelNumber}-${Date.now()}`,
        speakerName: defaultSpeaker,
        text: 'Wait, look at that!',
        bubbleType: 'speech',
        position: 'top-right',
      };
      return { ...p, dialogues: [...p.dialogues, newD] };
    });
    updateAndSaveStory({ ...currentStory, panels: updatedPanels });
  };

  // Save changes from PanelEditModal
  const handleSaveEditedPanel = (updatedPanel: ComicPanel) => {
    if (!currentStory) return;
    const updatedPanels = currentStory.panels.map((p) =>
      p.panelNumber === updatedPanel.panelNumber ? updatedPanel : p
    );
    updateAndSaveStory({ ...currentStory, panels: updatedPanels });
    setEditingPanelNumber(null);
    showToast(`Panel #${updatedPanel.panelNumber} updated!`, 'success');
  };

  // Helper to persist updated story
  const updateAndSaveStory = (updatedStory: ComicStory) => {
    saveStoryToStorage(updatedStory);
    setStories((prev) => prev.map((s) => (s.id === updatedStory.id ? updatedStory : s)));
  };

  // Select active story from library
  const handleSelectStory = (storyId: string) => {
    setActiveStoryIdState(storyId);
    setActiveStoryId(storyId);
    setIsCreatorOpen(false);
  };

  // Duplicate a story
  const handleCloneStory = (story: ComicStory) => {
    const cloned: ComicStory = {
      ...story,
      id: `comic-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: `${story.title} (Copy)`,
      createdAt: new Date().toISOString(),
    };
    saveStoryToStorage(cloned);
    setStories((prev) => [cloned, ...prev]);
    setActiveStoryIdState(cloned.id);
    setActiveStoryId(cloned.id);
    showToast(`Duplicated "${story.title}"!`, 'success');
  };

  // Delete story
  const handleDeleteStory = (storyId: string) => {
    const remaining = deleteStoryFromStorage(storyId);
    setStories(remaining);
    if (activeStoryId === storyId) {
      const nextId = remaining[0]?.id || null;
      setActiveStoryIdState(nextId);
      if (nextId) setActiveStoryId(nextId);
    }
    showToast('Comic deleted.', 'info');
  };

  // Restore sample comics
  const handleLoadSamples = () => {
    SAMPLE_INITIAL_COMICS.forEach((s) => saveStoryToStorage(s));
    const all = loadAllStoriesFromStorage();
    setStories(all);
    setActiveStoryIdState(SAMPLE_INITIAL_COMICS[0].id);
    setActiveStoryId(SAMPLE_INITIAL_COMICS[0].id);
    showToast('Starter sample comics loaded!', 'success');
  };

  // Prompt inspiration click from Hero
  const handleSelectInspiration = (idea: string) => {
    setCreatorInitialPrompt(idea);
    setIsCreatorOpen(true);
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  const editingPanel =
    editingPanelNumber !== null
      ? currentStory?.panels.find((p) => p.panelNumber === editingPanelNumber)
      : null;

  return (
    <div className="min-h-screen bg-amber-50 text-slate-900 flex flex-col">
      {/* Global Header */}
      <Header
        currentStory={currentStory}
        savedStoriesCount={stories.length}
        onOpenCreator={() => {
          setCreatorInitialPrompt('');
          setIsCreatorOpen(true);
        }}
        onOpenLibrary={() => setIsLibraryOpen(true)}
        onOpenReader={() => setIsReaderOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
      />

      {/* Status Toast */}
      {statusToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5">
          <div
            className={`px-4 py-3 rounded-2xl border-3 border-black comic-shadow font-comic font-black text-sm flex items-center gap-2 ${
              statusToast.type === 'error'
                ? 'bg-red-500 text-white'
                : statusToast.type === 'success'
                ? 'bg-yellow-300 text-black'
                : 'bg-cyan-400 text-black'
            }`}
          >
            <span>{statusToast.message}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Comic Hero Section */}
        <ComicHero
          onStartCreating={() => {
            setCreatorInitialPrompt('');
            setIsCreatorOpen(true);
            window.scrollTo({ top: 350, behavior: 'smooth' });
          }}
          onSelectInspiration={handleSelectInspiration}
        />

        {/* Comic Creator Form (toggleable or top view) */}
        {isCreatorOpen && (
          <div id="creator-section">
            <ComicCreatorForm
              initialPrompt={creatorInitialPrompt}
              isGenerating={isGenerating}
              onGenerate={handleGenerateStory}
              onCancel={() => setIsCreatorOpen(false)}
            />
          </div>
        )}

        {/* Current Active Comic Showcase */}
        {currentStory ? (
          <ComicViewer
            story={currentStory}
            onEditPanel={(num) => setEditingPanelNumber(num)}
            onGenerateArt={handleGenerateArt}
            onGenerateAllArt={handleGenerateAllArt}
            onAddPanel={handleAddPanel}
            onOpenReader={() => setIsReaderOpen(true)}
            onOpenExport={() => setIsExportOpen(true)}
            onUpdateDialogueText={handleUpdateDialogueText}
            onAddDialogue={handleAddDialogue}
          />
        ) : (
          <div className="text-center py-16 px-4">
            <h3 className="font-bangers text-3xl text-black">Ready to craft your comic?</h3>
            <p className="font-comic font-bold text-slate-600 mt-2 mb-6">
              Click "New Comic" to turn your idea into a full visual story with Gemini.
            </p>
            <button
              onClick={() => setIsCreatorOpen(true)}
              className="bg-red-600 text-white font-bangers text-2xl px-6 py-3 rounded-2xl border-3 border-black comic-shadow"
            >
              Start Creating
            </button>
          </div>
        )}
      </main>

      {/* Modals */}
      {editingPanel && currentStory && (
        <PanelEditModal
          panel={editingPanel}
          characters={currentStory.characters}
          onSave={handleSaveEditedPanel}
          onClose={() => setEditingPanelNumber(null)}
        />
      )}

      {isReaderOpen && currentStory && (
        <ComicReaderModal
          story={currentStory}
          onClose={() => setIsReaderOpen(false)}
        />
      )}

      {isLibraryOpen && (
        <ComicLibraryModal
          stories={stories}
          activeStoryId={activeStoryId}
          onSelectStory={handleSelectStory}
          onDeleteStory={handleDeleteStory}
          onCloneStory={handleCloneStory}
          onLoadSamples={handleLoadSamples}
          onNewComic={() => {
            setCreatorInitialPrompt('');
            setIsCreatorOpen(true);
          }}
          onClose={() => setIsLibraryOpen(false)}
        />
      )}

      {isExportOpen && currentStory && (
        <ExportModal
          story={currentStory}
          onClose={() => setIsExportOpen(false)}
        />
      )}
    </div>
  );
}

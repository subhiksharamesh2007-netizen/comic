import { ComicStory, CreateComicParams } from '../types/comic';
import { SAMPLE_INITIAL_COMICS } from '../constants/presets';

const STORAGE_KEY = 'comiccraft_user_stories_v1';
const CURRENT_ACTIVE_KEY = 'comiccraft_active_story_id';

export async function generateComicStoryWithGemini(params: CreateComicParams): Promise<ComicStory> {
  const response = await fetch('/api/comic/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to generate comic story with Gemini');
  }

  const generated = data.comic;
  const newStory: ComicStory = {
    id: `comic-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: generated.title || 'Untitled Comic Adventure',
    issueNumber: generated.issueNumber || '#1 First Print',
    logline: generated.logline || params.prompt,
    synopsis: generated.synopsis || '',
    genre: generated.genre || params.genre,
    visualStyle: generated.visualStyle || params.visualStyle,
    tone: params.tone,
    createdAt: new Date().toISOString(),
    characters: generated.characters || [],
    panels: (generated.panels || []).map((p: any, idx: number) => ({
      panelNumber: p.panelNumber || idx + 1,
      title: p.title || `Panel ${idx + 1}`,
      sceneDescription: p.sceneDescription || '',
      cameraAngle: p.cameraAngle || 'Medium Shot',
      narration: p.narration || '',
      soundEffect: p.soundEffect || null,
      dialogues: (p.dialogues || []).map((d: any, dIdx: number) => ({
        id: `d-${idx}-${dIdx}-${Math.random().toString(36).slice(2, 5)}`,
        speakerName: d.speakerName || 'Character',
        text: d.text || '',
        bubbleType: d.bubbleType || 'speech',
        position: d.position || (dIdx === 0 ? 'top-left' : 'top-right'),
      })),
      visualPrompt: p.visualPrompt || '',
      imageUrl: null,
      isGeneratingImage: false,
    })),
  };

  saveStoryToStorage(newStory);
  setActiveStoryId(newStory.id);
  return newStory;
}

export async function generatePanelImage(prompt: string, style: string): Promise<string | null> {
  try {
    const res = await fetch('/api/comic/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, style, aspectRatio: '4:3' }),
    });
    const data = await res.json();
    if (data.success && data.imageUrl) {
      return data.imageUrl;
    }
    return null;
  } catch (err) {
    console.warn('Image generation endpoint notice:', err);
    return null;
  }
}

export async function playComicLineAudio(text: string, voice = 'Puck'): Promise<boolean> {
  try {
    const res = await fetch('/api/comic/speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice }),
    });
    const data = await res.json();
    if (data.success && data.audioUrl) {
      const audio = new Audio(data.audioUrl);
      await audio.play();
      return true;
    }
  } catch (e) {
    // Graceful fallback to browser speech synthesis
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
    return true;
  }

  return false;
}

// LocalStorage helpers
export function loadAllStoriesFromStorage(): ComicStory[] {
  if (typeof window === 'undefined') return SAMPLE_INITIAL_COMICS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed initial samples
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_INITIAL_COMICS));
      return SAMPLE_INITIAL_COMICS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SAMPLE_INITIAL_COMICS;
  } catch {
    return SAMPLE_INITIAL_COMICS;
  }
}

export function saveStoryToStorage(story: ComicStory): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = loadAllStoriesFromStorage();
    const index = existing.findIndex((s) => s.id === story.id);
    let updated: ComicStory[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = story;
    } else {
      updated = [story, ...existing];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export function deleteStoryFromStorage(storyId: string): ComicStory[] {
  if (typeof window === 'undefined') return [];
  const existing = loadAllStoriesFromStorage();
  const updated = existing.filter((s) => s.id !== storyId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function getActiveStoryId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CURRENT_ACTIVE_KEY);
}

export function setActiveStoryId(id: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CURRENT_ACTIVE_KEY, id);
}

export type BubbleType = 'speech' | 'shout' | 'thought' | 'whisper';
export type BubblePosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center-top';

export interface DialogueItem {
  id: string;
  speakerName: string;
  text: string;
  bubbleType: BubbleType;
  position: BubblePosition;
}

export interface SoundEffectItem {
  text: string;
  rotation?: string;
  colorTheme?: 'yellow' | 'red' | 'cyan' | 'purple' | 'orange' | 'green';
  position?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export interface ComicCharacter {
  id: string;
  name: string;
  role: string;
  appearance: string;
  colorHex?: string;
}

export interface ComicPanel {
  panelNumber: number;
  title?: string;
  sceneDescription: string;
  cameraAngle: string;
  narration?: string;
  soundEffect?: SoundEffectItem | null;
  dialogues: DialogueItem[];
  visualPrompt: string;
  imageUrl?: string | null;
  isGeneratingImage?: boolean;
}

export interface ComicStory {
  id: string;
  title: string;
  issueNumber?: string;
  logline: string;
  synopsis: string;
  genre: string;
  visualStyle: string;
  tone?: string;
  createdAt: string;
  characters: ComicCharacter[];
  panels: ComicPanel[];
}

export interface CreateComicParams {
  prompt: string;
  genre: string;
  panelCount: number;
  visualStyle: string;
  tone: string;
  characterNames?: string;
}

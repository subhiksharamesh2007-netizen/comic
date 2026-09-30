import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '20mb' }));

// Server-side Gemini initialization with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// 1. Generate full comic story structure
app.post('/api/comic/generate', async (req: Request, res: Response) => {
  try {
    const {
      prompt,
      genre = 'Superhero & Action',
      panelCount = 4,
      visualStyle = 'Classic Pop-Art Comic Book',
      tone = 'Fun & Exciting',
      characterNames = '',
    } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    const safePanelCount = Math.min(Math.max(Number(panelCount) || 4, 2), 8);

    const systemPrompt = `You are a legendary comic book writer, storyboard artist, and editor for famous comic publishers.
Your mission is to transform a beginner's creative story idea into an engaging, dynamic, panel-by-panel comic book script.
Every comic must have:
1. A punchy comic title with an exciting exclamation or tagline.
2. A brief synopsis (2-3 sentences).
3. 1 to 4 distinct characters with distinctive visual appearances, color schemes, and personality tags.
4. Exactly ${safePanelCount} panels that deliver a complete mini narrative arc (Introduction/Inciting Incident -> Rising Action -> Climax/Twist -> Satisfying Punchline/Ending).
5. For each panel:
   - "panelNumber": 1, 2, ...
   - "title": short scene headline (e.g. "A Strange Discovery", "The Awakening")
   - "sceneDescription": Clear visual stage directions for what is happening.
   - "cameraAngle": dynamic comic angle ("Extreme Close-Up", "Dynamic Low-Angle", "Wide Hero Shot", "Over-The-Shoulder", "Bird's Eye Dramatic").
   - "narration": optional narrator caption box text (yellow comic caption), or empty string if not needed.
   - "soundEffect": optional comic onomatopoeia (e.g. "POW!", "WHAM!", "BZZZT!", "KRA-KABOOM!", "WHOOSH!", "CLICK!", "GASP!"), or null.
   - "dialogues": array of speech bubbles with speakerName, text (keep snappy, comic-book dialogue style), bubbleType ("speech", "shout", "thought", "whisper"), position ("top-left", "top-right", "bottom-left", "bottom-right").
   - "visualPrompt": A rich, highly detailed image generation prompt tailored for "${visualStyle}". Describe composition, lighting, character poses, expressions, dramatic inked outlines, comic book screentones, and color palette. Do NOT mention speech bubbles in the image prompt because bubbles are rendered on top!

Style requested: ${visualStyle}
Genre: ${genre}
Tone: ${tone}
${characterNames ? `Suggested characters: ${characterNames}` : ''}`;

    const userPrompt = `Create a ${safePanelCount}-panel comic based on this idea:
"${prompt.trim()}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Catchy comic book title' },
            issueNumber: { type: Type.STRING, description: 'E.g. "#1 Collector Edition"' },
            logline: { type: Type.STRING, description: 'One-sentence exciting summary' },
            synopsis: { type: Type.STRING, description: '2-3 sentence story overview' },
            genre: { type: Type.STRING },
            visualStyle: { type: Type.STRING },
            characters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  role: { type: Type.STRING, description: 'E.g. Protagonist, Sidekick, Mysterious Rival' },
                  appearance: { type: Type.STRING, description: 'Visual appearance description' },
                  colorHex: { type: Type.STRING, description: 'Dominant theme color for this character' },
                },
                required: ['id', 'name', 'role', 'appearance'],
              },
            },
            panels: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  panelNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  sceneDescription: { type: Type.STRING },
                  cameraAngle: { type: Type.STRING },
                  narration: { type: Type.STRING },
                  soundEffect: {
                    type: Type.OBJECT,
                    properties: {
                      text: { type: Type.STRING },
                      rotation: { type: Type.STRING, description: 'E.g. "-12deg", "15deg"' },
                      colorTheme: { type: Type.STRING, description: 'yellow, red, cyan, or purple' },
                    },
                    required: ['text'],
                  },
                  dialogues: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        speakerName: { type: Type.STRING },
                        text: { type: Type.STRING },
                        bubbleType: {
                          type: Type.STRING,
                          description: 'speech, shout, thought, or whisper',
                        },
                        position: {
                          type: Type.STRING,
                          description: 'top-left, top-right, bottom-left, or bottom-right',
                        },
                      },
                      required: ['speakerName', 'text', 'bubbleType'],
                    },
                  },
                  visualPrompt: {
                    type: Type.STRING,
                    description: 'Detailed prompt for visual rendering of this panel',
                  },
                },
                required: ['panelNumber', 'sceneDescription', 'cameraAngle', 'visualPrompt', 'dialogues'],
              },
            },
          },
          required: ['title', 'logline', 'synopsis', 'characters', 'panels'],
        },
      },
    });

    const text = response.text || '{}';
    const parsedData = JSON.parse(text);
    res.json({ success: true, comic: parsedData });
  } catch (error: any) {
    console.error('Error generating comic:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate comic story',
    });
  }
});

// 2. Generate panel artwork using Gemini Image capability
app.post('/api/comic/generate-image', async (req: Request, res: Response) => {
  try {
    const { prompt, style = 'Classic Comic Book', aspectRatio = '4:3' } = req.body;

    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required for image generation' });
      return;
    }

    const enhancedPrompt = `${prompt}. Comic book art style: ${style}. Vibrant colors, crisp bold inking, dramatic comic illustration, cinematic lighting, sharp details, comic graphic novel artwork, masterpiece, no speech bubbles, no text watermarks.`;

    try {
      // First attempt with gemini-3.1-flash-lite-image
      const imageResponse = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [{ text: enhancedPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: (['1:1', '3:4', '4:3', '16:9'].includes(aspectRatio) ? aspectRatio : '4:3') as any,
          },
        },
      });

      const parts = imageResponse.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          const mimeType = part.inlineData.mimeType || 'image/png';
          const imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
          res.json({ success: true, imageUrl });
          return;
        }
      }
    } catch (modelErr: any) {
      console.warn('Gemini image generation call notice:', modelErr.message);
      // Fallback: return flag indicating SVG/Artistic stylized graphic can be rendered,
      // or return custom stylized SVG comic scene placeholder with full prompt data
      res.json({
        success: false,
        fallbackPrompt: enhancedPrompt,
        message: modelErr.message || 'Image generation model paused or key limit reached',
      });
      return;
    }

    res.json({ success: false, message: 'No image data returned from model' });
  } catch (error: any) {
    console.error('Image generation route error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate image' });
  }
});

// 3. Generate Audio / TTS for comic narration or dialogue lines
app.post('/api/comic/speech', async (req: Request, res: Response) => {
  try {
    const { text, voice = 'Puck', style = 'Enthusiastic comic narrator' } = req.body;
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text is required for TTS' });
      return;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.slice(0, 300),
              speechMetadata: {
                style: style,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice as any },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      res.json({ success: true, audioUrl: `data:audio/wav;base64,${base64Audio}` });
    } else {
      res.status(500).json({ error: 'No audio data returned' });
    }
  } catch (err: any) {
    console.warn('TTS error (can use browser SpeechSynthesis as client fallback):', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 4. Quick Idea Inspiration helper
app.get('/api/comic/inspirations', (_req: Request, res: Response) => {
  const ideas = [
    {
      title: 'Classroom Robot Mystery',
      genre: 'Sci-Fi & Mystery',
      idea: 'Two college students discover a mysterious robot inside their classroom that suddenly activates with a warning about tomorrow’s exam.',
      style: 'Modern Manga / Anime',
    },
    {
      title: 'Midnight Whisker Patrol',
      genre: 'Superhero & Action',
      idea: 'A lazy apartment cat sneaks out every night wearing a tiny leather cape to fight neighborhood rodent gangs.',
      style: 'Classic Pop-Art Comic Book',
    },
    {
      title: 'The Time-Travel Curry',
      genre: 'Comedy & Fantasy',
      idea: 'A struggling culinary chef accidentally buys a spice at a flea market that sends anyone who tastes it back 20 minutes in time.',
      style: 'Webtoon Vibrant',
    },
    {
      title: 'Planet Sugar Rush',
      genre: 'Sci-Fi Adventure',
      idea: 'An astronaut emergency-lands on an alien planet entirely made of donuts, caramel oceans, and marshmallow monsters.',
      style: 'Retro Vintage Pulp Comic (1960s)',
    },
    {
      title: 'The Ghost in the Vending Machine',
      genre: 'Supernatural & Comedy',
      idea: 'A haunted campus vending machine starts giving eerie psychic advice printed on beverage cans.',
      style: 'Dark Noir Graphic Novel',
    },
  ];
  res.json({ ideas });
});

// Vite middleware in dev, static files in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`ComicCraft server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});

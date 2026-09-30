import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  Copy,
  Check,
  FileText,
  Share2,
  Sparkles,
} from 'lucide-react';
import { ComicStory } from '../types/comic';

interface ExportModalProps {
  story: ComicStory;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ story, onClose }) => {
  const [copiedScript, setCopiedScript] = useState(false);

  // Format full comic script text
  const generateScriptText = (): string => {
    let script = `====================================================\n`;
    script += `TITLE: ${story.title.toUpperCase()}\n`;
    script += `ISSUE: ${story.issueNumber || '#1'}\n`;
    script += `GENRE: ${story.genre} | STYLE: ${story.visualStyle}\n`;
    script += `LOGLINE: ${story.logline}\n`;
    script += `====================================================\n\n`;

    script += `CAST OF CHARACTERS:\n`;
    story.characters.forEach((c) => {
      script += `• ${c.name} (${c.role}): ${c.appearance}\n`;
    });
    script += `\n----------------------------------------------------\n\n`;

    story.panels.forEach((p) => {
      script += `[PANEL ${p.panelNumber}: ${p.title || 'SCENE'}]\n`;
      script += `CAMERA: ${p.cameraAngle}\n`;
      script += `SCENE: ${p.sceneDescription}\n`;
      if (p.narration) {
        script += `CAPTION: [${p.narration}]\n`;
      }
      if (p.soundEffect) {
        script += `SOUND FX: *** ${p.soundEffect.text} ***\n`;
      }
      p.dialogues.forEach((d) => {
        const typeNote = d.bubbleType !== 'speech' ? ` (${d.bubbleType.toUpperCase()})` : '';
        script += `${d.speakerName.toUpperCase()}${typeNote}: "${d.text}"\n`;
      });
      script += `\n`;
    });

    return script;
  };

  const handleCopyScript = () => {
    const text = generateScriptText();
    navigator.clipboard.writeText(text);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(story, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${story.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_comiccraft.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border-4 border-black rounded-3xl comic-shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-amber-400 border-b-4 border-black p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bangers text-3xl text-black">
              Export & Share Comic
            </span>
            <span className="bg-red-600 text-white font-bangers text-xs px-2 py-0.5 rounded border border-black">
              Print / Save
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-white hover:bg-red-500 hover:text-white rounded-lg border-2 border-black transition-colors"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Body Options */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {/* Print Option */}
          <div className="p-4 bg-yellow-50 border-3 border-black rounded-2xl comic-shadow-sm flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Printer className="w-5 h-5 text-red-600" />
                <h4 className="font-bangers text-xl text-black">
                  Print Physical Comic Page
                </h4>
              </div>
              <p className="font-comic text-xs font-bold text-slate-700">
                Sends your comic strip directly to your printer or saves as a formatted PDF page!
              </p>
            </div>
            <button
              onClick={handlePrint}
              className="bg-red-600 hover:bg-red-500 text-white font-bangers text-lg px-4 py-2 rounded-xl border-2 border-black comic-shadow-sm transition-transform active:translate-y-0.5 shrink-0"
            >
              Print Now
            </button>
          </div>

          {/* Copy Script Option */}
          <div className="p-4 bg-amber-50 border-3 border-black rounded-2xl comic-shadow-sm flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-5 h-5 text-blue-600" />
                <h4 className="font-bangers text-xl text-black">
                  Copy Comic Script
                </h4>
              </div>
              <p className="font-comic text-xs font-bold text-slate-700">
                Formatted screenplay with scene directions, dialogues, and onomatopoeia.
              </p>
            </div>
            <button
              onClick={handleCopyScript}
              className="bg-yellow-400 hover:bg-yellow-300 text-black font-bangers text-lg px-4 py-2 rounded-xl border-2 border-black comic-shadow-sm transition-transform active:translate-y-0.5 shrink-0 flex items-center gap-1.5"
            >
              {copiedScript ? <Check className="w-4 h-4 text-green-700" /> : <Copy className="w-4 h-4" />}
              <span>{copiedScript ? 'Copied!' : 'Copy Script'}</span>
            </button>
          </div>

          {/* Download JSON Project File */}
          <div className="p-4 bg-cyan-50 border-3 border-black rounded-2xl comic-shadow-sm flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Download className="w-5 h-5 text-cyan-700" />
                <h4 className="font-bangers text-xl text-black">
                  Download Project File (.JSON)
                </h4>
              </div>
              <p className="font-comic text-xs font-bold text-slate-700">
                Save a backup of your full comic structure, prompts, and dialogues.
              </p>
            </div>
            <button
              onClick={handleDownloadJSON}
              className="bg-cyan-400 hover:bg-cyan-300 text-black font-bangers text-lg px-4 py-2 rounded-xl border-2 border-black comic-shadow-sm transition-transform active:translate-y-0.5 shrink-0"
            >
              Download JSON
            </button>
          </div>

          {/* Script Preview Box */}
          <div>
            <label className="font-bangers text-base text-slate-800 block mb-1">
              Script Preview:
            </label>
            <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] max-h-36 overflow-y-auto border-2 border-black">
              {generateScriptText()}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

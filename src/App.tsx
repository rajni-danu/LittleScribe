import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Download, 
  Settings2, 
  Type, 
  Eraser, 
  CircleDashed,
  Monitor,
  Smartphone,
  CheckCircle2,
  Trash2,
  MoveHorizontal,
  Maximize2,
  X,
  Play,
  Pause,
  ArrowRight
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { cn } from './lib/utils';

type HandwritingFont = 'font-apple' | 'font-zeyada' | 'font-badscript' | 'font-cedarville' | 'font-delafield' | 'font-belle' | 'font-meddon';

interface WorkbookState {
  text: string;
  fontSize: number;
  lineSpacing: number;
  font: HandwritingFont;
  lineColor: string;
  guideColor: string;
  showGuides: boolean;
  baselineOffset: number;
  tracingOpacity: number;
}

// Simple wrapping logic for basic workbook rows
function wrapText(text: string, maxCharsPerLine: number = 25): string[] {
  const result: string[] = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    if (line.trim() === '') {
      result.push('');
      continue;
    }
    
    const words = line.split(' ');
    let currentLine = '';
    
    for (const word of words) {
      if ((currentLine + word).length > maxCharsPerLine) {
        result.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine += word + ' ';
      }
    }
    result.push(currentLine.trim());
  }
  
  return result;
}

export default function App() {
  const [state, setState] = useState<WorkbookState>({
    text: 'The quick brown fox jumps over the lazy dog.',
    fontSize: 54,
    lineSpacing: 80, 
    font: 'font-cedarville',
    lineColor: '#EF4444',
    guideColor: '#3B82F6',
    showGuides: true,
    baselineOffset: 0,
    tracingOpacity: 1,
  });

  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [zoomedLine, setZoomedLine] = useState<string | null>(null);
  const workbookRef = useRef<HTMLDivElement>(null);

  const downloadImage = async () => {
    if (workbookRef.current === null) return;
    try {
      const dataUrl = await toPng(workbookRef.current, { cacheBust: true, pixelRatio: 3, backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.download = `cursive-handwriting-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('oops, something went wrong!', err);
    }
  };

  const fonts: { name: string; id: HandwritingFont }[] = [
    { name: 'Cedarville', id: 'font-cedarville' },
    { name: 'Zeyada', id: 'font-zeyada' },
    { name: 'Apple', id: 'font-apple' },
    { name: 'Bad Script', id: 'font-badscript' },
    { name: 'La Belle', id: 'font-belle' },
    { name: 'Elegant', id: 'font-delafield' },
    { name: 'Old School', id: 'font-meddon' },
  ];

  const charsPerLine = Math.floor(600 / (state.fontSize * 0.4));
  const textLines = useMemo(() => wrapText(state.text, charsPerLine), [state.text, charsPerLine]);

  // Multi-page logic
  const linesPerPage = 12; // Standard lines for a clean page
  const pages = useMemo(() => {
    const p: string[][] = [];
    for (let i = 0; i < textLines.length; i += linesPerPage) {
      p.push(textLines.slice(i, i + linesPerPage));
    }
    if (p.length === 0) p.push([]);
    return p;
  }, [textLines, linesPerPage]);

  return (
    <div className="h-screen bg-paper-bg flex flex-col font-sans text-gray-800 overflow-hidden">
      {/* Header */}
      <header className="bg-white px-8 py-5 border-b border-gray-100 flex justify-between items-center shrink-0 z-30 shadow-sm">
        <div className="font-serif italic font-black text-2xl tracking-tighter text-gray-900 flex items-center gap-2">
          <div className="bg-accent-blue w-8 h-8 rounded-lg flex items-center justify-center text-white not-italic text-sm">S</div>
          Little<span className="text-accent-blue not-italic">Scribe</span>
        </div>
        <div className="flex gap-4 items-center">
          <div className="bg-[#ECFDF5] text-[#059669] text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-[#D1FAE5] hidden sm:flex">
            <CheckCircle2 size={12} />
            LEARNING MODE
          </div>
          <button 
            onClick={downloadImage}
            className="bg-accent-blue hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-xs font-black uppercase tracking-wider transition-all shadow-lg active:scale-95"
          >
            <Download size={16} />
            Export PNG
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[340px] bg-white border-r border-gray-100 p-8 flex flex-col gap-8 overflow-y-auto shrink-0 z-20 scrollbar-hide">
          <section className="space-y-4">
            <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-between">
              <span className="flex items-center gap-2 italic">
                <Type size={14} className="text-accent-blue" />
                Lesson Content
              </span>
              <button onClick={() => setState({ ...state, text: '' })} title="Clear All">
                <Trash2 size={14} />
              </button>
            </div>
            <textarea
              value={state.text}
              onChange={(e) => setState({ ...state, text: e.target.value })}
              className="w-full h-32 p-4 bg-gray-50 border-2 border-[#F3F4F6] rounded-2xl focus:border-accent-blue transition-all outline-none resize-none font-sans text-sm text-gray-700 leading-relaxed shadow-inner"
              placeholder="Type lessons here..."
            />
            <p className="text-[10px] text-gray-400 italic">Text wraps automatically into workbook rows.</p>
          </section>

          <section className="space-y-6">
            <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 italic">
              <Settings2 size={14} className="text-accent-blue" />
              Workbook Styling
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-gray-600">
                  <span>Row Height</span>
                  <span className="font-mono text-gray-400">{state.lineSpacing}px</span>
                </div>
                <input
                  type="range" min="60" max="240" step="2"
                  value={state.lineSpacing}
                  onChange={(e) => setState({ ...state, lineSpacing: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-accent-blue outline-none"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-gray-600">
                  <span>Letter Size</span>
                  <span className="font-mono text-gray-400">{state.fontSize}px</span>
                </div>
                <input
                  type="range" min="20" max="160"
                  value={state.fontSize}
                  onChange={(e) => setState({ ...state, fontSize: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-accent-blue outline-none"
                />
              </div>

              <div className="space-y-3 bg-blue-50/50 p-4 rounded-2xl border border-blue-50">
                <div className="flex justify-between items-center text-xs font-bold text-blue-600">
                   <span className="flex items-center gap-2 italic"><MoveHorizontal size={14} /> Vertical Align</span>
                   <span className="font-mono text-blue-300">{state.baselineOffset}px</span>
                </div>
                <input
                  type="range" min="-50" max="50" step="1"
                  value={state.baselineOffset}
                  onChange={(e) => setState({ ...state, baselineOffset: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-blue-100 rounded-full appearance-none cursor-pointer accent-accent-blue outline-none"
                />
              </div>

              <div className="space-y-3">
                <span className="text-xs font-bold text-gray-600 block italic">Tracing Opacity ({Math.round(state.tracingOpacity * 100)}%)</span>
                <input
                  type="range" min="0.01" max="1" step="0.05"
                  value={state.tracingOpacity}
                  onChange={(e) => setState({ ...state, tracingOpacity: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-accent-blue outline-none"
                />
              </div>

              <div className="space-y-3">
                <span className="text-xs font-bold text-gray-600 block italic">Selection Handwriting</span>
                <div className="grid grid-cols-1 gap-1.5">
                  {fonts.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setState({ ...state, font: f.id })}
                      className={cn(
                        "p-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 flex items-center justify-between px-5",
                        state.font === f.id 
                          ? "bg-accent-blue text-white border-accent-blue shadow-lg" 
                          : "bg-white border-gray-50 text-gray-400 hover:border-gray-200"
                      )}
                    >
                      <span className={cn(f.id, "text-xl normal-case font-normal", state.font === f.id ? "text-white" : "text-gray-900")}>AaBbCc</span>
                      <span className="opacity-50">{f.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pb-6">
                <div className="bg-gray-50/50 p-2 rounded-2xl border border-gray-100 flex items-center justify-between">
                  <span className="text-[8px] font-black text-gray-400">OUTER</span>
                  <input type="color" value={state.lineColor} onChange={(e) => setState({ ...state, lineColor: e.target.value })} className="w-5 h-5 rounded-md bg-transparent cursor-pointer border-none" />
                </div>
                <div className="bg-gray-50/50 p-2 rounded-2xl border border-gray-100 flex items-center justify-between">
                  <span className="text-[8px] font-black text-gray-400">INNER</span>
                  <input type="color" value={state.guideColor} onChange={(e) => setState({ ...state, guideColor: e.target.value })} className="w-5 h-5 rounded-md bg-transparent cursor-pointer border-none" />
                </div>
              </div>
            </div>
          </section>
        </aside>

        {/* Workspace Area */}
        <main className="flex-1 overflow-auto p-12 bg-[#F9FAFB] flex flex-col items-center gap-12 scrollbar-hide">
          <div className="w-full max-w-4xl flex justify-between items-center">
             <div className="flex gap-2 bg-white/80 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-white">
                <button onClick={() => setActiveTab('edit')} className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all", activeTab === 'edit' ? "bg-white shadow-xl text-gray-900" : "text-gray-300")}>Desk View</button>
                <button onClick={() => setActiveTab('preview')} className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all", activeTab === 'preview' ? "bg-white shadow-xl text-gray-900" : "text-gray-300")}>Tablet View</button>
             </div>
             <div className="text-right">
               <p className="text-[10px] font-black text-gray-300 uppercase italic tracking-widest">
                 {pages.length} Page{pages.length > 1 ? 's' : ''} Generated
               </p>
               <p className="text-[8px] font-bold text-gray-200 uppercase mt-1">Scroll down to see all content</p>
             </div>
          </div>

          <div ref={workbookRef} className="flex flex-col gap-12 w-full max-w-4xl items-center">
            {pages.map((pageLines, pageIdx) => (
              <motion.div 
                key={pageIdx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: pageIdx * 0.1 }}
                className={cn(
                  "bg-white shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden shrink-0 relative",
                  activeTab === 'preview' ? "w-[440px] min-h-[600px]" : "w-full aspect-[1/1.414]"
                )}
              >
                <div className="w-full h-full bg-white relative overflow-hidden flex flex-col pt-16 pb-12 px-10 md:px-20">
                  {/* Vertical Margin Line */}
                  <div className="absolute top-0 left-[60px] md:left-[110px] h-full w-[1px] bg-red-100 z-0 opacity-40" />
                  
                  <div className="relative z-10 flex-1 flex flex-col mt-6">
                    {pageLines.map((line, idx) => (
                      <div key={idx} className="group relative">
                        <WorkbookRow 
                          line={line} 
                          settings={state} 
                          onWordClick={(word) => setZoomedLine(word)}
                        />
                      </div>
                    ))}
                    
                    {/* Fill remaining space with empty rows */}
                    {Array.from({ length: Math.max(0, linesPerPage - pageLines.length) }).map((_, i) => (
                      <WorkbookRow key={`empty-${i}`} line="" settings={state} />
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-50 flex justify-between items-center text-[8px] font-black text-gray-200 tracking-widest uppercase">
                    <span>Little Scribe Learning Tools</span>
                    <span className="text-gray-400">Sheet {pageIdx + 1} of {pages.length}</span>
                    <span>Vol 1.0</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </main>
      </div>

      {/* Zoom Modal with Stroke Guide */}
      <AnimatePresence>
        {zoomedLine && (
          <ZoomModal line={zoomedLine} settings={state} onClose={() => setZoomedLine(null)} />
        )}
      </AnimatePresence>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

interface WorkbookRowProps {
  line: string;
  settings: WorkbookState;
  onWordClick?: (word: string) => void;
  key?: React.Key;
}

function WorkbookRow({ line, settings, onWordClick }: WorkbookRowProps) {
  const h = settings.lineSpacing;
  const unit = h / 3;
  
  // Split while keeping whitespace to preserve layout perfectly
  const parts = line.split(/(\s+)/);

  return (
    <div className="relative w-full shrink-0" style={{ height: `${h}px`, marginBottom: '1px' }}>
      {settings.showGuides && (
        <div className="absolute inset-0 pointer-events-none opacity-60">
          <div className="absolute top-0 left-0 w-full h-[1px]" style={{ backgroundColor: settings.lineColor }} />
          <div className="absolute left-0 w-full h-[1px] opacity-40" style={{ top: `${unit}px`, backgroundColor: settings.guideColor }} />
          <div className="absolute left-0 w-full h-[1.5px] opacity-60" style={{ top: `${2 * unit}px`, backgroundColor: settings.guideColor }} />
          <div className="absolute left-0 w-full h-[1px]" style={{ top: `${3 * unit}px`, backgroundColor: settings.lineColor }} />
        </div>
      )}
      <div 
        className={cn("absolute inset-0 whitespace-nowrap pl-2 leading-none z-10 select-none", settings.font)}
        style={{ 
          fontSize: `${settings.fontSize}px`,
          opacity: settings.tracingOpacity,
          paddingTop: `${(2 * unit) - (settings.fontSize * 0.77) + settings.baselineOffset}px`,
          color: '#1e293b'
        }}
      >
        {line.trim() === "" ? " " : parts.map((part, idx) => {
          const isSpace = /^\s+$/.test(part);
          if (isSpace) return <span key={idx} className="inline">{part}</span>;
          return (
            <span 
              key={idx} 
              onClick={(e) => {
                e.stopPropagation();
                onWordClick?.(part.trim());
              }}
              className="inline hover:text-accent-blue cursor-help transition-colors duration-200"
            >
              {part}
            </span>
          );
        })}
      </div>
    </div>
  );
}

const STROKE_GUIDES: Record<string, string[]> = {
  'A': ['Start at 2 o\'clock position', 'Counter-clockwise full oval', 'Close at top', 'Straight down tail'],
  'B': ['Tall loop starting UP to line 1', 'Curving DOWN to baseline', 'Back UP to mid-line belly', 'Exit hook'],
  'C': ['Upward slant to mid-line', 'Curve BACK left and down', 'Round out at baseline', 'Connector out'],
  'D': ['Round oval start (like a)', 'Tall stem UP to top line', 'Reverse DOWN same stem', 'Exit tail'],
  'E': ['Loop UP from baseline to mid', 'Curve BACK and down', 'Sit on baseline', 'Exit connector'],
  'F': ['Tall loop to line 1', 'Long stem DOWN to line 4', 'Forward loop closure', 'Exit link'],
  'G': ['Round oval (like a)', 'Downstroke to line 4', 'Back loop cross at baseline', 'Connector up'],
  'H': ['Tall loop to line 1', 'Down to baseline', 'Hump back UP to mid', 'Round tail exit'],
  'I': ['Upward slant to mid', 'Return DOWN same path', 'Dot on top', 'Exit tail'],
  'J': ['Upward slant to mid', 'Long stem DOWN to line 4', 'Back loop finish', 'Dot on top'],
  'K': ['Tall loop to line 1', 'Down to baseline', 'Small loop/kick at mid', 'Slide to exit'],
  'L': ['Tall loop to line 1', 'Wide curve DOWN to base', 'Stay on base tail'],
  'M': ['Three humps starting mid', 'Reach mid-line each time', 'Down to baseline', 'Exit connector'],
  'N': ['Two humps starting mid', 'Reach mid-line each time', 'Down to baseline', 'Exit connector'],
  'O': ['Round oval (like a)', 'Loop closure at top', 'High exit hook'],
  'P': ['Up to mid-line', 'DOWN to bottom line 4', 'Back UP to oval closure', 'Exit connector'],
  'Q': ['Round oval (like a)', 'DOWN past baseline', 'Backward loop finish', 'Stem cross'],
  'R': ['Slant UP to mid', 'Small shoulder dip', 'DOWN to baseline', 'Curve out'],
  'S': ['Slant UP to mid', 'Curve back to belly', 'Knot closure at base', 'Exit tail'],
  'T': ['Slant UP high to line 1', 'Return DOWN same stem', 'Cross at mid-line', 'Exit tail'],
  'U': ['Slant UP to mid', 'Dip to baseline', 'Back UP to mid', 'Return down tail'],
  'V': ['Slant UP to mid', 'V-curve to base', 'Back UP to mid', 'High exit hook'],
  'W': ['U-curve start', 'Second U-curve', 'High exit hook'],
  'X': ['Down slant cross', 'Lift and cross back', 'Connecting tail'],
  'Y': ['U-curve start', 'Stem DOWN to line 4', 'Back loop finish'],
  'Z': ['Shoulder at mid', 'Down slant dip', 'Bottom tail loop'],
  'default': ['Follow handwriting flow', 'Maintain consistent slant', 'Finish with connector'],
};

// Helper component to render a single letter with stroke direction arrows and numbers
function GuidedAlphabetLetter({ letter, font }: { letter: string; font: string }) {
  // Define simplified path data for the alphabet based on the reference PDF
  // These are normalized 100x120 coordinates
  const paths: Record<string, { d: string; arrows: { x: number; y: number; angle: number }[]; starts: { x: number; y: number }[] }> = {
    'A': {
      d: "M 80 40 Q 50 10 20 40 Q 20 80 50 110 Q 80 80 80 40 V 110",
      starts: [{ x: 80, y: 40 }],
      arrows: [{ x: 40, y: 15, angle: 180 }, { x: 80, y: 75, angle: 90 }]
    },
    'B': {
      d: "M 30 110 V 10 Q 70 10 70 45 Q 70 80 30 80 Q 80 80 80 115 Q 30 115 30 110",
      starts: [{ x: 30, y: 110 }],
      arrows: [{ x: 30, y: 40, angle: 0 }, { x: 70, y: 35, angle: 90 }, { x: 70, y: 95, angle: 90 }]
    },
    'C': {
      d: "M 80 30 Q 80 10 50 10 Q 20 10 20 60 Q 30 110 80 110",
      starts: [{ x: 80, y: 30 }],
      arrows: [{ x: 45, y: 10, angle: 180 }, { x: 20, y: 60, angle: 90 }]
    },
    'T': {
      d: "M 50 10 V 110 M 20 50 H 80",
      starts: [{ x: 50, y: 10 }, { x: 20, y: 50 }],
      arrows: [{ x: 50, y: 60, angle: 90 }, { x: 50, y: 50, angle: 0 }]
    },
    'default': {
      d: "M 20 60 Q 50 10 80 60 Q 50 110 20 60", // Generic loop
      starts: [{ x: 20, y: 60 }],
      arrows: [{ x: 50, y: 15, angle: 0 }]
    }
  };

  const data = paths[letter] || paths['default'];

  return (
    <div className="w-24 h-32 bg-gray-50 rounded-2xl border border-gray-100 p-2 flex items-center justify-center relative group overflow-hidden">
      {/* Background Reference Font */}
      <span className={cn("absolute inset-0 flex items-center justify-center text-7xl opacity-5 select-none", font)}>
        {letter.toLowerCase()}
      </span>

      <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-sm">
        {/* The Skeleton Stroke */}
        <path 
          d={data.d} 
          fill="none" 
          stroke="#3B82F6" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="opacity-50"
        />
        
        {/* Animated Stroke Reveal (Group hover) */}
        <motion.path 
          d={data.d} 
          fill="none" 
          stroke="#3B82F6" 
          strokeWidth="4" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />

        {/* Direction arrows */}
        {data.arrows.map((arrow, i) => (
          <g key={i} transform={`translate(${arrow.x},${arrow.y}) rotate(${arrow.angle})`}>
            <path 
              d="M -3 -3 L 3 0 L -3 3" 
              fill="none" 
              stroke="#3B82F6" 
              strokeWidth="2" 
              strokeLinecap="round"
            />
          </g>
        ))}

        {/* Start numbers */}
        {data.starts.map((start, i) => (
          <g key={i}>
            <circle cx={start.x} cy={start.y} r="6" fill="#3B82F6" />
            <text x={start.x} y={start.y} textAnchor="middle" dy="2.5" fontSize="7" fontWeight="bold" fill="white">{i + 1}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function ZoomModal({ line: word, settings, onClose }: { line: string; settings: WorkbookState; onClose: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Get unique letters from the word to show their individual guides
  const uniqueLetters = useMemo(() => {
    return Array.from(new Set(word.trim().toUpperCase().split(''))).filter(c => /[A-Z]/.test(c));
  }, [word]);

  // Dynamically scale font based on word length to ensure it "fits"
  const getDynamicFontSize = (w: string) => {
    const len = w.length;
    if (len <= 3) return 'text-[180px] md:text-[240px]';
    if (len <= 6) return 'text-[140px] md:text-[180px]';
    if (len <= 10) return 'text-[100px] md:text-[140px]';
    return 'text-[70px] md:text-[100px]';
  };

  const dynamicFontSize = getDynamicFontSize(word);

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-2xl flex items-center justify-center p-4 md:p-12"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
        className="bg-white w-full max-w-6xl h-auto min-h-[70vh] md:h-[90vh] rounded-[48px] shadow-2xl overflow-hidden flex flex-col md:flex-row relative"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-6 right-6 w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors z-40">
          <X size={24} />
        </button>

        {/* Left Lesson Area */}
        <div className="flex-1 p-6 md:p-12 flex flex-col justify-center items-center bg-gray-50/50 relative overflow-hidden min-h-[400px]">
           <div className="w-full max-w-4xl bg-white p-6 py-16 md:p-12 md:py-32 rounded-[40px] shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 relative overflow-hidden">
              {/* Giant Workbook Row Background */}
              <div className="absolute inset-0 p-10 py-24 pointer-events-none opacity-20">
                 <div className="w-full h-full relative border-x border-dashed border-gray-100">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-red-400" />
                    <div className="absolute left-0 w-full h-[2px] bg-blue-300" style={{ top: '33.3%' }} />
                    <div className="absolute left-0 w-full h-[3px] bg-blue-400" style={{ top: '66.6%' }} />
                    <div className="absolute left-0 w-full h-[2px] bg-red-400" style={{ top: '100%' }} />
                 </div>
              </div>

              {/* The Word Container */}
              <div className="relative z-10 flex items-center justify-center overflow-visible">
                 <div className="relative inline-block">
                    {/* Shadow Text (Placeholder) */}
                    <span className={cn("transition-all duration-1000 select-none whitespace-nowrap block text-center", settings.font, dynamicFontSize, isPlaying ? "text-gray-100" : "text-gray-900")}>
                      {word}
                    </span>
                    
                    {/* Stroke Overlay Animation */}
                    <AnimatePresence>
                      {isPlaying && (
                        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                          <div className={cn("relative select-none whitespace-nowrap", settings.font, dynamicFontSize)}>
                             <motion.div 
                                initial={{ width: 0 }} 
                                animate={{ width: '100%' }} 
                                transition={{ duration: Math.max(word.length * 0.5, 2), ease: 'linear', repeat: Infinity }}
                                className="absolute inset-0 bg-white z-20 mix-blend-lighten"
                             />
                             <span className="text-accent-blue drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                               {word}
                             </span>
                             {/* The Animated Cursor ("Hand") */}
                             <motion.div 
                                initial={{ left: 0 }} 
                                animate={{ left: '100%' }} 
                                transition={{ duration: Math.max(word.length * 0.5, 2), ease: 'linear', repeat: Infinity }}
                                className="absolute top-1/2 -translate-y-1/2 z-30 flex flex-col items-center pointer-events-none"
                             >
                                <div className="w-5 h-5 md:w-8 md:h-8 rounded-full bg-accent-blue shadow-lg border-2 border-white" />
                                <div className="h-24 w-[3px] bg-accent-blue/40 blur-[1px]" />
                             </motion.div>
                          </div>
                        </div>
                      )}
                    </AnimatePresence>

                    {/* Static Stroke Order Markers */}
                    {!isPlaying && (
                      <div className="absolute inset-x-0 bottom-0 pointer-events-none flex justify-around px-4 translate-y-4">
                         {[...word].filter(c => c !== ' ').map((char, i) => (
                           <motion.div 
                             key={i}
                             initial={{ scale: 0, y: 10 }} animate={{ scale: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                             className="w-5 h-5 md:w-7 md:h-7 bg-accent-blue rounded-full text-[9px] md:text-[11px] font-black text-white flex items-center justify-center shadow-lg border-2 border-white shrink-0 mx-0.5"
                           >
                             {i + 1}
                           </motion.div>
                         ))}
                      </div>
                    )}
                 </div>
              </div>
           </div>

           {/* Quick Tips */}
           <div className="mt-8 flex flex-wrap justify-center gap-4 opacity-70">
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-100 text-[9px] font-black uppercase tracking-widest text-gray-400">
                <div className="w-2 h-2 rounded-full bg-red-400" /> Capital Line
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-100 text-[9px] font-black uppercase tracking-widest text-gray-400">
                <div className="w-2 h-2 rounded-full bg-blue-300" /> Mid Line
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-100 text-[9px] font-black uppercase tracking-widest text-gray-400">
                <div className="w-2 h-2 rounded-full bg-blue-400" /> Baseline
              </div>
           </div>
        </div>

        {/* Right Sidebar Guide */}
        <div className="w-full md:w-[420px] bg-white border-l border-gray-100 p-8 flex flex-col gap-6 shrink-0 h-full overflow-y-auto scrollbar-hide">
           <div className="space-y-1">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-accent-blue mb-2">
                <Maximize2 size={20} />
              </div>
              <h2 className="text-xl font-serif italic font-black text-gray-900 tracking-tight">Stroke Sequence Guide</h2>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Mastering "{word}" Letter by Letter</p>
           </div>

           <div className="flex-1 space-y-8 py-2">
              {uniqueLetters.map((letter) => {
                const letterGuides = STROKE_GUIDES[letter] || STROKE_GUIDES['default'];
                return (
                  <div key={letter} className="space-y-4">
                    <div className="flex items-center gap-3 border-b border-gray-50 pb-2">
                      <div className={cn("text-4xl text-accent-blue", settings.font)}>{letter}</div>
                      <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Construction</div>
                    </div>
                    <div className="flex items-start gap-4">
                      <GuidedAlphabetLetter letter={letter} font={settings.font} />
                      <div className="flex-1 space-y-3">
                        {letterGuides.map((step, i) => (
                          <motion.div 
                            key={`${letter}-${i}`}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-gray-50/50 p-4 rounded-3xl border border-gray-100 flex gap-4 items-start group hover:bg-white hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-300"
                          >
                            <div className="w-6 h-6 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-[10px] font-black text-accent-blue shrink-0 mt-0.5 group-hover:bg-accent-blue group-hover:text-white transition-colors">
                              {i + 1}
                            </div>
                            <p className="text-[11px] text-gray-500 font-bold leading-tight pt-1">{step}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
           </div>

           <div className="space-y-3 pt-4 border-t border-gray-50 mt-auto sticky bottom-0 bg-white pb-2">
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className={cn(
                  "w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest transition-all shadow-xl active:scale-98",
                  isPlaying ? "bg-red-500 text-white shadow-red-200" : "bg-accent-blue text-white shadow-blue-200"
                )}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                {isPlaying ? "Pause Learning" : "Show Stroke Flow"}
              </button>
              <button onClick={onClose} className="w-full py-3 text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] hover:text-gray-500 transition-colors">
                Back to Workbook
              </button>
           </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

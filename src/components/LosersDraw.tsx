import React, { useState } from 'react';
import { Target, Ban, Play, History, RotateCcw } from 'lucide-react';
import { RaffleSettings } from '../types';

interface Props {
  settings: RaffleSettings;
  onUpdate: (updates: Partial<RaffleSettings>) => void;
  isAdmin?: boolean;
}

const LosersDraw: React.FC<Props> = ({ settings, onUpdate, isAdmin }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentWinner, setCurrentWinner] = useState<number | null>(null);
  const [exclusionInput, setExclusionInput] = useState('');

  const drawLoser = () => {
    if (isDrawing) return;

    // Filter available numbers
    const available = [];
    for (let i = settings.rangeStart; i <= settings.rangeEnd; i++) {
      if (!settings.drawnNumbers.includes(i) && !settings.winnerExclusions.includes(i)) {
        available.push(i);
      }
    }

    if (available.length === 0) {
      alert('No more numbers available to draw!');
      return;
    }

    setIsDrawing(true);
    let iterations = 0;
    const maxIterations = 40;
    
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * available.length);
      setCurrentWinner(available[randomIndex]);
      iterations++;

      if (iterations >= maxIterations) {
        clearInterval(interval);
        setIsDrawing(false);
      }
    }, 80);
  };

  const addExclusion = (numStr: string) => {
    const num = parseInt(numStr);
    if (!isNaN(num) && !settings.winnerExclusions.includes(num)) {
      onUpdate({ winnerExclusions: [...settings.winnerExclusions, num] });
      setExclusionInput('');
    }
  };

  const removeExclusion = (num: number) => {
    onUpdate({ winnerExclusions: settings.winnerExclusions.filter(n => n !== num) });
  };

  return (
    <div className="relative w-full h-full bg-slate-950 flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-slate-950 to-indigo-900/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[150px] animate-pulse" />
      </div>

      <div className="relative z-10 w-full max-w-6xl flex flex-col gap-12">
        {/* Header Section */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-4 px-8 py-3 rounded-full bg-indigo-600/20 border border-indigo-500/30 backdrop-blur-md">
            <Target className="w-8 h-8 text-indigo-400" />
            <span className="text-xl font-black uppercase tracking-[0.4em] text-white">The Losers Draw</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-black text-white text-glow shadow-indigo-500/20 max-w-4xl mx-auto leading-tight">
            YOUR SECOND CHANCE AT GLORY
          </h1>
        </div>

        {/* Display Area */}
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center min-h-[40vh]">
            {/* Main Draw Result */}
            <div className="relative group">
                <div className={`w-80 h-80 md:w-96 md:h-96 rounded-[3rem] border-4 border-indigo-500/30 bg-black/40 backdrop-blur-3xl flex flex-col items-center justify-center transform transition-all duration-700 shadow-2xl ${isDrawing ? 'scale-110 rotate-3' : 'scale-100 rotate-0'}`}>
                    <span className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-4">Winner #1</span>
                    <span className={`text-9xl md:text-[12rem] font-black text-white leading-none ${isDrawing ? 'animate-pulse' : 'text-glow'}`}>
                        {currentWinner || '??'}
                    </span>
                    <div className="absolute inset-0 border border-white/5 rounded-[3rem] pointer-events-none" />
                </div>
                
                {/* Secondary prize slots (mini) */}
                <div className="absolute -bottom-4 -right-4 flex gap-2">
                    <div className="w-20 h-20 rounded-2xl bg-slate-900/80 border border-white/10 flex items-center justify-center text-2xl font-black text-slate-500">
                        {/* Placeholder for winner history if needed */}
                        #1
                    </div>
                    <div className="w-20 h-20 rounded-2xl bg-slate-900/80 border border-white/10 flex items-center justify-center text-2xl font-black text-slate-500">
                        #2
                    </div>
                </div>
            </div>

            {/* Admin Stats / Exclusion Box */}
            {isAdmin && (
                <div className="w-full max-w-md bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 flex flex-col gap-6 shadow-2xl">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                            <Ban className="w-4 h-4" /> Exclusions ({settings.winnerExclusions.length})
                        </h3>
                        <button onClick={() => onUpdate({ winnerExclusions: [] })} className="text-[10px] text-slate-500 hover:text-red-400 uppercase font-bold tracking-widest">
                            Clear All
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <input 
                            type="number" 
                            value={exclusionInput}
                            onChange={(e) => setExclusionInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addExclusion(exclusionInput)}
                            placeholder="Enter previous winner..."
                            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none"
                        />
                        <button 
                            onClick={() => addExclusion(exclusionInput)}
                            className="bg-indigo-600 hover:bg-indigo-500 px-6 rounded-xl font-bold transition-all disabled:opacity-50"
                        >
                            <PlusIcon className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                        {settings.winnerExclusions.map(num => (
                            <div key={num} className="bg-slate-800/80 border border-white/5 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 group">
                                {num}
                                <button onClick={() => removeExclusion(num)} className="text-slate-500 hover:text-red-500 transition-colors">
                                    <XIcon className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 border-t border-white/5">
                        <button 
                            onClick={drawLoser}
                            disabled={isDrawing}
                            className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-lg transition-all shadow-xl ${
                                isDrawing 
                                ? 'bg-slate-800 text-slate-500 cursor-wait' 
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 active:scale-95'
                            }`}
                        >
                            <div className="flex items-center justify-center gap-3">
                                <Play className="w-5 h-5" fill="currentColor" />
                                {isDrawing ? 'Selecting...' : 'Start Draw'}
                            </div>
                        </button>
                    </div>
                </div>
            )}
        </div>

        {/* Footer Buildup Hint */}
        {!isAdmin && !currentWinner && (
            <div className="text-center animate-pulse">
                <p className="text-xl md:text-2xl text-slate-400 font-medium">Draw starting in 15 seconds...</p>
                <p className="text-indigo-400 font-bold uppercase tracking-widest mt-2">Exclude all previously drawn winners</p>
            </div>
        )}
      </div>
    </div>
  );
};

// Simple icon helpers since I can't import Plus/X properly if they aren't standard or were missed
const PlusIcon = (props: any) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12M6 12h12" /></svg>;
const XIcon = (props: any) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

export default LosersDraw;

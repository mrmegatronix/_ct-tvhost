import React, { useState, useEffect, useRef } from 'react';
import { Target, Trophy } from 'lucide-react';
import { useGlobalState } from '../context/GlobalStateContext';

const LosersDraw: React.FC = () => {
  const context = useGlobalState();
  const [isDrawing, setIsDrawing] = useState(false);
  const [displayNumber, setDisplayNumber] = useState<number | null>(null);
  const [visibleHistory, setVisibleHistory] = useState<number[]>([]);
  
  const prevDrawCount = useRef(0);

  useEffect(() => {
    if (!context?.state) return;
    const { loserSettings, raffleSettings } = context.state;
    
    // Initialize if first load
    if (visibleHistory.length === 0 && loserSettings.drawnNumbers.length > 0) {
       setVisibleHistory(loserSettings.drawnNumbers);
       setDisplayNumber(loserSettings.drawnNumbers[loserSettings.drawnNumbers.length - 1]);
       prevDrawCount.current = loserSettings.drawnNumbers.length;
       return;
    }

    if (loserSettings.drawnNumbers.length > prevDrawCount.current) {
      // New draw triggered!
      const newWinner = loserSettings.drawnNumbers[loserSettings.drawnNumbers.length - 1];
      
      setIsDrawing(true);
      let iterations = 0;
      const maxIterations = 40; // 4 seconds of suspense
      
      const interval = setInterval(() => {
        // Show crazy random numbers
        const random = Math.floor(Math.random() * (raffleSettings.rangeEnd - raffleSettings.rangeStart + 1)) + raffleSettings.rangeStart;
        setDisplayNumber(random);
        iterations++;
        
        if (iterations >= maxIterations) {
          clearInterval(interval);
          setDisplayNumber(newWinner);
          setVisibleHistory(loserSettings.drawnNumbers);
          setIsDrawing(false);
        }
      }, 80);
      
    } else if (loserSettings.drawnNumbers.length < prevDrawCount.current) {
      // Reset
      setVisibleHistory(loserSettings.drawnNumbers);
      setDisplayNumber(null);
    }
    
    prevDrawCount.current = loserSettings.drawnNumbers.length;
  }, [context?.state]);

  if (!context?.state) return null;
  const { loserSettings } = context.state;

  return (
    <div className="relative w-full h-full bg-slate-950 flex flex-col items-center justify-center p-8 overflow-hidden select-none">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-slate-950 to-indigo-900/40" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/20 rounded-full blur-[150px] animate-pulse" />
      </div>

      <div className="relative z-10 w-full max-w-6xl flex flex-col gap-12">
        {/* Header Section */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-4 px-8 py-3 rounded-full bg-indigo-600/30 border border-indigo-500/50 backdrop-blur-md shadow-[0_0_30px_rgba(99,102,241,0.3)]">
            <Target className="w-8 h-8 text-indigo-400" />
            <span className="text-xl font-black uppercase tracking-[0.4em] text-white">The Losers Draw</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-black text-white text-glow shadow-indigo-500/20 max-w-4xl mx-auto leading-tight">
            YOUR SECOND CHANCE AT GLORY
          </h1>
        </div>

        {/* Display Area */}
        <div className="flex flex-col items-center justify-center min-h-[40vh] mt-8">
            <div className="relative group">
                <div className={`w-[28rem] h-[28rem] rounded-full border-[16px] border-indigo-500/40 bg-black/60 backdrop-blur-3xl flex flex-col items-center justify-center transform transition-all duration-700 shadow-[0_0_150px_rgba(99,102,241,0.3)] ${isDrawing ? 'scale-110 !rotate-[10deg] border-indigo-400 shadow-[0_0_300px_rgba(99,102,241,0.6)]' : 'scale-100 rotate-0'}`}>
                    <span className="text-lg font-bold uppercase tracking-[0.3em] text-indigo-400 mb-6 drop-shadow-lg">
                       {isDrawing ? "SEARCHING..." : displayNumber ? "WINNER!" : "READY"}
                    </span>
                    <span className={`text-[12rem] font-black leading-none drop-shadow-2xl transition-all ${isDrawing ? 'text-indigo-300 blur-[2px] scale-110' : 'text-white scale-100 text-glow'}`}>
                        {displayNumber || '??'}
                    </span>
                    <div className="absolute inset-0 border-4 border-white/10 rounded-full pointer-events-none animate-ping [animation-duration:3s]" />
                </div>
                
                {/* Secondary prize slots indicating History */}
                <div className="absolute -bottom-8 -right-12 flex gap-4">
                    {Array.from({ length: loserSettings.drawCount }).map((_, i) => (
                        <div 
                           key={i} 
                           className={`w-28 h-28 rounded-3xl border-2 flex items-center justify-center text-4xl font-black transition-all duration-500 shadow-xl ${
                             visibleHistory[i]
                             ? i === visibleHistory.length - 1 && !isDrawing
                               ? 'bg-indigo-600 border-indigo-400 text-white scale-125 z-50 animate-bounce-slow'
                               : 'bg-indigo-900/80 border-indigo-500/50 text-indigo-300 scale-100 backdrop-blur-xl'
                             : 'bg-slate-900/80 border-white/10 text-slate-600 backdrop-blur-xl'
                           }`}
                        >
                            {visibleHistory[i] || ''}
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Footer Buildup Hint */}
        {!displayNumber && !isDrawing && visibleHistory.length === 0 && (
            <div className="text-center animate-pulse mt-12">
                <p className="text-3xl text-slate-300 font-serif italic drop-shadow-lg">Draw starting shortly...</p>
                <p className="text-indigo-300 font-bold uppercase tracking-[0.3em] mt-4 text-sm">All previous winners are excluded</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default LosersDraw;

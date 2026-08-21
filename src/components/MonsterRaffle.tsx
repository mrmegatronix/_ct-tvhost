import React, { useState, useEffect, useRef } from 'react';
import { Trophy, History } from 'lucide-react';
import { RaffleSettings } from '../types';

interface Props {
  settings: RaffleSettings;
  isAdmin?: boolean;
}

const MonsterRaffle: React.FC<Props> = ({ settings }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [displayNumber, setDisplayNumber] = useState<number | null>(null);
  const [visibleHistory, setVisibleHistory] = useState<number[]>(settings.drawnNumbers);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevDrawCount = useRef(settings.drawnNumbers.length);

  // Watch for external draw triggers (Remote / Admin adding a new number to state)
  useEffect(() => {
    if (settings.drawnNumbers.length > prevDrawCount.current) {
      // A new number was added! Trigger the animation sequence.
      const newWinner = settings.drawnNumbers[settings.drawnNumbers.length - 1];
      
      setIsDrawing(true);
      let iterations = 0;
      const maxIterations = 30; // 3 seconds spin
      
      const interval = setInterval(() => {
        // Show random spinning numbers
        const random = Math.floor(Math.random() * (settings.rangeEnd - settings.rangeStart + 1)) + settings.rangeStart;
        setDisplayNumber(random);
        iterations++;
        
        if (iterations >= maxIterations) {
          clearInterval(interval);
          setDisplayNumber(newWinner);
          setVisibleHistory(settings.drawnNumbers); // Reveal it in the grid
          setIsDrawing(false);
        }
      }, 100);
      
    } else if (settings.drawnNumbers.length < prevDrawCount.current) {
      // System was reset
      setVisibleHistory(settings.drawnNumbers);
      setDisplayNumber(settings.drawnNumbers[settings.drawnNumbers.length - 1] || null);
    }
    
    prevDrawCount.current = settings.drawnNumbers.length;
  }, [settings.drawnNumbers, settings.rangeEnd, settings.rangeStart]);

  return (
    <div className="relative w-full h-full bg-slate-950 flex flex-col items-center justify-center p-8 overflow-hidden select-none">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/40 via-slate-950 to-amber-900/30" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[150px] animate-pulse [animation-delay:1000ms]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl flex flex-col gap-12">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-4 px-8 py-3 rounded-full bg-red-600/20 border border-red-500/30 backdrop-blur-md animate-bounce-slow shadow-[0_0_30px_rgba(220,38,38,0.2)]">
            <Trophy className="w-8 h-8 text-amber-500" />
            <span className="text-xl font-black uppercase tracking-[0.3em] text-white tracking-widest">Monster Meat Raffle</span>
          </div>
          <h1 className="text-7xl md:text-9xl font-serif font-black text-white text-glow shadow-red-500/20 py-4">
            {isDrawing ? "DRAWING..." : displayNumber ? "WINNER!" : "GET READY!"}
          </h1>
        </div>

        {/* The Machine / Number Display */}
        <div className="relative aspect-video max-h-[40vh] w-full flex items-center justify-center -my-8">
            <div className={`relative w-80 h-80 md:w-96 md:h-96 rounded-full border-[12px] border-amber-500/30 flex items-center justify-center bg-black/60 backdrop-blur-3xl shadow-[0_0_150px_rgba(245,158,11,0.2)] transition-all duration-300 ${isDrawing ? 'scale-110 animate-spin-slow' : 'scale-100 animate-float'}`}>
                <span className={`text-[10rem] md:text-[14rem] leading-none font-black text-amber-500 text-glow transition-all duration-300 ${isDrawing ? 'scale-110 blur-md' : 'scale-100'}`}>
                    {displayNumber || '?'}
                </span>
                
                {/* Decorative Rings */}
                <div className="absolute -inset-6 border-2 border-amber-500/10 rounded-full animate-ping [animation-duration:3s]" />
                <div className="absolute -inset-10 border border-amber-500/5 rounded-full animate-ping [animation-duration:4s]" />
            </div>
        </div>

        {/* History Grid of Won Numbers */}
        <div className="space-y-6 pt-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3">
                    <History className="w-5 h-5" /> Winning Numbers ({visibleHistory.length} / {settings.drawCount})
                </span>
            </div>
            
            <div className="grid grid-cols-5 md:grid-cols-10 gap-4">
                {Array.from({ length: settings.drawCount }).map((_, i) => (
                    <div 
                        key={i}
                        className={`aspect-square rounded-2xl border-2 flex items-center justify-center text-3xl font-black transition-all duration-700 ${
                            visibleHistory[i] 
                            ? i === visibleHistory.length - 1 && !isDrawing
                                ? 'bg-amber-500 border-amber-400 text-white shadow-[0_0_40px_rgba(245,158,11,0.6)] animate-pulse scale-110 z-10' 
                                : 'bg-amber-500/20 border-amber-500/50 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)] scale-100'
                            : 'bg-white/5 border-white/5 text-slate-700/50 scale-100'
                        }`}
                    >
                        {visibleHistory[i] || ''}
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default MonsterRaffle;

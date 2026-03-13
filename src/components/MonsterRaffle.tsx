import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Download, RotateCcw, Play, History } from 'lucide-react';
import { RaffleSettings } from '../types';

interface Props {
  settings: RaffleSettings;
  onUpdate: (updates: Partial<RaffleSettings>) => void;
  isAdmin?: boolean;
}

const MonsterRaffle: React.FC<Props> = ({ settings, onUpdate, isAdmin }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [drawHistory, setDrawHistory] = useState<number[]>(settings.drawnNumbers || []);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const drawNumber = () => {
    if (isDrawing || drawHistory.length >= settings.drawCount) return;

    setIsDrawing(true);
    let iterations = 0;
    const maxIterations = 30;
    const interval = setInterval(() => {
      const random = Math.floor(Math.random() * (settings.rangeEnd - settings.rangeStart + 1)) + settings.rangeStart;
      setCurrentNumber(random);
      iterations++;

      if (iterations >= maxIterations) {
        clearInterval(interval);
        finalizeDraw();
      }
    }, 100);
  };

  const finalizeDraw = () => {
    const finalNumber = Math.floor(Math.random() * (settings.rangeEnd - settings.rangeStart + 1)) + settings.rangeStart;
    
    // Ensure uniqueness within the current raffle session
    if (drawHistory.includes(finalNumber)) {
        finalizeDraw(); // Retry if duplicate
        return;
    }

    setCurrentNumber(finalNumber);
    const newHistory = [...drawHistory, finalNumber];
    setDrawHistory(newHistory);
    onUpdate({ drawnNumbers: newHistory });
    setIsDrawing(false);
  };

  const resetRaffle = () => {
    if (confirm('Reset the raffle and clear all drawn numbers?')) {
      setDrawHistory([]);
      setCurrentNumber(null);
      onUpdate({ drawnNumbers: [] });
    }
  };

  const exportResults = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Draw Order,Winning Number\n"
      + drawHistory.map((n, i) => `${i + 1},${n}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `meat_raffle_results_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative w-full h-full bg-slate-950 flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-slate-950 to-amber-900/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-[120px] animate-pulse [animation-delay:1000ms]" />
      </div>

      <div className="relative z-10 w-full max-w-6xl flex flex-col gap-12">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-4 px-6 py-2 rounded-full bg-red-600/20 border border-red-500/30 backdrop-blur-md animate-bounce-slow">
            <Trophy className="w-6 h-6 text-amber-500" />
            <span className="text-sm font-black uppercase tracking-[0.3em] text-white">Thursday Night Monster Meat Raffle</span>
          </div>
          <h1 className="text-6xl md:text-9xl font-serif font-black text-white text-glow shadow-red-500/20">
            {isDrawing ? "DRAWING..." : currentNumber || "READY?"}
          </h1>
        </div>

        {/* The Machine */}
        <div className="relative aspect-video max-h-[40vh] w-full flex items-center justify-center">
            {/* Main Number Display */}
            <div className={`relative w-64 h-64 md:w-80 md:h-80 rounded-full border-8 border-amber-500/20 flex items-center justify-center bg-black/40 backdrop-blur-3xl shadow-[0_0_100px_rgba(245,158,11,0.1)] ${isDrawing ? 'animate-spin-slow' : 'animate-float'}`}>
                <span className={`text-8xl md:text-9xl font-black text-amber-500 text-glow ${isDrawing ? 'scale-110 blur-sm' : 'scale-100'}`}>
                    {currentNumber || '0'}
                </span>
                
                {/* Decorative Rings */}
                <div className="absolute -inset-4 border border-white/5 rounded-full animate-ping [animation-duration:3s]" />
                <div className="absolute -inset-8 border border-white/5 rounded-full animate-ping [animation-duration:4s]" />
            </div>
        </div>

        {/* History / Grid of Won Numbers */}
        <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <History className="w-4 h-4" /> Winning Numbers ({drawHistory.length} / {settings.drawCount})
                </span>
                {isAdmin && (
                    <div className="flex items-center gap-2">
                        <button onClick={exportResults} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors" title="Export CSV">
                            <Download className="w-4 h-4" />
                        </button>
                        <button onClick={resetRaffle} className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-500 transition-colors" title="Reset Raffle">
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
            
            <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
                {Array.from({ length: settings.drawCount }).map((_, i) => (
                    <div 
                        key={i}
                        className={`aspect-square rounded-xl border flex items-center justify-center text-xl font-black transition-all duration-500 ${
                            drawHistory[i] 
                            ? 'bg-amber-500/20 border-amber-500 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)] animate-pop-in' 
                            : 'bg-white/5 border-white/5 text-slate-700'
                        }`}
                    >
                        {drawHistory[i] || ''}
                    </div>
                ))}
            </div>
        </div>

        {/* Admin Controls Overlay (On hover or as panel) */}
        {isAdmin && (
            <div className="flex justify-center gap-6">
                <button 
                    onClick={drawNumber}
                    disabled={isDrawing || drawHistory.length >= settings.drawCount}
                    className={`group relative px-12 py-6 rounded-2xl font-black uppercase tracking-widest text-xl transition-all ${
                        isDrawing || drawHistory.length >= settings.drawCount
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_40px_rgba(220,38,38,0.4)] hover:scale-105 active:scale-95'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <Play className={`w-6 h-6 ${isDrawing ? 'animate-pulse' : ''}`} />
                        {isDrawing ? 'Spinning...' : 'Draw Winner'}
                    </div>
                    
                    {/* Glow effect */}
                    {!isDrawing && drawHistory.length < settings.drawCount && (
                        <div className="absolute inset-0 rounded-2xl bg-red-600 blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                    )}
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default MonsterRaffle;

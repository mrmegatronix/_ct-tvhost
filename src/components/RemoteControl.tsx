import React from 'react';
import { useGlobalState } from '../context/GlobalStateContext';
import { updateGlobalState } from '../socket';
import { Play, Pause, SkipForward, SkipBack, Monitor, Flame, Trophy, HelpCircle, LayoutList, Cloud, ShieldAlert } from 'lucide-react';
import { AppMode } from '../types';

const RemoteControl: React.FC = () => {
  const context = useGlobalState();

  if (!context?.state) {
    return (
      <div className="flex w-screen h-screen flex-col items-center justify-center bg-slate-950 text-amber-500 font-sans p-6 text-center">
        <ShieldAlert className="w-16 h-16 mb-4 animate-pulse text-red-500" />
        <h1 className="text-2xl font-black uppercase tracking-widest mb-2">Connecting to Server</h1>
        <p className="text-slate-400 text-sm">Ensure your phone is on the same WiFi network as the Host PC.</p>
      </div>
    );
  }

  const { mode, isPlaying, currentSlideIndex, slides, raffleSettings, loserSettings } = context.state;
  const activeSlides = slides.filter(s => !s.disabled);

  const setMode = (newMode: AppMode) => updateGlobalState({ mode: newMode });

  const handleNextSlide = () => {
    if (activeSlides.length === 0) return;
    updateGlobalState({ currentSlideIndex: (currentSlideIndex + 1) % activeSlides.length });
  };

  const handlePrevSlide = () => {
    if (activeSlides.length === 0) return;
    updateGlobalState({ currentSlideIndex: (currentSlideIndex - 1 + activeSlides.length) % activeSlides.length });
  };

  const handleDrawMonster = () => {
    // Generate a random number not in drawn list or exclusions
    const { rangeStart, rangeEnd, drawnNumbers, winnerExclusions } = raffleSettings;
    const available = [];
    for (let i = rangeStart; i <= rangeEnd; i++) {
      if (!drawnNumbers.includes(i) && !winnerExclusions.includes(i)) available.push(i);
    }
    
    if (available.length === 0) return alert('All numbers drawn!');
    
    const randomNum = available[Math.floor(Math.random() * available.length)];
    updateGlobalState({
      raffleSettings: {
        ...raffleSettings,
        drawnNumbers: [...drawnNumbers, randomNum]
      }
    });
  };

  const handleDrawLoser = () => {
    // Same logic but just random numbers? Or does it draw strictly from Monster exclusions?
    // Based on Losers Draw, let's just pick a random ticket out of 200 that hasn't won yet.
    const { rangeStart, rangeEnd } = raffleSettings;
    const { drawnNumbers } = loserSettings;
    const available = [];
    for (let i = rangeStart; i <= rangeEnd; i++) {
        // Can't have won Monster Raffle AND can't have won Losers already
        if (!raffleSettings.drawnNumbers.includes(i) && !drawnNumbers.includes(i)) available.push(i);
    }

    if (available.length === 0) return alert('All numbers drawn!');
    
    const randomNum = available[Math.floor(Math.random() * available.length)];
    updateGlobalState({
      loserSettings: {
        ...loserSettings,
        drawnNumbers: [...drawnNumbers, randomNum]
      }
    });
  };

  const modes: { id: AppMode, icon: any, label: string }[] = [
    { id: 'slides', icon: LayoutList, label: 'Slides' },
    { id: 'raffle', icon: Trophy, label: 'Monster Raffle' },
    { id: 'losers', icon: Monitor, label: 'Losers Draw' },
    { id: 'quiz', icon: HelpCircle, label: 'Quiz Mode' },
    { id: 'ace', icon: ShieldAlert, label: 'Chase Ace' },
    { id: 'weather', icon: Cloud, label: 'Weather' },
    { id: 'fireplace', icon: Flame, label: 'Fireplace' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-4 pb-20 select-none">
      <header className="mb-6 border-b border-white/10 pb-4">
        <h1 className="text-2xl font-black text-amber-500 tracking-tighter uppercase flex items-center gap-2">
          <Monitor className="w-6 h-6" /> TV Remote
        </h1>
        <p className="text-xs text-slate-500 font-bold tracking-widest uppercase mt-1">Live Sync Active</p>
      </header>

      {/* Mode Switches */}
      <section className="mb-8">
        <h2 className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase mb-3">Live Display Mode</h2>
        <div className="grid grid-cols-2 gap-3">
          {modes.map(m => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`flex items-center gap-3 p-4 rounded-2xl transition-all border ${
                mode === m.id 
                  ? 'bg-amber-600/20 border-amber-500 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                  : 'bg-slate-900 border-white/5 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <m.icon className="w-5 h-5 shrink-0" />
              <span className="font-bold text-sm tracking-wide">{m.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Contextual Controls */}
      <section className="p-4 bg-slate-900 rounded-3xl border border-white/5">
        {mode === 'slides' && (
          <div className="space-y-4">
            <h2 className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase text-center">Slide Controls</h2>
            
            <div className="flex items-center justify-center gap-4">
              <button 
                onClick={handlePrevSlide} 
                className="p-5 bg-slate-800 hover:bg-slate-700 rounded-2xl active:scale-95 transition-transform"
              >
                <SkipBack className="w-8 h-8 text-white" />
              </button>
              
              <button 
                onClick={() => updateGlobalState({ isPlaying: !isPlaying })} 
                className={`p-6 rounded-2xl active:scale-95 transition-transform shadow-xl ${
                  isPlaying ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isPlaying ? <Pause className="w-8 h-8" fill="currentColor" /> : <Play className="w-8 h-8" fill="currentColor" />}
              </button>
              
              <button 
                onClick={handleNextSlide} 
                className="p-5 bg-slate-800 hover:bg-slate-700 rounded-2xl active:scale-95 transition-transform"
              >
                <SkipForward className="w-8 h-8 text-white" />
              </button>
            </div>
            
            <div className="text-center pt-2">
               <span className="text-xs font-bold text-slate-500 tracking-widest uppercase">
                 Slide {currentSlideIndex + 1} of {activeSlides.length || 1}
               </span>
            </div>
          </div>
        )}

        {mode === 'raffle' && (
          <div className="space-y-4 text-center">
             <Trophy className="w-12 h-12 text-amber-500 mx-auto opacity-50 mb-2" />
             <h2 className="text-lg font-black tracking-widest text-white uppercase">Monster Raffle</h2>
             <p className="text-slate-400 text-sm mb-4">Draw {raffleSettings.drawnNumbers.length} / {raffleSettings.drawCount}</p>
             
             <button
               onClick={handleDrawMonster}
               className="w-full py-6 font-black text-xl tracking-widest uppercase bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl shadow-[0_10px_30px_rgba(245,158,11,0.3)] active:scale-95 transition-transform"
             >
               Draw Number
             </button>
             
             <button
               onClick={() => updateGlobalState({ raffleSettings: { ...raffleSettings, drawnNumbers: [] } })}
               className="w-full py-4 mt-2 font-bold text-xs tracking-widest uppercase text-slate-500 hover:text-red-400 transition-colors"
             >
               Reset Draws
             </button>
          </div>
        )}

        {mode === 'losers' && (
          <div className="space-y-4 text-center">
             <Monitor className="w-12 h-12 text-purple-500 mx-auto opacity-50 mb-2" />
             <h2 className="text-lg font-black tracking-widest text-white uppercase">Losers Draw</h2>
             <p className="text-slate-400 text-sm mb-4">Draw {loserSettings.drawnNumbers.length} / {loserSettings.drawCount}</p>
             
             <button
               onClick={handleDrawLoser}
               className="w-full py-6 font-black text-xl tracking-widest uppercase bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-2xl shadow-[0_10px_30px_rgba(168,85,247,0.3)] active:scale-95 transition-transform"
             >
               Draw Second Chance
             </button>

             <button
               onClick={() => updateGlobalState({ loserSettings: { ...loserSettings, drawnNumbers: [] } })}
               className="w-full py-4 mt-2 font-bold text-xs tracking-widest uppercase text-slate-500 hover:text-red-400 transition-colors"
             >
               Reset Draws
             </button>
          </div>
        )}

        {['fireplace', 'ace', 'quiz', 'weather'].includes(mode) && (
          <div className="py-8 text-center text-slate-500 font-bold uppercase tracking-widest text-sm">
            {mode} mode active
            <p className="text-xs mt-2 font-normal opacity-50">Content covers entire screen</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default RemoteControl;

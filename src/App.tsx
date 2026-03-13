import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Settings, Play, Pause, SkipForward, SkipBack, Monitor, Flame, Trophy, HelpCircle, LayoutList, Cloud } from 'lucide-react';
import { SlideData, SLIDE_DURATION_MS, STORAGE_KEY, AppMode, RaffleSettings, RAFFLE_KEY } from './types';
import { INITIAL_SLIDES } from './constants';
import Slide from './components/Slide';
import AdminPanel from './components/AdminPanel';
import MonsterRaffle from './components/MonsterRaffle';
import LosersDraw from './components/LosersDraw';
import Fireplace from './components/Fireplace';
import AceChase from './components/AceChase';
import Weather from './components/Weather';

const INITIAL_RAFFLE: RaffleSettings = {
  rangeStart: 1,
  rangeEnd: 200,
  drawCount: 10,
  drawnNumbers: [],
  winnerExclusions: [],
  monsterRaffleStartDay: 'Thursday',
  monsterRaffleStartTime: '19:00'
};

const App: React.FC = () => {
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // New States
  const [mode, setMode] = useState<AppMode>('slides');
  const [raffleSettings, setRaffleSettings] = useState<RaffleSettings>(INITIAL_RAFFLE);

  // Initialize from LocalStorage
  useEffect(() => {
    // Slides
    const savedSlides = localStorage.getItem(STORAGE_KEY);
    if (savedSlides) {
      try {
        const parsed = JSON.parse(savedSlides);
        if (Array.isArray(parsed) && parsed.length > 0) setSlides(parsed);
        else setSlides(INITIAL_SLIDES);
      } catch { setSlides(INITIAL_SLIDES); }
    } else {
      setSlides(INITIAL_SLIDES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SLIDES));
    }

    // Raffle
    const savedRaffle = localStorage.getItem(RAFFLE_KEY);
    if (savedRaffle) {
      try { setRaffleSettings(JSON.parse(savedRaffle)); } catch { setRaffleSettings(INITIAL_RAFFLE); }
    }
  }, []);

  const playlist = useMemo(() => slides.filter(s => !s.disabled), [slides]);
  const currentSlide = playlist[currentIndex] || playlist[0];
  const startTimeRef = useRef<number>(Date.now());

  const nextSlide = useCallback(() => {
    if (playlist.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % playlist.length);
    setProgress(0);
    startTimeRef.current = Date.now();
  }, [playlist.length]);

  const prevSlide = useCallback(() => {
    if (playlist.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
    setProgress(0);
    startTimeRef.current = Date.now();
  }, [playlist.length]);

  useEffect(() => {
    if (!isPlaying || isAdminOpen || mode !== 'slides') return;

    const interval = setInterval(() => {
      const duration = currentSlide?.duration || SLIDE_DURATION_MS;
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = (elapsed / duration) * 100;

      if (newProgress >= 100) nextSlide();
      else setProgress(newProgress);
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, isAdminOpen, nextSlide, currentSlide, mode]);

  const handleAdminSave = (newSlides: SlideData[]) => {
    setSlides([...newSlides]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSlides));
  };

  const handleRaffleUpdate = (updates: Partial<RaffleSettings>) => {
    const newSettings = { ...raffleSettings, ...updates };
    setRaffleSettings(newSettings);
    localStorage.setItem(RAFFLE_KEY, JSON.stringify(newSettings));
  };

  const renderMode = () => {
    switch (mode) {
      case 'raffle':
        return <MonsterRaffle settings={raffleSettings} onUpdate={handleRaffleUpdate} isAdmin={isAdminOpen} />;
      case 'losers':
        return <LosersDraw settings={raffleSettings} onUpdate={handleRaffleUpdate} isAdmin={isAdminOpen} />;
      case 'fireplace':
        return <Fireplace />;
      case 'ace':
        return <AceChase isAdmin={isAdminOpen} />;
      case 'weather':
        return <Weather />;
      case 'quiz':
        // Reuse Slide logic for buildup or custom component
        return <div className="w-full h-full flex items-center justify-center bg-black text-white text-4xl font-serif">Quiz Buildup Mode</div>;
      default:
        return currentSlide ? (
          <Slide key={currentSlide.id} data={currentSlide} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/50">No active slides</div>
        );
    }
  };

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden group">
      {/* Main Content Area */}
      <div className="w-full h-full">
        {renderMode()}
      </div>

      {/* Mode Switcher (Visible to Admin on hover in display mode, or always in Admin Panel) */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-1.5 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
          {(['slides', 'raffle', 'losers', 'fireplace', 'quiz', 'ace', 'weather'] as AppMode[]).map(m => (
            <button
                key={m}
                onClick={() => setMode(m)}
                className={`p-2.5 rounded-xl transition-all ${mode === m ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}
                title={m.charAt(0).toUpperCase() + m.slice(1)}
            >
                {m === 'slides' && <LayoutList className="w-5 h-5" />}
                {m === 'raffle' && <Trophy className="w-5 h-5" />}
                {m === 'losers' && <Monitor className="w-5 h-5" />}
                {m === 'fireplace' && <Flame className="w-5 h-5" />}
                {m === 'quiz' && <HelpCircle className="w-5 h-5" />}
                {m === 'ace' && <Trophy className="w-5 h-5 border-2 border-white/20 rounded-full" />}
                {m === 'weather' && <Cloud className="w-5 h-5" />}
            </button>
          ))}
      </div>

      {/* Progress Bar (Only for Slides) */}
      {mode === 'slides' && (
        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-black/40 z-40">
          <div 
            className="h-full bg-gradient-to-r from-amber-600 to-yellow-400 transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(217,119,6,0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* App Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 p-2 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all md:bottom-auto md:top-8 md:left-8 md:translate-x-0">
        <button onClick={prevSlide} className="p-3 hover:bg-white/10 rounded-xl text-white"><SkipBack className="w-6 h-6" /></button>
        <button 
          onClick={() => setIsPlaying(!isPlaying)} 
          className="p-4 bg-amber-600 hover:bg-amber-500 rounded-xl text-white shadow-lg"
        >
          {isPlaying ? <Pause className="w-6 h-6" fill="currentColor" /> : <Play className="w-6 h-6" fill="currentColor" />}
        </button>
        <button onClick={nextSlide} className="p-3 hover:bg-white/10 rounded-xl text-white"><SkipForward className="w-6 h-6" /></button>
      </div>

      <div className="absolute top-8 right-8 z-50 opacity-0 group-hover:opacity-100 transition-all">
        <button onClick={() => setIsAdminOpen(true)} className="p-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl text-white">
          <Settings className="w-6 h-6" />
        </button>
      </div>

      {isAdminOpen && (
        <AdminPanel 
          slides={slides} 
          raffleSettings={raffleSettings}
          onSave={handleAdminSave} 
          onRaffleUpdate={handleRaffleUpdate}
          onClose={() => setIsAdminOpen(false)} 
        />
      )}
    </div>
  );
};

export default App;

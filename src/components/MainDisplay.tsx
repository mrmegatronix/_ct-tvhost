import React, { useEffect, useRef, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobalState } from '../context/GlobalStateContext';
import { updateGlobalState } from '../socket';
import { SLIDE_DURATION_MS, SlideData } from '../types';
import { DEFAULT_STATE } from '../context/GlobalStateContext';

import Slide from './Slide';
import MonsterRaffle from './MonsterRaffle';
import LosersDraw from './LosersDraw';
import Fireplace from './Fireplace';
import AceChase from './AceChase';
import Weather from './Weather';
import QuizBuildup from './QuizBuildup';

interface Props {
  isMaster?: boolean;
}

const MainDisplay: React.FC<Props> = ({ isMaster = false }) => {
  const context = useGlobalState();
  const [progress, setProgress] = useState(0);
  const startTimeRef = useRef<number>(Date.now());
  
  // Local state to hide controls unless moused over
  const [mouseActive, setMouseActive] = useState(false);
  const mouseTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleMouseMove = () => {
      setMouseActive(true);
      if (mouseTimer.current) clearTimeout(mouseTimer.current);
      mouseTimer.current = setTimeout(() => setMouseActive(false), 3000);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Defensive check for context and state
  const state = context?.state || null;
  const isConnected = context?.isConnected || false;

  const { mode, slides, currentSlideIndex, isPlaying, raffleSettings, loserSettings } = state || DEFAULT_STATE;

  const playlist = useMemo(() => slides.filter((s: SlideData) => !s.disabled), [slides]);
  const currentSlide = playlist[currentSlideIndex] || playlist[0];

  const [isLocked, setIsLocked] = useState(false);
  const [customDuration, setCustomDuration] = useState<number | null>(null);
  const [hudMessage, setHudMessage] = useState<string | null>(null);
  const hudTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showHud = (text: string) => {
    setHudMessage(text);
    if (hudTimeoutRef.current) clearTimeout(hudTimeoutRef.current);
    hudTimeoutRef.current = setTimeout(() => setHudMessage(null), 1600);
  };

  // Auto-advance logic ONLY for the master display
  useEffect(() => {
    if (!isMaster || !isPlaying || mode !== 'slides' || playlist.length === 0 || isLocked) return;

    const interval = setInterval(() => {
      const duration = customDuration || currentSlide?.duration || SLIDE_DURATION_MS;
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = (elapsed / duration) * 100;

      if (newProgress >= 100) {
        updateGlobalState({ 
          currentSlideIndex: (currentSlideIndex + 1) % playlist.length 
        });
        setProgress(0);
        startTimeRef.current = Date.now();
      } else {
        setProgress(newProgress);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isMaster, isPlaying, mode, currentSlideIndex, playlist, currentSlide, isLocked, customDuration]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || (document.activeElement as HTMLElement)?.isContentEditable) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (playlist.length > 0) {
          updateGlobalState({ currentSlideIndex: (currentSlideIndex - 1 + playlist.length) % playlist.length });
          showHud('Prev Slide');
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (playlist.length > 0) {
          updateGlobalState({ currentSlideIndex: (currentSlideIndex + 1) % playlist.length });
          showHud('Next Slide');
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        updateGlobalState({ currentSlideIndex: 0 });
        showHud('Restart Module');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ type: 'SKIP_MODULE' }, '*');
        }
        showHud('Next Module');
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        updateGlobalState({ isPlaying: !isPlaying });
        showHud(!isPlaying ? 'Playing' : 'Paused');
      } else if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        window.open('/#/admin', '_blank');
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        window.open('/#/remote', '_blank');
      } else if (e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const secs = parseInt(e.key, 10) * 10;
        setCustomDuration(secs * 1000);
        setProgress(0);
        startTimeRef.current = Date.now();
        showHud(`Speed: ${secs}s`);
      } else if (e.key === '0') {
        e.preventDefault();
        setIsLocked(prev => {
          const next = !prev;
          showHud(next ? 'Slide Locked' : 'Slide Unlocked');
          return next;
        });
      }
    };

    const handleMessage = (e: MessageEvent) => {
      if (!e.data) return;
      if (e.data.type === 'SKIP_MODULE') {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ type: 'SKIP_MODULE' }, '*');
        }
      } else if (e.data.type === 'GOTO_FIRST') {
        updateGlobalState({ currentSlideIndex: 0 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('message', handleMessage);
    };
  }, [playlist.length, currentSlideIndex, isPlaying]);

  // Reset timer on slide change
  useEffect(() => {
    startTimeRef.current = Date.now();
    setProgress(0);
  }, [currentSlideIndex, mode]);

  const renderMode = () => {
    switch (mode) {
      case 'raffle':
        return <MonsterRaffle settings={raffleSettings} isAdmin={false} />;
      case 'losers':
        return <LosersDraw />;
      case 'fireplace':
        return <Fireplace />;
      case 'ace':
        return <AceChase isAdmin={false} />;
      case 'weather':
        return <Weather />;
      case 'quiz':
        return <QuizBuildup />;
      default:
        return currentSlide ? (
          <Slide key={currentSlide.id} data={currentSlide} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/50 bg-black font-serif text-2xl">
            No active slides. Please add some via the Admin Panel.
          </div>
        );
    }
  };

  return (
    <div className={`relative w-screen h-screen bg-black overflow-hidden ${mouseActive ? 'cursor-default' : 'cursor-none'}`}>
      
      {/* Epic Framer Motion Transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={mode === 'slides' ? currentSlide?.id : mode}
          initial={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="w-full h-full absolute inset-0"
        >
          {renderMode()}
        </motion.div>
      </AnimatePresence>

      {/* Connection Status Indicator */}
      {!isConnected && (
        <div className="absolute top-4 right-4 z-50 px-3 py-1 bg-red-900/80 text-red-100 text-xs font-bold rounded-full border border-red-500/50 animate-pulse backdrop-blur-sm">
          LOCAL MODE
        </div>
      )}

      {/* Progress Bar (Only for Slides) */}
      {mode === 'slides' && (
        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-black/40 z-40">
          <div 
            className="h-full bg-gradient-to-r from-amber-600 to-yellow-400 transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(217,119,6,0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {hudMessage && (
        <div className="fixed bottom-6 right-6 z-[99999] bg-black/85 text-white border border-white/25 px-4 py-2 rounded-xl text-sm font-semibold shadow-2xl tracking-wide pointer-events-none transition-opacity duration-200">
          {hudMessage}
        </div>
      )}
    </div>
  );
};

export default MainDisplay;

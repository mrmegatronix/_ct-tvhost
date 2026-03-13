import React, { useEffect, useRef, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobalState } from '../context/GlobalStateContext';
import { updateGlobalState } from '../socket';
import { SLIDE_DURATION_MS } from '../types';

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

  if (!context?.state) {
    return (
      <div className="flex w-screen h-screen items-center justify-center bg-black text-amber-500 font-serif text-2xl animate-pulse">
        Connecting to Server...
      </div>
    );
  }

  const { mode, slides, currentSlideIndex, isPlaying, raffleSettings, loserSettings } = context.state;

  const playlist = useMemo(() => slides.filter(s => !s.disabled), [slides]);
  const currentSlide = playlist[currentSlideIndex] || playlist[0];

  // Auto-advance logic ONLY for the master display
  useEffect(() => {
    if (!isMaster || !isPlaying || mode !== 'slides' || playlist.length === 0) return;

    const interval = setInterval(() => {
      const duration = currentSlide?.duration || SLIDE_DURATION_MS;
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
  }, [isMaster, isPlaying, mode, currentSlideIndex, playlist, currentSlide]);

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

      {/* Progress Bar (Only for Slides) */}
      {mode === 'slides' && (
        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-black/40 z-40">
          <div 
            className="h-full bg-gradient-to-r from-amber-600 to-yellow-400 transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(217,119,6,0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default MainDisplay;

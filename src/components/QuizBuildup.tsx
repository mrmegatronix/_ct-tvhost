import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, AlertTriangle, Trophy, PhoneOff, Clock, Users } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const quizSlides = [
  {
    id: 'intro',
    label: "QUIZ NIGHT",
    component: () => (
      <div className="flex flex-col items-center justify-center text-center space-y-8 animate-float">
        <HelpCircle className="w-32 h-32 text-amber-500 drop-shadow-[0_0_30px_rgba(245,158,11,0.5)]" />
        <h1 className="text-8xl font-black uppercase tracking-tighter text-white drop-shadow-2xl">
          Quiz Night <span className="text-amber-500 text-glow">Starting Soon</span>
        </h1>
        <p className="text-3xl font-serif text-slate-300 max-w-4xl italic">
          Grab a drink, take your seats, and prepare your minds.
        </p>
      </div>
    ),
    duration: 15000,
  },
  {
    id: 'raffle',
    label: "MONSTER RAFFLE",
    component: () => (
      <div className="flex flex-col items-center justify-center text-center space-y-8">
        <Trophy className="w-40 h-40 text-red-500 drop-shadow-[0_0_50px_rgba(239,68,68,0.6)] animate-pulse" />
        <h1 className="text-7xl font-black uppercase tracking-widest text-white drop-shadow-2xl">
          Don't forget the <span className="text-red-500 text-glow inline-block scale-110 rotate-2 mx-4">Monster Meat Raffle</span>
        </h1>
        <div className="bg-red-600/20 border border-red-500/30 rounded-full px-12 py-6 backdrop-blur-md mt-8">
            <p className="text-4xl font-bold text-white uppercase tracking-widest">
                Drawn right before the quiz starts!
            </p>
        </div>
      </div>
    ),
    duration: 15000,
  },
  {
    id: 'booking',
    label: "BOOK FOR NEXT WEEK",
    component: () => (
      <div className="flex flex-row items-center justify-center gap-16 max-w-6xl w-full">
        <div className="flex-1 space-y-10">
            <h1 className="text-6xl font-black uppercase tracking-tighter text-amber-500 drop-shadow-lg leading-tight">
                Secure your table for next week
            </h1>
            <div className="space-y-6">
                <div className="flex items-center gap-6 text-3xl font-bold text-slate-300 bg-white/5 p-6 rounded-2xl border border-white/10">
                    <Clock className="w-10 h-10 text-indigo-400" />
                    <span>6:30 PM Arrival for 7:00 PM Start</span>
                </div>
                <div className="flex items-center gap-6 text-3xl font-bold text-slate-300 bg-white/5 p-6 rounded-2xl border border-white/10">
                    <Trophy className="w-10 h-10 text-green-400" />
                    <span>$190 Weekly Prize Pool</span>
                </div>
                <div className="flex items-center gap-6 text-3xl font-bold text-slate-300 bg-white/5 p-6 rounded-2xl border border-white/10">
                    <Users className="w-10 h-10 text-blue-400" />
                    <span>Free Entry &bull; Maximum 8 per team</span>
                </div>
            </div>
        </div>
        
        <div className="shrink-0 flex flex-col items-center justify-center bg-white p-6 rounded-[3rem] shadow-[0_0_100px_rgba(255,255,255,0.2)]">
            <QRCodeSVG 
               value="https://nowbookit.com/bookings" 
               size={350} 
               level="H" 
               includeMargin={false} 
               fgColor="#000000" 
               bgColor="#ffffff" 
            />
            <p className="text-black font-black uppercase tracking-widest mt-6 text-xl">Scan to Book</p>
        </div>
      </div>
    ),
    duration: 20000,
  },
  {
    id: 'rules',
    label: "HOUSE RULES",
    component: () => (
      <div className="flex flex-col items-center justify-center text-center space-y-12">
        <div className="flex items-center gap-8 text-amber-500 bg-amber-500/10 px-12 py-6 rounded-full border border-amber-500/20 backdrop-blur-md">
           <AlertTriangle className="w-16 h-16 animate-pulse" />
           <span className="text-5xl font-black uppercase tracking-[0.2em]">House Rules</span>
           <AlertTriangle className="w-16 h-16 animate-pulse" />
        </div>
        
        <div className="flex flex-col items-center justify-center mt-12 gap-8">
            <PhoneOff className="w-48 h-48 text-red-500 drop-shadow-[0_0_40px_rgba(239,68,68,0.4)]" strokeWidth={1} />
            <h1 className="text-7xl font-black uppercase tracking-tighter text-white max-w-5xl leading-tight">
                Strictly <span className="text-red-500 underline decoration-red-500/50 underline-offset-[16px]">NO CELLPHONES</span> allowed during the quiz.
            </h1>
            <p className="text-4xl text-slate-400 font-serif italic mt-4 max-w-4xl">
                Teams will be immediately disqualified if caught cheating.
            </p>
        </div>
      </div>
    ),
    duration: 15000,
  }
];

const QuizBuildup: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const currentSlide = quizSlides[index];
    const timer = setTimeout(() => {
      setIndex((prev) => (prev + 1) % quizSlides.length);
    }, currentSlide.duration);

    return () => clearTimeout(timer);
  }, [index]);

  const CurrentSlideComponent = quizSlides[index].component;

  return (
    <div className="relative w-full h-full bg-[#030712] overflow-hidden flex items-center justify-center select-none">
       {/* Background */}
       <div className="absolute inset-0 z-0">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,transparent_70%)] opacity-50" />
         <div className="absolute w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDIiLz4KPHBhdGggZD0iTTAgMGg4djhIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgMGgxdjFIMHptNyA3aDF2MUg3eiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjA1Ii8+Cjwvc3ZnPg==')] opacity-30 mix-blend-overlay" />
       </div>

       {/* Content Container */}
       <div className="relative z-10 w-full max-w-[90%] h-[80%] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={quizSlides[index].id}
              initial={{ opacity: 0, scale: 0.9, y: 50, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.1, y: -50, filter: 'blur(10px)' }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="w-full flex justify-center"
            >
              <CurrentSlideComponent />
            </motion.div>
          </AnimatePresence>
       </div>
       
       {/* Rotating Progress Bar */}
       <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-4 z-20">
          {quizSlides.map((slide, i) => (
             <div key={slide.id} className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden relative">
                 {i === index && (
                     <motion.div 
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: slide.duration / 1000, ease: 'linear' }}
                        className="absolute inset-0 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                     />
                 )}
                 {i < index && <div className="absolute inset-0 bg-amber-500 rounded-full opacity-50" />}
             </div>
          ))}
       </div>
    </div>
  );
};

export default QuizBuildup;

import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, Clock, Info, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
    isAdmin?: boolean;
}

const AceChase: React.FC<Props> = () => {
    const [jackpot, setJackpot] = useState<number>(0);
    const [isCountdownActive, setIsCountdownActive] = useState(false);
    const [countdownTime, setCountdownTime] = useState("00:00:00");
    const [nextDrawLabel, setNextDrawLabel] = useState("LOADING...");
    const [nextDrawTimer, setNextDrawTimer] = useState("00d 00:00:00");
    const [currentSlide, setCurrentSlide] = useState(0);

    const googleSheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTWKQ868KUAuJv03Z4ULML1XtCTp7aJ8066j17W5pAYpT9yTj0foQt-PMa3aJCViFC6pzKX3jZU8pnk/pub?output=csv";

    // Ported Jackpot Logic
    const updateJackpot = useCallback(async () => {
        try {
            const response = await fetch(googleSheetUrl + '&t=' + Date.now());
            const text = await response.text();
            const amount = parseFloat(text.replace(/[^0-9.]/g, ''));
            if (!isNaN(amount)) {
                setJackpot(amount);
            }
        } catch (e) {
            console.error("Error fetching jackpot:", e);
            // Fallback to local storage or default
            const stored = localStorage.getItem('cta_jackpot');
            if (stored) setJackpot(parseFloat(stored));
            else setJackpot(500);
        }
    }, []);

    // Ported Countdown Logic (NZ Time)
    const updateCountdowns = useCallback(() => {
        const now = new Date();
        const nzTimeStr = now.toLocaleString("en-US", { timeZone: "Pacific/Auckland" });
        const nzDate = new Date(nzTimeStr);
        
        const day = nzDate.getDay();
        const hours = nzDate.getHours();
        const minutes = nzDate.getMinutes();
        const seconds = nzDate.getSeconds();
        
        // Active Draw Countdown
        let target: Date | null = null;
        if (day === 2 && (hours >= 16 && (hours < 17 || (hours === 17 && minutes < 30)))) {
            target = new Date(nzDate);
            target.setHours(17, 30, 0, 0);
        } else if (day === 6 && (hours >= 16 && (hours < 18 || (hours === 18 && minutes < 30)))) {
            target = new Date(nzDate);
            target.setHours(18, 30, 0, 0);
        }

        if (target) {
            setIsCountdownActive(true);
            const diff = target.getTime() - nzDate.getTime();
            const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);
            setCountdownTime(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
        } else {
            setIsCountdownActive(false);
        }

        // Next Global Draw Timer
        const getNextOccurrence = (dayIdx: number, h: number, m: number) => {
            let t = new Date(nzDate);
            t.setHours(h, m, 0, 0);
            if (nzDate.getDay() === dayIdx && nzDate.getTime() >= t.getTime()) {
                t.setDate(t.getDate() + 7);
            } else {
                let dUntil = (dayIdx + 7 - nzDate.getDay()) % 7;
                t.setDate(t.getDate() + dUntil);
            }
            return t;
        };

        const nextTue = getNextOccurrence(2, 17, 30);
        const nextSat = getNextOccurrence(6, 18, 30);
        
        let globalTarget: Date;
        if (nextTue < nextSat) {
            globalTarget = nextTue;
            setNextDrawLabel("TUESDAY DRAW");
        } else {
            globalTarget = nextSat;
            setNextDrawLabel("SATURDAY DRAW");
        }

        const gDiff = globalTarget.getTime() - nzDate.getTime();
        const d = Math.floor(gDiff / (1000 * 60 * 60 * 24));
        const gh = Math.floor((gDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const gm = Math.floor((gDiff % (1000 * 60 * 60)) / (1000 * 60));
        const gs = Math.floor((gDiff % (1000 * 60)) / 1000);
        setNextDrawTimer(`${d}d ${gh.toString().padStart(2, '0')}:${gm.toString().padStart(2, '0')}:${gs.toString().padStart(2, '0')}`);
    }, []);

    useEffect(() => {
        updateJackpot();
        const jInt = setInterval(updateJackpot, 60000);
        const cInt = setInterval(updateCountdowns, 1000);
        const sInt = setInterval(() => setCurrentSlide(prev => (prev + 1) % 6), 15000);
        
        return () => {
            clearInterval(jInt);
            clearInterval(cInt);
            clearInterval(sInt);
        };
    }, [updateJackpot, updateCountdowns]);

    // Slides Content (Simplified Port)
    const renderSlide = () => {
        // Skip irrelevant slides based on state
        const slideIndex = currentSlide;
        
        switch(slideIndex) {
            case 0: // Main
                return (
                    <div className="flex flex-col items-center gap-8 animate-fade-in">
                        <Trophy className="w-32 h-32 text-amber-500 animate-bounce-slow" />
                        <h1 className="text-8xl font-black tracking-tighter text-white text-glow">CHASE THE ACE</h1>
                        <p className="text-2xl font-bold text-amber-500 tracking-[0.5em] uppercase">Join us for the Draw!</p>
                    </div>
                );
            case 1: // Jackpot
                return (
                    <div className="flex flex-col items-center gap-6 animate-zoom-in">
                        <h2 className="text-4xl font-bold text-slate-400 uppercase tracking-widest">Current Jackpot</h2>
                        <div className="text-[12rem] font-black text-white text-glow leading-none">
                            {new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD' }).format(jackpot)}
                        </div>
                        <div className="px-8 py-3 bg-amber-600/20 border border-amber-500/30 rounded-full">
                            <p className="text-xl font-bold text-amber-500">Increases by $100 after every draw!</p>
                        </div>
                    </div>
                );
            case 2: // Rules Tue
                return (
                    <div className="max-w-4xl w-full bg-white/5 backdrop-blur-3xl p-12 rounded-[3rem] border border-white/10 animate-slide-up">
                        <div className="flex justify-between items-start mb-8">
                            <h2 className="text-6xl font-black text-white">TUESDAY DRAW</h2>
                            <div className="bg-amber-600 px-6 py-2 rounded-xl text-2xl font-black uppercase">5:30 PM</div>
                        </div>
                        <ul className="space-y-6">
                            <li className="flex items-center gap-6 text-3xl text-slate-200">
                                <div className="w-4 h-4 bg-amber-500 rounded-full" />
                                Purchase a beverage <span className="text-amber-500 font-black">3:00 PM - 5:30 PM</span>
                            </li>
                            <li className="flex items-center gap-6 text-3xl text-slate-200">
                                <div className="w-4 h-4 bg-amber-500 rounded-full" />
                                Receive a ticket for every drink purchased
                            </li>
                            <li className="flex items-center gap-6 text-3xl text-slate-200">
                                <div className="w-4 h-4 bg-amber-500 rounded-full" />
                                Be here for the draw to win!
                            </li>
                        </ul>
                    </div>
                );
            case 3: // Rules Sat
                return (
                    <div className="max-w-4xl w-full bg-white/5 backdrop-blur-3xl p-12 rounded-[3rem] border border-white/10 animate-slide-up">
                        <div className="flex justify-between items-start mb-8">
                            <h2 className="text-6xl font-black text-white">SATURDAY DRAW</h2>
                            <div className="bg-amber-600 px-6 py-2 rounded-xl text-2xl font-black uppercase">6:30 PM</div>
                        </div>
                        <ul className="space-y-6">
                            <li className="flex items-center gap-6 text-3xl text-slate-200">
                                <div className="w-4 h-4 bg-amber-500 rounded-full" />
                                Purchase a beverage <span className="text-amber-500 font-black">3:00 PM - 6:30 PM</span>
                            </li>
                            <li className="flex items-center gap-6 text-3xl text-slate-200">
                                <div className="w-4 h-4 bg-amber-500 rounded-full" />
                                Receive a ticket for every drink purchased
                            </li>
                            <li className="flex items-center gap-6 text-3xl text-slate-200">
                                <div className="w-4 h-4 bg-amber-500 rounded-full" />
                                Be here for the draw to win!
                            </li>
                        </ul>
                    </div>
                );
            case 4: // Countdown / Next
                return isCountdownActive ? (
                    <div className="flex flex-col items-center gap-8 animate-pulse">
                        <h2 className="text-6xl font-black text-white tracking-widest uppercase">Draw Starts In</h2>
                        <div className="text-[12rem] font-black font-mono text-amber-500 text-glow tabular-nums">
                            {countdownTime}
                        </div>
                        <div className="px-12 py-4 bg-red-600 rounded-2xl animate-bounce">
                            <p className="text-3xl font-black text-white uppercase italic">Get your tickets now!</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-8">
                        <h2 className="text-6xl font-black text-white tracking-widest uppercase">Next Draw In</h2>
                        <div className="text-[10rem] font-black font-mono text-amber-500 text-glow tabular-nums">
                            {nextDrawTimer}
                        </div>
                        <div className="px-12 py-4 bg-slate-900 border border-white/10 rounded-2xl">
                            <p className="text-4xl font-black text-slate-400 uppercase tracking-[0.2em]">{nextDrawLabel}</p>
                        </div>
                    </div>
                );
            case 5: // How to win
                return (
                    <div className="max-w-5xl w-full flex flex-col items-center gap-12 text-center">
                        <h2 className="text-7xl font-black text-white line-glow">HOW TO WIN</h2>
                        <div className="grid grid-cols-3 gap-8 w-full">
                            {[
                                { step: 1, text: "Pick a card from the cabinet", icon: <Info className="w-12 h-12" /> },
                                { step: 2, text: "Flip the ACE OF SPADES", icon: <AlertCircle className="w-12 h-12" /> },
                                { step: 3, text: "WIN THE JACKPOT!", icon: <CheckCircle2 className="w-12 h-12" /> }
                            ].map(s => (
                                <div key={s.step} className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 flex flex-col items-center gap-4">
                                    <div className="p-4 bg-amber-600 rounded-2xl text-white">{s.icon}</div>
                                    <div className="text-sm font-black text-amber-500 uppercase">Step {s.step}</div>
                                    <p className="text-xl font-bold text-white leading-tight">{s.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="relative w-full h-full bg-slate-950 flex items-center justify-center p-12 overflow-hidden">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950" />
                
                {/* Visual Spades Floating (Shimmering) */}
                {Array.from({ length: 15 }).map((_, i) => (
                    <div 
                        key={i}
                        className="absolute text-white/5 select-none pointer-events-none animate-float"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            fontSize: `${Math.random() * 10 + 2}rem`,
                            animationDelay: `${Math.random() * 10}s`,
                            animationDuration: `${Math.random() * 20 + 20}s`
                        }}
                    >
                        ♠
                    </div>
                ))}
            </div>

            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
                {renderSlide()}
            </div>

            {/* Bottom Progress Bar */}
            <div className="absolute bottom-0 left-0 w-full h-2 bg-white/5">
                <div className="h-full bg-amber-500 animate-progress" style={{ animationDuration: '15s' }} />
            </div>
        </div>
    );
};

export default AceChase;

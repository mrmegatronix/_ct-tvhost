import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Cloud, Sun, Sunrise, Sunset, Moon, Navigation, Thermometer, Wind, Droplets, Zap, ShieldAlert } from 'lucide-react';

const CHRISTCHURCH_COORDS = { lat: -43.5321, lon: 172.6362 };

const Weather: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [weatherData, setWeatherData] = useState<any>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showTotalRain, setShowTotalRain] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch Weather Logic
    const fetchData = useCallback(async () => {
        try {
            const params = new URLSearchParams({
                latitude: CHRISTCHURCH_COORDS.lat.toString(),
                longitude: CHRISTCHURCH_COORDS.lon.toString(),
                current: ['temperature_2m', 'relative_humidity_2m', 'apparent_temperature', 'is_day', 'precipitation', 'weather_code', 'wind_speed_10m', 'wind_direction_10m'].join(','),
                daily: ['weather_code', 'temperature_2m_max', 'temperature_2m_min', 'sunrise', 'sunset', 'uv_index_max', 'rain_sum'].join(','),
                hourly: ['temperature_2m', 'uv_index'].join(','),
                timezone: 'Pacific/Auckland',
                forecast_days: '8'
            });

            const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
            if (!response.ok) throw new Error("API Offline");
            const data = await response.json();
            
            // Post-process UV peak
            const uvToday = data.hourly.uv_index.slice(0, 24);
            const maxUV = Math.max(...uvToday);
            const maxUVIndex = uvToday.indexOf(maxUV);
            
            setWeatherData({
                ...data,
                uvPeak: { value: maxUV, time: data.hourly.time[maxUVIndex] }
            });
            setError(null);
        } catch (err) {
            console.error(err);
            setError("SYSTEM OFFLINE");
        }
    }, []);

    useEffect(() => {
        fetchData();
        const timers = [
            setInterval(fetchData, 600000), // 10 mins
            setInterval(() => setCurrentTime(new Date()), 1000),
            setInterval(() => setShowTotalRain(prev => !prev), 8000)
        ];
        return () => timers.forEach(clearInterval);
    }, [fetchData]);

    // Canvas Background Animation
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !weatherData) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        let particles: any[] = [];
        let stars: any[] = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        const current = weatherData.current;
        const daily = weatherData.daily;
        const isRain = (current.weather_code >= 51 && current.weather_code <= 67) || (current.weather_code >= 80 && current.weather_code <= 82);
        const isSnow = (current.weather_code >= 71 && current.weather_code <= 77) || (current.weather_code >= 85 && current.weather_code <= 86);
        const isCloudy = [2, 3, 45].includes(current.weather_code);

        // Init particles
        const count = isRain ? 800 : isSnow ? 300 : 0;
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                speed: Math.random() * 5 + 2,
                length: Math.random() * 20 + 10,
                opacity: Math.random() * 0.4 + 0.1,
                size: Math.random() * 2
            });
        }

        // Init stars
        if (!current.is_day && !isRain && !isSnow && !isCloudy) {
            for (let i = 0; i < 200; i++) {
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height * 0.8,
                    size: Math.random() * 1.5,
                    twinkle: Math.random() * 0.02
                });
            }
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 1. Draw Background Gradient
            const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            if (current.is_day) {
                if (isCloudy || isRain) {
                    grad.addColorStop(0, '#334155');
                    grad.addColorStop(1, '#475569');
                } else {
                    grad.addColorStop(0, '#0ea5e9');
                    grad.addColorStop(1, '#60a5fa');
                }
            } else {
                grad.addColorStop(0, '#020617');
                grad.addColorStop(1, '#1e1b4b');
            }
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 2. Stars
            if (stars.length > 0) {
                stars.forEach(s => {
                    ctx.globalAlpha = 0.5 + Math.sin(Date.now() * s.twinkle) * 0.5;
                    ctx.fillStyle = 'white';
                    ctx.beginPath();
                    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                    ctx.fill();
                });
                ctx.globalAlpha = 1;
            }

            // 3. Particles (Rain/Snow)
            particles.forEach(p => {
                ctx.beginPath();
                if (isRain) {
                    ctx.strokeStyle = `rgba(255, 255, 255, ${p.opacity})`;
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p.x, p.y + p.length);
                    ctx.stroke();
                    p.y += p.speed * 2;
                } else {
                    ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                    p.y += p.speed / 2;
                    p.x += Math.sin(p.y / 20) * 0.5;
                }
                if (p.y > canvas.height) p.y = -20;
            });

            animationId = requestAnimationFrame(animate);
        };

        animate();
        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
        };
    }, [weatherData]);

    if (error) return (
        <div className="w-full h-full bg-black flex flex-col items-center justify-center text-red-500 gap-4">
            <ShieldAlert className="w-24 h-24 animate-pulse" />
            <h1 className="text-4xl font-black uppercase tracking-[0.5em]">{error}</h1>
            <button onClick={() => window.location.reload()} className="px-8 py-3 border border-red-500 hover:bg-red-500 hover:text-white transition-all uppercase font-bold tracking-widest">Retry Connection</button>
        </div>
    );

    if (!weatherData) return (
        <div className="w-full h-full bg-black flex items-center justify-center">
            <div className="text-white font-serif italic text-2xl animate-pulse">Syncing Atmosphere...</div>
        </div>
    );

    const { current, daily, uvPeak } = weatherData;

    return (
        <div className="relative w-full h-full overflow-hidden text-white font-sans selection:bg-amber-500 selection:text-black">
            <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

            {/* Main UI Overlay */}
            <div className="relative z-10 w-full h-full p-12 flex flex-col justify-between">
                
                {/* Header */}
                <header className="flex justify-between items-start">
                    <div className="space-y-2">
                        <div className="flex items-center gap-6">
                            <h1 className="text-9xl font-black tracking-tighter leading-none">CHRISTCHURCH</h1>
                            <div className="w-4 h-4 rounded-full bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.6)] animate-pulse mt-4" />
                        </div>
                        <div className="w-full h-1 bg-gradient-to-r from-amber-500 via-amber-500/20 to-transparent" />
                        <p className="text-amber-500 font-black tracking-[1em] uppercase text-xl pl-2">New Zealand</p>
                    </div>

                    <div className="text-right space-y-2">
                        <div className="text-9xl font-black tabular-nums leading-none flex items-baseline justify-end gap-4">
                            {currentTime.toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit' }).replace(' ', '')}
                            <span className="text-3xl font-black text-amber-500">{currentTime.toLocaleTimeString('en-NZ', { second: '2-digit' })}</span>
                        </div>
                        <p className="text-3xl font-bold text-slate-300 uppercase tracking-widest leading-none">
                            {currentTime.toLocaleDateString('en-NZ', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>
                </header>

                {/* Main Hero Section */}
                <main className="flex-1 flex items-center justify-center gap-24">
                    <div className="w-80 h-80 drop-shadow-[0_0_100px_rgba(255,215,0,0.3)] animate-float">
                        <Sun className="w-full h-full text-amber-400" />
                    </div>
                    
                    <div className="flex flex-col gap-4">
                        <div className="flex items-start">
                            <span className="text-[14rem] font-black leading-none drop-shadow-2xl">{Math.round(current.temperature_2m)}</span>
                            <span className="text-8xl font-black text-amber-500 mt-8">°</span>
                        </div>
                        <div className="flex items-center gap-8 pl-4">
                            <div className="flex flex-col">
                                <span className="text-amber-500 text-xs font-black uppercase tracking-widest">High</span>
                                <span className="text-5xl font-black">{Math.round(daily.temperature_2m_max[0])}°</span>
                            </div>
                            <div className="w-px h-12 bg-white/20" />
                            <div className="flex flex-col">
                                <span className="text-amber-500 text-xs font-black uppercase tracking-widest opacity-60">Low</span>
                                <span className="text-5xl font-black opacity-60">{Math.round(daily.temperature_2m_min[0])}°</span>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Bottom Stats Grid */}
                <div className="grid grid-cols-6 gap-6 mb-8 pt-8 border-t border-white/10">
                    {[
                        { label: 'Sunset', value: new Date(daily.sunset[0]).toLocaleTimeString('en-NZ', { hour: 'numeric', minute: '2-digit' }), icon: Sunset, color: 'text-orange-400' },
                        { label: 'Wind', value: `${Math.round(current.wind_speed_10m)} km/h`, icon: Wind, color: 'text-blue-400' },
                        { label: showTotalRain ? 'Rain (Day)' : 'Rain (1hr)', value: `${showTotalRain ? daily.rain_sum[0] : current.precipitation}mm`, icon: Droplets, color: 'text-indigo-400' },
                        { label: 'UV Peak', value: `${uvPeak.value.toFixed(1)} @ ${new Date(uvPeak.time).toLocaleTimeString('en-NZ', { hour: 'numeric', minute: '2-digit' })}`, icon: Zap, color: 'text-yellow-400' },
                        { label: 'Moon', value: 'Waxing Crescent', icon: Moon, color: 'text-slate-400' },
                        { label: 'Sunrise', value: new Date(daily.sunrise[0]).toLocaleTimeString('en-NZ', { hour: 'numeric', minute: '2-digit' }), icon: Sunrise, color: 'text-amber-300' }
                    ].map(stat => (
                        <div key={stat.label} className="bg-white/5 backdrop-blur-3xl p-6 rounded-3xl border border-white/10 flex flex-col items-center gap-2 group hover:bg-white/10 transition-all">
                            <stat.icon className={`w-10 h-10 ${stat.color} animate-float group-hover:scale-110 transition-transform`} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{stat.label}</span>
                            <span className="text-2xl font-black">{stat.value}</span>
                        </div>
                    ))}
                </div>

                {/* Daily Bar */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-amber-500 shadow-[0_0_20px_#f59e0b] opacity-20" />
            </div>
        </div>
    );
};

export default Weather;

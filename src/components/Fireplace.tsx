import React from 'react';

const Fireplace: React.FC = () => {
  return (
    <div className="relative w-full h-full bg-black overflow-hidden flex items-center justify-center">
      {/* 
         In a real production app, we would use a local 4K video file.
         For this demonstration, we use a high-quality atmospheric embed 
         to ensure the user sees the "wow" factor immediately.
      */}
      <div className="absolute inset-0 z-0">
        <iframe 
            src="https://www.youtube.com/embed/L_LUpnjgPso?autoplay=1&mute=1&controls=0&loop=1&playlist=L_LUpnjgPso&disablekb=1&modestbranding=1" 
            title="Cozy Fireplace"
            className="w-[120%] h-[120%] -translate-x-[10%] -translate-y-[10%] pointer-events-none grayscale-[0.2] contrast-[1.2]"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
        ></iframe>
      </div>

      {/* Atmospheric Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 z-10" />
      <div className="absolute inset-0 bg-amber-900/10 z-20 mix-blend-overlay" />

      {/* Subtle Bottom Branding */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 text-center animate-fade-in">
        <div className="px-8 py-3 rounded-full bg-black/40 backdrop-blur-xl border border-white/5">
            <h2 className="text-xl md:text-3xl font-serif font-bold text-amber-500/80 tracking-widest uppercase">
                Atmosphere provided by Coasters
            </h2>
        </div>
      </div>
    </div>
  );
};

export default Fireplace;

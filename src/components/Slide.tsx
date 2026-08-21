import React from 'react';
import { SlideData } from '../types';

interface Props {
  data: SlideData;
}

const Slide: React.FC<Props> = ({ data }) => {
  const isLogoSlide = (!data.title && !data.description) || data.day === 'Welcome';

  return (
    <div className="relative w-full h-full overflow-hidden bg-black flex items-center justify-center">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        {(data.backgroundImageUrl || data.imageUrl) ? (
          <img 
            src={data.backgroundImageUrl || data.imageUrl} 
            alt={data.title}
            className={`w-full h-full object-cover transition-transform duration-[20000ms] ease-linear animate-zoom ${isLogoSlide ? 'opacity-30 blur-sm' : 'opacity-100'}`}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-900 to-black" />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 w-full max-w-7xl px-6 md:px-12 flex flex-col items-center text-center animate-fade-in">
        {isLogoSlide ? (
          <div className="flex flex-col items-center gap-8">
            {data.descriptionImageUrl && (
               <div className="relative p-8 rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 animate-float shadow-2xl">
                 <img 
                    src={data.descriptionImageUrl}
                    alt="Logo" 
                    className="h-48 md:h-64 object-contain drop-shadow-[0_0_50px_rgba(255,255,255,0.2)]"
                  />
               </div>
            )}
            {data.title && (
              <h1 className="text-5xl md:text-8xl font-serif font-black text-white text-glow">
                {data.title}
              </h1>
            )}
          </div>
        ) : (
          <div className="space-y-8 md:space-y-12">
            {/* Day/Special Tag */}
            <div className="inline-block">
              <span 
                className="px-8 py-3 md:px-12 md:py-6 rounded-2xl md:rounded-full text-2xl md:text-4xl font-black uppercase tracking-widest border-2 backdrop-blur-xl shadow-2xl animate-fade-in"
                style={{ 
                  backgroundColor: `${data.highlightColor}40`,
                  borderColor: data.highlightColor,
                  color: '#fff',
                  boxShadow: `0 0 40px ${data.highlightColor}60`
                }}
              >
                {data.day || 'Today\'s Special'}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-8xl lg:text-[10rem] font-serif font-black leading-tight text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.9)] text-glow animate-slide-in">
              {data.title}
            </h1>

            {/* Divider */}
            <div 
              className="h-1.5 md:h-3 w-48 md:w-80 mx-auto rounded-full shadow-2xl" 
              style={{ backgroundColor: data.highlightColor }}
            />

            {/* Description */}
            <p className="text-2xl md:text-5xl lg:text-6xl text-gray-100 font-bold leading-tight max-w-5xl mx-auto opacity-95 animate-fade-in [animation-delay:400ms]">
              {data.description}
            </p>

            {/* Price/Context Box */}
            {data.price && (
              <div className="mt-8 md:mt-16 inline-block animate-pop-in [animation-delay:800ms]">
                <div 
                  className="px-10 py-5 md:px-20 md:py-10 rounded-3xl backdrop-blur-2xl bg-black/50 border border-white/20 shadow-2xl"
                  style={{ boxShadow: `0 0 60px ${data.highlightColor}40` }}
                >
                  <span className="text-5xl md:text-8xl font-black text-white text-glow">
                    {data.price}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Slide;

import React, { useState } from 'react';
import { RaffleSettings } from '../types';
import { Plus, Trash2, Save, X, LayoutGrid, ArrowLeft, Image as ImageIcon, Eye, EyeOff, GripVertical, Settings } from 'lucide-react';

interface Props {
  slides: SlideData[];
  raffleSettings: RaffleSettings;
  onSave: (slides: SlideData[]) => void;
  onRaffleUpdate: (updates: Partial<RaffleSettings>) => void;
  onClose: () => void;
}

const AdminPanel: React.FC<Props> = ({ slides, raffleSettings, onRaffleUpdate, onClose, onSave }) => {
  const [localSlides, setLocalSlides] = useState<SlideData[]>(localSlides || slides);
  const [activeTab, setActiveTab] = useState<'slides' | 'raffle' | 'settings'>('slides');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleUpdateSlide = (id: string, updates: Partial<SlideData>) => {
    setLocalSlides(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    setHasUnsavedChanges(true);
  };

  const handleCreate = () => {
    const newSlide: SlideData = {
      id: Date.now().toString(),
      type: 'promo',
      day: 'New Day',
      title: 'New Special',
      description: 'Slide description...',
      price: '$??',
      highlightColor: '#f59e0b',
      disabled: false
    };
    setLocalSlides(prev => [...prev, newSlide]);
    setHasUnsavedChanges(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this slide?')) {
      setLocalSlides(prev => prev.filter(s => s.id !== id));
      setHasUnsavedChanges(true);
    }
  };

  const handleBulkSave = () => {
    onSave(localSlides);
    setHasUnsavedChanges(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 text-white overflow-hidden flex flex-col font-sans">
      {/* Header */}
      <header className="shrink-0 p-4 md:p-6 bg-slate-900/80 backdrop-blur-xl border-b border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-serif font-bold text-amber-500 flex items-center gap-2">
              <LayoutGrid className="w-6 h-6" />
              TV Host Admin
            </h1>
            <div className="flex gap-4 mt-1">
              {(['slides', 'raffle', 'settings'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-[10px] font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${activeTab === tab ? 'text-amber-500 border-amber-500' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
          <button 
            onClick={handleCreate}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2.5 rounded-xl font-bold transition-all border border-white/5"
          >
            <Plus className="w-5 h-5" /> <span className="whitespace-nowrap">Add Slide</span>
          </button>
          
          <button 
            onClick={handleBulkSave}
            disabled={!hasUnsavedChanges}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
              hasUnsavedChanges 
              ? 'bg-amber-600 hover:bg-amber-500 shadow-lg shadow-amber-600/20' 
              : 'bg-slate-800 text-slate-500 grayscale'
            }`}
          >
            <Save className="w-5 h-5" /> <span>{hasUnsavedChanges ? 'Save Changes' : 'Saved'}</span>
          </button>

          <button onClick={onClose} className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Editor Body */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 max-w-6xl mx-auto w-full">
        {activeTab === 'slides' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {localSlides.map((slide, index) => (
            <div 
              key={slide.id} 
              className={`glass-card p-6 rounded-2xl space-y-4 relative group ${slide.disabled ? 'opacity-50 grayscale' : ''}`}
            >
              {/* Card Controls */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">#{index + 1}</span>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => handleUpdateSlide(slide.id, { disabled: !slide.disabled })}
                    className={`p-2 rounded-lg transition-colors ${slide.disabled ? 'text-amber-500 bg-amber-500/10' : 'text-slate-500 hover:bg-white/5'}`}
                  >
                    {slide.disabled ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => handleDelete(slide.id)}
                    className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="p-2 text-slate-700 cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Label</label>
                  <input 
                    type="text" 
                    value={slide.day} 
                    onChange={e => handleUpdateSlide(slide.id, { day: e.target.value })}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2 text-sm focus:border-amber-500 outline-none"
                    placeholder="Monday"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Price / Info</label>
                  <input 
                    type="text" 
                    value={slide.price} 
                    onChange={e => handleUpdateSlide(slide.id, { price: e.target.value })}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2 text-sm focus:border-amber-500 outline-none font-bold text-amber-500"
                    placeholder="$20"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Main Title</label>
                <input 
                  type="text" 
                  value={slide.title} 
                  onChange={e => handleUpdateSlide(slide.id, { title: e.target.value })}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2 text-base font-bold focus:border-amber-500 outline-none"
                  placeholder="Steak Night"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Description</label>
                <textarea 
                  value={slide.description} 
                  onChange={e => handleUpdateSlide(slide.id, { description: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2 text-sm focus:border-amber-500 outline-none resize-none leading-relaxed"
                  placeholder="Details..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase text-glow">Background URL</label>
                <div className="flex items-center gap-2 bg-slate-900/50 border border-white/10 rounded-lg p-1 px-3">
                  <ImageIcon className="w-3 h-3 text-slate-500 shrink-0" />
                  <input 
                    type="text" 
                    value={slide.imageUrl || ''} 
                    onChange={e => handleUpdateSlide(slide.id, { imageUrl: e.target.value })}
                    className="w-full bg-transparent p-1 text-[10px] font-mono outline-none truncate"
                    placeholder="images/bg1.jpg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Theme</label>
                  <input 
                    type="color" 
                    value={slide.highlightColor} 
                    onChange={e => handleUpdateSlide(slide.id, { highlightColor: e.target.value })}
                    className="h-6 w-10 bg-transparent cursor-pointer rounded overflow-hidden p-0 border-0"
                  />
                </div>
                <div className="text-[10px] font-mono text-slate-600">{slide.id.slice(-6)}</div>
              </div>
            </div>
          ))}

          {/* New Slide Button */}
          <button 
            onClick={handleCreate}
            className="border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center p-8 text-slate-500 hover:text-amber-500 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6" />
            </div>
          </button>
        </div>
        ) : activeTab === 'raffle' ? (
          <div className="space-y-8 animate-fade-in">
             <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/10 space-y-6">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                    <Trophy className="text-amber-500" /> Raffle Configuration
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <label className="text-xs font-black text-amber-500 uppercase tracking-widest pl-1">Number Range</label>
                        <div className="flex items-center gap-4">
                            <input 
                                type="number" 
                                value={raffleSettings.rangeStart} 
                                onChange={e => onRaffleUpdate({ rangeStart: parseInt(e.target.value) })}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl p-4 font-black text-xl text-center focus:border-amber-500 outline-none"
                            />
                            <span className="text-slate-500 font-bold">TO</span>
                            <input 
                                type="number" 
                                value={raffleSettings.rangeEnd} 
                                onChange={e => onRaffleUpdate({ rangeEnd: parseInt(e.target.value) })}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl p-4 font-black text-xl text-center focus:border-amber-500 outline-none"
                            />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-xs font-black text-amber-500 uppercase tracking-widest pl-1">Draw Count (Per Session)</label>
                        <input 
                            type="number" 
                            value={raffleSettings.drawCount} 
                            onChange={e => onRaffleUpdate({ drawCount: parseInt(e.target.value) })}
                            className="w-full bg-slate-900/50 border border-white/10 rounded-2xl p-4 font-black text-xl focus:border-amber-500 outline-none"
                        />
                    </div>
                </div>
             </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4">
             <Settings className="w-16 h-16 opacity-20" />
             <p className="font-bold uppercase tracking-widest">General Settings - Coming Soon</p>
          </div>
        )}
      </main>

      {/* Footer Alert */}
      {hasUnsavedChanges && (
        <div className="bg-amber-600 px-4 py-2 text-center text-[10px] md:text-sm font-black uppercase tracking-[0.2em] shadow-2xl">
          Unsaved changes detected - Save before closing
        </div>
      )}
    </div>
  );
};

export default AdminPanel;

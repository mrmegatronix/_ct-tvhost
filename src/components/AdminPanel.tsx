import React, { useState, useEffect } from 'react';
import { useGlobalState } from '../context/GlobalStateContext';
import { updateGlobalState } from '../socket';
import { SlideData, ScheduleItem, AppMode } from '../types';
import { Plus, Trash2, Save, Home, Image as ImageIcon, Eye, EyeOff, LayoutGrid, Calendar, Trophy, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminPanel() {
  const context = useGlobalState();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'slides' | 'raffle' | 'schedule' | 'documents' | 'settings'>('slides');
  
  // Local state for modifications before saving
  const [localSlides, setLocalSlides] = useState<SlideData[]>([]);
  const [localSchedules, setLocalSchedules] = useState<ScheduleItem[]>([]);
  
  const [availableImages, setAvailableImages] = useState<{slides: string[], dropoff: string[]}>({ slides: [], dropoff: [] });
  const [availableDocs, setAvailableDocs] = useState<string[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<string>('');
  const [docContent, setDocContent] = useState<string>('');
  const [hasChanges, setHasChanges] = useState({ slides: false, schedules: false, documents: false });

  useEffect(() => {
    if (context?.state) {
      if (!hasChanges.slides) setLocalSlides(context.state.slides);
      if (!hasChanges.schedules) setLocalSchedules(context.state.schedules || []);
    }
  }, [context?.state]);

  useEffect(() => {
    // Fetch available images from server API
    fetch('/api/images')
      .then(res => res.json())
      .then(data => setAvailableImages(data))
      .catch(err => console.error("Failed to load images", err));

    // Fetch available documents
    fetch('/api/documents')
      .then(res => res.json())
      .then(data => {
        setAvailableDocs(data);
        if (data.length > 0) setSelectedDoc(data[0]);
      })
      .catch(err => console.error("Failed to load docs", err));
  }, []);

  useEffect(() => {
    if (selectedDoc) {
      fetch(`/api/documents/${selectedDoc}`)
        .then(res => res.text())
        .then(text => setDocContent(text));
    }
  }, [selectedDoc]);

  if (!context?.state) return <div className="p-8 text-white">Connecting to server...</div>;
  
  const { raffleSettings, loserSettings } = context.state;

  // --- Slides Logic ---
  const handleUpdateSlide = (id: string, updates: Partial<SlideData>) => {
    setLocalSlides(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    setHasChanges(prev => ({ ...prev, slides: true }));
  };
  const addSlide = () => {
    setLocalSlides([...localSlides, {
      id: Date.now().toString(), type: 'promo', day: 'New Day', title: 'New Event', description: '', highlightColor: '#f59e0b', disabled: false, duration: 30000
    }]);
    setHasChanges(prev => ({ ...prev, slides: true }));
  };

  // --- Schedule Logic ---
  const handleUpdateSchedule = (id: string, updates: Partial<ScheduleItem>) => {
    setLocalSchedules(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    setHasChanges(prev => ({ ...prev, schedules: true }));
  };
  const addSchedule = () => {
    setLocalSchedules([...localSchedules, {
      id: Date.now().toString(), mode: 'raffle', days: ['Thursday'], startTime: '17:30', endTime: '19:00', isActive: true
    }]);
    setHasChanges(prev => ({ ...prev, schedules: true }));
  };

  const saveChanges = () => {
    updateGlobalState({ slides: localSlides, schedules: localSchedules });
    setHasChanges({ slides: false, schedules: false });
  };

  const handleSyncToGitHub = async () => {
    if (confirm("Are you sure you want to push all current logic and settings to GitHub?")) {
      try {
        const response = await fetch('/api/sync', { method: 'POST' });
        const result = await response.json();
        if (result.success) {
          alert('Successfully synced to GitHub!');
        } else {
          alert('Failed to sync. Check server logs.');
        }
      } catch (err) {
        alert('Error connecting to sync endpoint.');
      }
    }
  };

  const handlePrintout = () => {
    // Generates a printable format
    const newWindow = window.open('', '_blank');
    if (!newWindow) return;
    
    // Formatting HTML string
    const html = `
      <html><head><title>Raffle Report</title>
      <style>body { font-family: sans-serif; padding: 2rem; }</style></head>
      <body>
        <h1>Draw Results & Financials</h1>
        <p>Date: ${new Date().toLocaleDateString()}</p>
        <hr/>
        <h3>Financial Summary</h3>
        <p><strong>Total Prize Pool:</strong> $${raffleSettings.prizePool}</p>
        <p><strong>EPOS Takings:</strong> $${raffleSettings.eposTakings}</p>
        <p><strong>Cash Takings:</strong> $${raffleSettings.cashTakings}</p>
        <hr/>
        <h3>Monster Raffle Winners</h3>
        <p>${raffleSettings.drawnNumbers.join(', ') || 'None drawn'}</p>
        <h3>Second Chance Winners</h3>
        <p>${loserSettings.drawnNumbers.join(', ') || 'None drawn'}</p>
        <hr/>
        <button onclick="window.print()" style="padding:10px 20px; font-size:16px;">Print Document</button>
      </body></html>
    `;
    newWindow.document.write(html);
    newWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col">
      {/* Header */}
      <header className="p-4 bg-slate-900 border-b border-white/10 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-white/10 rounded-xl" title="Back to TV">
            <Home className="w-6 h-6" />
          </button>
          <div className="flex gap-2">
            {[ {id:'slides', i:LayoutGrid}, {id:'raffle', i:Trophy}, {id:'schedule', i:Calendar}, {id:'documents', i:ImageIcon} ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg font-bold uppercase tracking-widest text-xs flex items-center gap-2 ${activeTab === tab.id ? 'bg-amber-600 text-white' : 'text-slate-500 hover:bg-slate-800'}`}
              >
                <tab.i className="w-4 h-4" /> {tab.id}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSyncToGitHub}
            className="px-4 py-2 rounded-xl font-bold flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white border border-white/5 uppercase text-xs tracking-widest"
          >
            GitHub Sync
          </button>
          <button 
            onClick={saveChanges}
            disabled={!hasChanges.slides && !hasChanges.schedules && !hasChanges.documents}
            className={`px-6 py-2 rounded-xl font-bold flex items-center gap-2 ${hasChanges.slides || hasChanges.schedules || hasChanges.documents ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20' : 'bg-slate-800 text-slate-500'}`}
          >
            <Save className="w-5 h-5" /> Save Changes
          </button>
        </div>
      </header>

      {/* Main Context */}
      <main className="flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full">
        {activeTab === 'slides' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black uppercase text-amber-500">Slide Manager</h2>
              <button onClick={addSlide} className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700">
                <Plus className="w-4 h-4" /> Add Slide
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {localSlides.map((slide, i) => (
                <div key={slide.id} className={`p-5 rounded-2xl border border-white/5 bg-slate-900/50 space-y-4 ${slide.disabled ? 'opacity-50 blur-[1px]' : ''}`}>
                   <div className="flex justify-between items-center">
                     <span className="text-xs font-black tracking-widest text-slate-500">#{i + 1}</span>
                     <div className="flex gap-2">
                       <button onClick={() => handleUpdateSlide(slide.id, { disabled: !slide.disabled })} className="p-1.5 rounded bg-slate-800">{slide.disabled ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                       <button onClick={() => setLocalSlides(localSlides.filter(s => s.id !== slide.id))} className="p-1.5 rounded bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"><Trash2 className="w-4 h-4" /></button>
                     </div>
                   </div>
                   <input className="w-full bg-slate-950 p-2 rounded text-sm font-bold border border-white/5" value={slide.title} onChange={e => handleUpdateSlide(slide.id, { title: e.target.value })} placeholder="Title" />
                   <textarea className="w-full bg-slate-950 p-2 rounded text-xs border border-white/5" rows={2} value={slide.description} onChange={e => handleUpdateSlide(slide.id, { description: e.target.value })} placeholder="Description" />
                   
                   <div className="space-y-1">
                     <label className="text-[10px] uppercase text-slate-500 tracking-widest">Background Image</label>
                     <select 
                       className="w-full bg-slate-950 p-2 rounded text-xs border border-white/5"
                       value={slide.imageUrl || ''}
                       onChange={e => handleUpdateSlide(slide.id, { imageUrl: e.target.value })}
                     >
                       <option value="">None / Custom URL</option>
                       <optgroup label="Slides Folder">
                         {availableImages.slides.map(img => <option key={img} value={img}>{img}</option>)}
                       </optgroup>
                       <optgroup label="Product Dropoff">
                         {availableImages.dropoff.map(img => <option key={img} value={img}>{img}</option>)}
                       </optgroup>
                     </select>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'raffle' && (
          <div className="space-y-8 max-w-4xl">
            <h2 className="text-2xl font-black uppercase text-amber-500 flex justify-between items-center">
               Raffle & Draw Configuration
               <button onClick={handlePrintout} className="text-sm px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center gap-2">
                 <Download className="w-4 h-4" /> Print Results
               </button>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Financials block */}
               <div className="p-6 bg-slate-900 border border-white/10 rounded-3xl space-y-4">
                  <h3 className="font-bold text-slate-400 uppercase tracking-widest text-sm mb-4">Financial Records</h3>
                  
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-black">Total Prize Pool ($)</label>
                    <input type="number" className="w-full bg-slate-950 p-3 rounded-xl mt-1 font-bold text-amber-500 outline-none" 
                           value={raffleSettings.prizePool || 0} onChange={e => updateGlobalState({ raffleSettings: { ...raffleSettings, prizePool: Number(e.target.value) }})} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-black">EPOS Takings ($)</label>
                    <input type="number" className="w-full bg-slate-950 p-3 rounded-xl mt-1 outline-none" 
                           value={raffleSettings.eposTakings || 0} onChange={e => updateGlobalState({ raffleSettings: { ...raffleSettings, eposTakings: Number(e.target.value) }})} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-black">Cash Takings ($)</label>
                    <input type="number" className="w-full bg-slate-950 p-3 rounded-xl mt-1 outline-none" 
                           value={raffleSettings.cashTakings || 0} onChange={e => updateGlobalState({ raffleSettings: { ...raffleSettings, cashTakings: Number(e.target.value) }})} />
                  </div>
               </div>

               {/* Configurations */}
               <div className="p-6 bg-slate-900 border border-white/10 rounded-3xl space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-bold text-amber-500 uppercase tracking-widest text-sm">Monster Raffle Limits</h3>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-[10px] text-slate-500">Range Start</label>
                        <input type="number" className="w-full bg-slate-950 p-2 rounded border border-white/5 outline-none" value={raffleSettings.rangeStart} onChange={e => updateGlobalState({ raffleSettings: { ...raffleSettings, rangeStart: Number(e.target.value) }})} />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] text-slate-500">Range End</label>
                        <input type="number" className="w-full bg-slate-950 p-2 rounded border border-white/5 outline-none" value={raffleSettings.rangeEnd} onChange={e => updateGlobalState({ raffleSettings: { ...raffleSettings, rangeEnd: Number(e.target.value) }})} />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] text-slate-500">Draws Amount</label>
                        <input type="number" className="w-full bg-slate-950 p-2 rounded border border-white/5 outline-none text-amber-500 font-bold" value={raffleSettings.drawCount} onChange={e => updateGlobalState({ raffleSettings: { ...raffleSettings, drawCount: Number(e.target.value) }})} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-white/10">
                    <h3 className="font-bold text-indigo-400 uppercase tracking-widest text-sm">Losers Draw Limits</h3>
                    <div className="flex-1 w-1/3">
                        <label className="text-[10px] text-slate-500">Draws Amount</label>
                        <input type="number" className="w-full bg-slate-950 p-2 rounded border border-white/5 outline-none text-indigo-400 font-bold" value={loserSettings.drawCount} onChange={e => updateGlobalState({ loserSettings: { ...loserSettings, drawCount: Number(e.target.value) }})} />
                    </div>
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-8">
               <div>
                 <h2 className="text-2xl font-black uppercase text-amber-500">Automated Scheduler</h2>
                 <p className="text-slate-500 text-sm">Configure modes/slides to take over the screen automatically</p>
               </div>
               <button onClick={addSchedule} className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700">
                 <Plus className="w-4 h-4" /> Add Rule
               </button>
            </div>

            <div className="space-y-4">
              {localSchedules.map((schedule, i) => (
                <div key={schedule.id} className="p-4 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-between gap-6">
                   <div className="flex items-center gap-4">
                     <select 
                       className="bg-slate-950 border border-white/10 p-2 rounded-xl text-sm font-bold text-amber-500 outline-none"
                       value={schedule.mode} onChange={e => handleUpdateSchedule(schedule.id, { mode: e.target.value as AppMode })}
                     >
                       <option value="slides">Slides</option>
                       <option value="raffle">Monster Raffle</option>
                       <option value="losers">Losers Draw</option>
                       <option value="quiz">Quiz Buildup</option>
                     </select>

                     <div className="flex items-center gap-2">
                       <span className="text-xs text-slate-500">From</span>
                       <input type="time" className="bg-slate-950 p-2 rounded-lg border border-white/5 text-sm" value={schedule.startTime} onChange={e => handleUpdateSchedule(schedule.id, { startTime: e.target.value })} />
                       <span className="text-xs text-slate-500">To</span>
                       <input type="time" className="bg-slate-950 p-2 rounded-lg border border-white/5 text-sm" value={schedule.endTime} onChange={e => handleUpdateSchedule(schedule.id, { endTime: e.target.value })} />
                     </div>
                   </div>

                   <button onClick={() => setLocalSchedules(localSchedules.filter(s => s.id !== schedule.id))} className="p-2 text-slate-600 hover:text-red-500">
                     <Trash2 className="w-5 h-5" />
                   </button>
                </div>
              ))}
              {localSchedules.length === 0 && <p className="text-slate-600 italic">No scheduled events active.</p>}
            </div>
          </div>
        )}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black uppercase text-amber-500">Document Manager</h2>
              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    if (confirm("This will replace all current slides with ones generated from this document. Proceed?")) {
                      fetch('/api/generate-slides', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ filename: selectedDoc })
                      })
                      .then(res => res.json())
                      .then(res => alert(`Successfully generated ${res.count} slides!`));
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-500 text-white"
                >
                  <Save className="w-4 h-4" /> Generate Slides from CSV
                </button>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-xs text-slate-500 uppercase font-black">Select File</label>
                <select 
                  className="bg-slate-950 border border-white/10 p-2 rounded-xl text-sm font-bold text-amber-500 outline-none"
                  value={selectedDoc} onChange={e => setSelectedDoc(e.target.value)}
                >
                  {availableDocs.map(doc => <option key={doc} value={doc}>{doc}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-500 uppercase font-black">Content Editor (CSV/JSON)</label>
                <textarea 
                  className="w-full h-[400px] bg-slate-950 p-4 rounded-xl border border-white/10 text-sm font-mono text-slate-300 focus:border-amber-500 outline-none"
                  value={docContent}
                  onChange={e => {
                    setDocContent(e.target.value);
                    setHasChanges(prev => ({ ...prev, documents: true }));
                  }}
                />
              </div>

              <button 
                onClick={() => {
                  fetch(`/api/documents/${selectedDoc}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: docContent })
                  })
                  .then(() => {
                    alert("Document saved!");
                    setHasChanges(prev => ({ ...prev, documents: false }));
                  });
                }}
                disabled={!hasChanges.documents}
                className={`px-6 py-2 rounded-xl font-bold ${hasChanges.documents ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-500'}`}
              >
                Save Document
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

﻿import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';

// AI Chat — Segera Hadir (dalam pengembangan)
const AIChat = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-[60] w-14 h-14 bg-primary rounded-full shadow-lg shadow-primary/30 flex items-center justify-center hover:bg-primary-hover transition-all hover:scale-110 active:scale-95"
          title="Kiro AI - Segera Hadir"
        >
          <Sparkles size={22} className="text-white" />
        </button>
      )}
      {open && (
        <div className="fixed bottom-6 right-6 z-[60] w-[360px] md:w-96 flex flex-col bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary to-orange-600">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Kiro AI</p>
                <p className="text-white/70 text-[10px]">Expert Konstruksi & RAB</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white transition-colors p-1">
              <X size={18} />
            </button>
          </div>
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Sparkles size={32} className="text-primary" />
            </div>
            <div>
              <p className="text-white font-bold text-lg">Segera Hadir!</p>
              <p className="text-text-secondary text-sm mt-2 leading-relaxed">
                Fitur AI Chat Kiro sedang dalam pengembangan dan akan segera tersedia.
                Nantikan pembaruan berikutnya!
              </p>
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 w-full">
              <p className="text-primary text-xs font-bold">🚀 Coming Soon</p>
              <p className="text-text-secondary text-xs mt-1">Tanya apa saja seputar RAB, AHSP, pondasi, dan konstruksi</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChat;

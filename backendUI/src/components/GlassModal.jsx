import React from 'react';
import { X } from 'lucide-react';

const GlassModal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
      />
      
      {/* Modal Dialog Card */}
      <div 
        className={`w-full ${maxWidth} glass-card rounded-2xl relative z-10 border border-white/10 shadow-2xl p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]`}
      >
        {/* Glow accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500" />
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-5 flex-shrink-0">
          <h3 className="text-base font-bold text-white tracking-wide uppercase">{title}</h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto pr-1 glass-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default GlassModal;

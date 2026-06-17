import React from 'react';

const GlassCard = ({ children, className = '', title, subtitle, action, hoverEffect = true }) => {
  return (
    <div className={`glass-card rounded-2xl p-5 ${hoverEffect ? 'glass-card-hover' : ''} ${className}`}>
      {/* Header if title or action is present */}
      {(title || action || subtitle) && (
        <div className="flex items-center justify-between gap-4 mb-5 pb-3 border-b border-white/5">
          <div>
            {title && <h3 className="font-bold text-white text-base tracking-wide uppercase">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default GlassCard;

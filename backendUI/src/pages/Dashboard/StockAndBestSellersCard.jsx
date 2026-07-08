import React, { useState } from 'react';
import GlassCard from '../../components/GlassCard';
import { ChevronLeft, ChevronRight, CheckCircle, TrendingUp } from 'lucide-react';

const StockAndBestSellersCard = ({ displayLowStock, displayBestSellers, resolveImageUrl, loading }) => {
  const [view, setView] = useState('alerts'); // 'alerts' or 'bestsellers'

  const handleNext = () => {
    setView('bestsellers');
  };

  const handlePrev = () => {
    setView('alerts');
  };

  return (
    <GlassCard 
      hoverEffect={false} 
      title={
        <div className="flex justify-between items-center w-full">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              {view === 'alerts' ? 'Stock Alerts' : 'Best Selling Products'}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {view === 'alerts' 
                ? 'Items/variants with critical stock levels (<= 10)' 
                : 'Top products with most quantity sold'
              }
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={handlePrev}
              disabled={view === 'alerts'}
              className={`p-1 rounded-lg border border-white/10 transition-all ${
                view === 'alerts' 
                  ? 'opacity-40 cursor-not-allowed text-slate-500 bg-white/[0.01]' 
                  : 'text-slate-300 hover:bg-white/5 hover:text-white bg-white/5'
              }`}
              title="View Stock Alerts"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={handleNext}
              disabled={view === 'bestsellers'}
              className={`p-1 rounded-lg border border-white/10 transition-all ${
                view === 'bestsellers' 
                  ? 'opacity-40 cursor-not-allowed text-slate-500 bg-white/[0.01]' 
                  : 'text-slate-300 hover:bg-white/5 hover:text-white bg-white/5'
              }`}
              title="View Best Sellers"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1 glass-scrollbar mt-3">
        {view === 'alerts' ? (
          loading ? (
            <div className="h-40 flex items-center justify-center text-slate-500 text-xs">
              Loading low-stock items...
            </div>
          ) : displayLowStock.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-slate-500 gap-1.5">
              <CheckCircle size={24} className="text-emerald-500" />
              <span className="text-xs font-semibold">All products/variants fully stocked.</span>
            </div>
          ) : (
            displayLowStock.map((prod) => (
              <div 
                key={prod.id} 
                className="flex items-center gap-3 p-2.5 rounded-xl border border-white/5 bg-white/[0.01] hover:border-white/10 transition-colors"
              >
                <img 
                  src={resolveImageUrl(prod.image)} 
                  alt={prod.name} 
                  className="w-10 h-10 rounded-lg object-cover border border-white/10 flex-shrink-0" 
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-white truncate" title={prod.name}>{prod.name}</h4>
                  <p className="text-[10px] text-slate-400 truncate">
                    Category: {prod.categoryName}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                    prod.stock === 0 
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {prod.stock} left
                  </span>
                </div>
              </div>
            ))
          )
        ) : (
          displayBestSellers.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-slate-500 gap-1.5">
              <TrendingUp size={24} className="text-purple-500" />
              <span className="text-xs font-semibold">No sales transactions yet.</span>
            </div>
          ) : (
            displayBestSellers.map((prod) => (
              <div 
                key={prod.id} 
                className="flex items-center gap-3 p-2.5 rounded-xl border border-white/5 bg-white/[0.01] hover:border-white/10 transition-colors"
              >
                <img 
                  src={resolveImageUrl(prod.image)} 
                  alt={prod.name} 
                  className="w-10 h-10 rounded-lg object-cover border border-white/10 flex-shrink-0" 
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-white truncate" title={prod.name}>{prod.name}</h4>
                  <p className="text-[10px] text-slate-400 truncate">
                    Category: {prod.categoryName}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {prod.sold} sold
                  </span>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </GlassCard>
  );
};

export default StockAndBestSellersCard;

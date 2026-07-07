import React from 'react';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import GlassCard from '../../components/GlassCard';

const ProductGridCard = ({ prod, categoriesProduct, getStatusBadge, resolveImageUrl, handleOpenView, handleOpenEdit, handleDelete, handleToggleStatus }) => {
  return (
    <GlassCard hoverEffect={true} className={`flex flex-col justify-between h-full group transition-all duration-300 ${prod.status === 'Draft' ? 'opacity-50 grayscale hover:opacity-100 hover:grayscale-0' : ''}`}>
      <div>
        <div className="relative aspect-video rounded-xl overflow-hidden mb-4 border border-white/5 bg-slate-900">
          <img
            src={resolveImageUrl(prod.image)}
            alt={prod.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-3 right-3">
            {getStatusBadge(prod.status)}
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider font-mono">
            {categoriesProduct.find(c => c.id === prod.categoryId)?.name || 'Uncategorized'}
          </span>
          <h3 className="font-bold text-white text-base truncate" title={prod.name}>
            {prod.name}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2 min-h-[32px]">
            {prod.description}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-white">${prod.salePrice.toFixed(2)}</span>
            {prod.salePrice < prod.price && (
              <span className="text-[10px] text-slate-500 line-through">${prod.price.toFixed(2)}</span>
            )}
          </div>
          <span className="text-[10px] text-slate-400">Stock: <strong className="text-slate-200">{prod.stock}</strong> units</span>
        </div>

        <div className="flex gap-1.5">
          <button
            onClick={() => handleToggleStatus(prod)}
            className={`p-2 rounded-lg glass-btn ${prod.status === 'Active' ? 'text-emerald-400 hover:border-emerald-500/40' : 'text-slate-400 hover:border-slate-500/40'}`}
            title={prod.status === 'Active' ? "Disable product" : "Active product"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
          </button>
          <button
            onClick={() => handleOpenView(prod)}
            className="p-2 rounded-lg glass-btn text-emerald-400 hover:border-emerald-500/40"
            title="Xem chi tiết & Gallery"
          >
            <Eye size={13} />
          </button>
          <button
            onClick={() => handleOpenEdit(prod)}
            className="p-2 rounded-lg glass-btn text-blue-400 hover:border-blue-500/40"
            title="Chỉnh sửa (Edit)"
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={() => handleDelete(prod.id)}
            className="p-2 rounded-lg glass-btn text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30"
            title="Xóa sản phẩm (Delete)"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </GlassCard>
  );
};

export default ProductGridCard;

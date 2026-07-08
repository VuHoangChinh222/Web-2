import React from 'react';
import { Edit2, Trash2, Mail, Phone, MapPin, ShoppingBag } from 'lucide-react';
import GlassCard from '../../components/GlassCard';

const CustomerGridCard = ({ cust, resolveImageUrl, handleOpenEdit, handleDelete }) => {
  return (
    <GlassCard hoverEffect={true} className="flex flex-col justify-between h-full relative overflow-hidden">
      {/* Active / Inactive Tag */}
      <div className="absolute top-4 right-4">
        {cust.active ? (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Active</span>
        ) : (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-500/20 text-slate-400 border border-slate-500/30">Inactive</span>
        )}
      </div>

      {/* Profile Card Header */}
      <div>
        <div className="flex items-center gap-3.5 mb-4">
          <img src={resolveImageUrl(cust.avatar)} alt={cust.fullname} className="w-12 h-12 rounded-full object-cover border border-purple-500/20" />
          <div>
            <h3 className="font-bold text-white text-base">{cust.fullname}</h3>
            <p className="text-[10px] font-mono text-slate-500">ID: {cust.id}</p>
          </div>
        </div>

        {/* Details List */}
        <div className="space-y-2.5 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Mail size={12} className="text-purple-400 flex-shrink-0" />
            <span className="truncate">{cust.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={12} className="text-purple-400 flex-shrink-0" />
            <span>{cust.phone}</span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin size={12} className="text-purple-400 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-2 leading-relaxed" title={cust.address}>{cust.address}</span>
          </div>
        </div>
      </div>

      {/* Stats & Operations footer */}
      <div className="mt-5 pt-3.5 border-t border-white/5 flex items-center justify-between">
        {/* Spending Statistics */}
        <div className="flex gap-4">
          <div>
            <p className="text-[9px] uppercase font-bold tracking-wider text-slate-500">Orders</p>
            <p className="text-sm font-bold text-slate-200 flex items-center gap-1">
              <ShoppingBag size={11} className="text-slate-400" />
              <span>{cust.orderCount}</span>
            </p>
          </div>
          <div>
            <p className="text-[9px] uppercase font-bold tracking-wider text-slate-500">Total Spent</p>
            <p className="text-sm font-bold text-emerald-400">{new Intl.NumberFormat('vi-VN').format(cust.totalSpending)} VND</p>
          </div>
        </div>

        {/* CRUD Controls */}
        <div className="flex gap-1.5">
          <button
            onClick={() => handleOpenEdit(cust)}
            className="p-2 rounded-lg glass-btn text-blue-400 hover:border-blue-500/40"
            title="Edit Customer Info"
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={() => handleDelete(cust.id)}
            className="p-2 rounded-lg glass-btn text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30"
            title="Delete Customer"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </GlassCard>
  );
};

export default CustomerGridCard;

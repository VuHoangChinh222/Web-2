import { Edit2, Trash2, Mail, Phone, MapPin, ShoppingBag, Eye } from 'lucide-react';
import GlassCard from '../../components/GlassCard';

const CustomerGridCard = ({ cust, resolveImageUrl, handleOpenEdit, handleOpenView, handleDelete, handleManageAddresses, handleToggleStatus }) => {
  return (
    <GlassCard
      hoverEffect={true}
      className={`flex flex-col justify-between h-full relative overflow-hidden transition-all duration-300 ${!cust.active
        ? 'opacity-60 bg-rose-500/[0.01] border-rose-500/20 hover:border-rose-500/35 grayscale-[20%]'
        : ''
        }`}
    >
      {/* Active / Inactive Tag */}
      <div className="absolute top-4 right-4 z-10">
        {cust.active ? (
          <button
            onClick={() => handleToggleStatus(cust)}
            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all cursor-pointer select-none"
            title="Click to suspend customer"
          >
            Active
          </button>
        ) : (
          <button
            onClick={() => handleToggleStatus(cust)}
            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-500/20 text-slate-400 border border-slate-500/30 hover:bg-slate-500/30 transition-all cursor-pointer select-none"
            title="Click to activate customer"
          >
            Suspended
          </button>
        )}
      </div>

      {/* Profile Card Header */}
      <div>
        <div className="flex items-center gap-3.5 mb-4">
          {cust.avatar ? (
            <>
              <img
                src={resolveImageUrl(cust.avatar)}
                alt={cust.fullname}
                className="w-12 h-12 rounded-full object-cover border border-purple-500/20"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div
                className="w-12 h-12 rounded-full border border-purple-500/30 bg-purple-600/30 text-purple-200 flex items-center justify-center font-bold text-sm flex-shrink-0"
                style={{ display: 'none' }}
              >
                {cust.fullname ? cust.fullname.charAt(0).toUpperCase() : 'C'}
              </div>
            </>
          ) : (
            <div className="w-12 h-12 rounded-full border border-purple-500/30 bg-purple-600/30 text-purple-200 flex items-center justify-center font-bold text-sm flex-shrink-0">
              {cust.fullname ? cust.fullname.charAt(0).toUpperCase() : 'C'}
            </div>
          )}
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
            onClick={() => handleOpenView(cust)}
            className="p-2 rounded-lg glass-btn text-emerald-400 hover:border-emerald-500/40"
            title="View Customer Profile"
          >
            <Eye size={13} />
          </button>
          <button
            onClick={() => handleManageAddresses(cust)}
            className="p-2 rounded-lg glass-btn text-purple-400 hover:border-purple-500/40"
            title="Quản lý địa chỉ"
          >
            <MapPin size={13} />
          </button>
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

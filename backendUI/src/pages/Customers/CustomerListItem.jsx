import { Edit2, Trash2, Mail, Phone, MapPin, ShoppingBag, Eye } from 'lucide-react';

const CustomerListItem = ({ cust, resolveImageUrl, handleOpenEdit, handleOpenView, handleDelete, handleManageAddresses, handleToggleStatus }) => {
  return (
    <tr className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors group ${!cust.active
        ? 'opacity-60 bg-rose-500/[0.01] border-l-2 border-l-rose-500/40 grayscale-[20%]'
        : ''
      }`}>
      <td className="p-3 w-14">
        {cust.avatar ? (
          <>
            <img
              src={resolveImageUrl(cust.avatar)}
              alt={cust.fullname}
              className="w-10 h-10 rounded-full object-cover border border-purple-500/20"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div
              className="w-10 h-10 rounded-full border border-purple-500/30 bg-purple-600/30 text-purple-200 flex items-center justify-center font-bold text-sm flex-shrink-0"
              style={{ display: 'none' }}
            >
              {cust.fullname ? cust.fullname.charAt(0).toUpperCase() : 'C'}
            </div>
          </>
        ) : (
          <div className="w-10 h-10 rounded-full border border-purple-500/30 bg-purple-600/30 text-purple-200 flex items-center justify-center font-bold text-sm flex-shrink-0">
            {cust.fullname ? cust.fullname.charAt(0).toUpperCase() : 'C'}
          </div>
        )}
      </td>
      <td className="p-3">
        <h3 className="font-bold text-white text-sm">{cust.fullname}</h3>
        <p className="text-[10px] font-mono text-slate-500">ID: {cust.id}</p>
      </td>
      <td className="p-3 text-xs text-slate-300">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2"><Mail size={12} className="text-purple-400 flex-shrink-0" /> <span className="truncate">{cust.email}</span></div>
          <div className="flex items-center gap-2"><Phone size={12} className="text-purple-400 flex-shrink-0" /> <span>{cust.phone}</span></div>
        </div>
      </td>
      <td className="p-3 text-xs text-slate-400" title={cust.address}>
        <div className="flex items-start gap-2">
          <MapPin size={12} className="text-purple-400 flex-shrink-0 mt-0.5" />
          <span className="line-clamp-2">{cust.address}</span>
        </div>
      </td>
      <td className="p-3 text-xs">
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1"><ShoppingBag size={11} className="text-slate-400" /> {cust.orderCount} orders</span>
          <span className="font-bold text-emerald-400">{cust.totalSpending.toLocaleString()} VND</span>
        </div>
      </td>
      <td className="p-3">
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
      </td>
      <td className="p-3 text-right">
        <div className="flex justify-end gap-1.5">
          <button onClick={() => handleOpenView(cust)} className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10" title="View Details"><Eye size={14} /></button>
          <button onClick={() => handleManageAddresses(cust)} className="p-1.5 rounded-lg text-purple-400 hover:bg-purple-500/10" title="Địa chỉ"><MapPin size={14} /></button>
          <button onClick={() => handleOpenEdit(cust)} className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-500/10" title="Edit"><Edit2 size={14} /></button>
          <button onClick={() => handleDelete(cust.id)} className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10" title="Delete"><Trash2 size={14} /></button>
        </div>
      </td>
    </tr>
  );
};

export default CustomerListItem;

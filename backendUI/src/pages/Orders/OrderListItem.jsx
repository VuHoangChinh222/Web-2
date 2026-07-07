import React from 'react';
import { Eye, Edit2, Trash2 } from 'lucide-react';

const OrderListItem = ({ order, mappedCustomers, formatDate, getStatusBadge, handleOpenDetail, handleOpenEdit, handleDeleteOrder }) => {
  const cust = mappedCustomers.find(c => c.id === order.customerId);
  return (
    <tr className="hover:bg-white/[0.01] transition-colors">
      <td className="py-3.5 font-mono text-purple-400 font-bold text-sm">
        {order.id}
      </td>
      <td className="py-3.5">
        <div className="flex items-center gap-2">
          <img src={cust?.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
          <div>
            <p className="font-semibold text-white">{cust ? cust.fullname : 'Unknown'}</p>
            <p className="text-[10px] text-slate-500">{cust?.phone}</p>
          </div>
        </div>
      </td>
      <td className="py-3.5 text-slate-400">
        {formatDate(order.orderDate)}
      </td>
      <td className="py-3.5 font-bold text-white">
        ${order.totalAmount.toFixed(2)}
      </td>
      <td className="py-3.5 text-slate-400 font-medium text-[11px]">
        {order.paymentMethod}
      </td>
      <td className="py-3.5">
        {getStatusBadge(order.status)}
      </td>
      <td className="py-3.5 text-right">
        <div className="flex justify-end gap-2">
          <button
            onClick={() => handleOpenDetail(order.id)}
            className="glass-btn px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:border-purple-500/40 hover:text-purple-300"
          >
            <Eye size={12} /> View Details
          </button>
          <button
            onClick={() => handleOpenEdit(order.id)}
            className="glass-btn-primary px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:opacity-90"
          >
            <Edit2 size={12} /> Edit
          </button>
          <button
            onClick={async () => {
              if (confirm(`Are you sure you want to delete order "${order.orderCode || order.id}"?`)) {
                await handleDeleteOrder(order.id);
              }
            }}
            className="glass-btn px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30"
            title="Delete Order"
          >
            <Trash2 size={12} /> Delete
          </button>
        </div>
      </td>
    </tr>
  );
};

export default OrderListItem;

import React from 'react';
import { User, Mail, Phone, MapPin, ShoppingBag, CreditCard, ShieldAlert, CheckCircle2, MapPinned, Calendar } from 'lucide-react';
import GlassModal from '../../components/GlassModal';

const CustomerViewModal = ({ isOpen, onClose, customer, userAddresses, orders, resolveImageUrl }) => {
  if (!customer) return null;

  // Filter addresses for this customer
  const custAddresses = (userAddresses || []).filter(addr => 
    addr.customerId === customer.id || addr.customer?.id === customer.id
  );

  // Filter orders related to this customer
  const customerOrders = (orders || []).filter(o => 
    o.customerId === customer.id || 
    o.customer?.id === customer.id
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US') + ' ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return dateStr;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case '2':
      case 'Completed':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Completed</span>;
      case '0':
      case 'Processing':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">Processing</span>;
      case '1':
      case 'Shipped':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">Shipped</span>;
      case '3':
      case 'Cancelled':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">Cancelled</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-500/20 text-slate-400">{status}</span>;
    }
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title="Customer Profile Details"
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-1">
        {/* Header Section with Profile Card */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-purple-900/20 to-[#0F1224]/50 p-6 flex flex-col sm:flex-row items-center gap-5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -z-10" />
          
          {/* Avatar */}
          {customer.avatar ? (
            <img 
              src={resolveImageUrl(customer.avatar)} 
              alt={customer.fullname} 
              className="w-20 h-20 rounded-full object-cover border-2 border-purple-500/40 shadow-xl"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-purple-600/20 border-2 border-purple-500/40 flex items-center justify-center text-purple-200 font-bold text-2xl shadow-xl">
              {customer.fullname ? customer.fullname.charAt(0).toUpperCase() : 'C'}
            </div>
          )}

          {/* Core Info */}
          <div className="text-center sm:text-left space-y-1.5 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-wide">{customer.fullname}</h3>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold w-fit self-center sm:self-auto ${
                customer.active 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}>
                {customer.active ? <CheckCircle2 size={10} /> : <ShieldAlert size={10} />}
                {customer.active ? 'Active' : 'Suspended'}
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400">Customer ID: {customer.id}</p>
            <p className="text-xs text-purple-300 font-medium">Username: <span className="font-mono">{customer.username || 'N/A'}</span></p>
          </div>
        </div>

        {/* Detailed Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400">
              <ShoppingBag size={18} />
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Total Orders</p>
              <p className="text-base font-extrabold text-white">{customerOrders.length} orders</p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CreditCard size={18} />
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Total Spending</p>
              <p className="text-base font-extrabold text-emerald-400">
                {new Intl.NumberFormat('vi-VN').format(customer.totalSpending || 0)} VND
              </p>
            </div>
          </div>
        </div>

        {/* Contact Info Block */}
        <div className="space-y-2.5 p-4 rounded-xl border border-white/5 bg-white/[0.01]">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Contact Information</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Mail size={13} className="text-purple-400 shrink-0" />
              <span className="truncate">{customer.email || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={13} className="text-purple-400 shrink-0" />
              <span>{customer.phone || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Addresses list block */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <MapPinned size={13} className="text-purple-400" />
            <span>Saved Shipping Addresses ({custAddresses.length})</span>
          </h4>

          {custAddresses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 border border-dashed border-white/5 rounded-xl text-slate-500 text-xs">
              <MapPin size={18} className="mb-1 opacity-50" />
              <span>No addresses saved for this customer.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {custAddresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`p-3 rounded-lg border text-xs flex items-start justify-between gap-3 ${
                    addr.isDefault
                      ? 'border-purple-500/30 bg-purple-500/[0.02]'
                      : 'border-white/5 bg-white/[0.005]'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-white">{addr.recipientName}</span>
                      <span className="text-slate-400">({addr.recipientPhone})</span>
                      {addr.isDefault && (
                        <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          DEFAULT
                        </span>
                      )}
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      {[addr.addressLine, addr.ward, addr.district, addr.city].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Orders list block */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <ShoppingBag size={13} className="text-purple-400" />
            <span>Associated Orders ({customerOrders.length})</span>
          </h4>

          {customerOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 border border-dashed border-white/5 rounded-xl text-slate-500 text-xs">
              <ShoppingBag size={18} className="mb-1 opacity-50" />
              <span>No orders found for this customer.</span>
            </div>
          ) : (
            <div className="overflow-x-auto glass-scrollbar max-h-[250px] border border-white/5 rounded-xl bg-white/[0.005]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] uppercase tracking-wider text-slate-400 font-bold bg-white/[0.01]">
                    <th className="p-3">Order Code</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Total Amount</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {customerOrders.map(order => (
                    <tr key={order.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-3 font-semibold text-white">
                        {order.orderCode || `ORD-#${order.id}`}
                      </td>
                      <td className="p-3 text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} className="text-slate-500" />
                          {formatDate(order.createdAt || order.createdDate)}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-white">
                        {new Intl.NumberFormat('vi-VN').format(order.totalPrice || order.totalAmount || 0)} VND
                      </td>
                      <td className="p-3">
                        {getStatusBadge(order.orderStatus || order.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-4 border-t border-white/5">
          <button
            onClick={onClose}
            className="glass-btn px-5 py-2 rounded-xl text-xs font-semibold"
          >
            Close Profile
          </button>
        </div>
      </div>
    </GlassModal>
  );
};

export default CustomerViewModal;

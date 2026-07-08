import React from 'react';
import { Trash2, Calendar, ShoppingBag } from 'lucide-react';
import GlassModal from '../../components/GlassModal';

const RelatedOrdersModal = ({
  isOpen,
  onClose,
  selectedCustomer,
  orders,
  deleteOrder,
  deleteCustomer
}) => {
  // Filter orders related to this customer
  const customerOrders = (orders || []).filter(o => 
    o.customerId === selectedCustomer?.id || 
    o.customer?.id === selectedCustomer?.id
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
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
      title={`Orders dependency for customer: ${selectedCustomer?.fullname || ''}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-4">
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
          Cannot delete this customer due to existing order dependencies. Please delete the following associated orders first.
        </div>

        {/* Related Orders Table */}
        <div className="overflow-x-auto glass-scrollbar max-h-96">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 font-medium">
                <th className="py-2.5 pb-2">Order Code / ID</th>
                <th className="py-2.5 pb-2">Order Date</th>
                <th className="py-2.5 pb-2">Total Amount</th>
                <th className="py-2.5 pb-2">Status</th>
                <th className="py-2.5 pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {!selectedCustomer || customerOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-slate-500 font-semibold">
                    All associated orders have been cleared! You can now proceed to delete this customer.
                  </td>
                </tr>
              ) : (
                customerOrders.map(order => (
                  <tr key={order.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <ShoppingBag size={14} className="text-purple-400" />
                        <span className="font-semibold text-white">
                          {order.orderCode || `ORD-#${order.id}`}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} className="text-slate-500" />
                        {formatDate(order.createdAt || order.createdDate)}
                      </span>
                    </td>
                    <td className="py-3 font-semibold text-white">
                      {new Intl.NumberFormat('vi-VN').format(order.totalPrice || order.totalAmount || 0)} VND
                    </td>
                    <td className="py-3">
                      {getStatusBadge(order.orderStatus || order.status)}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={async () => {
                          if (confirm(`Are you sure you want to delete the order "${order.orderCode || order.id}"?`)) {
                            await deleteOrder(order.id);
                          }
                        }}
                        className="p-1.5 rounded glass-btn text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30"
                        title="Delete Order"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
          <button
            type="button"
            onClick={onClose}
            className="glass-btn px-4 py-2 rounded-xl text-xs font-semibold"
          >
            Close
          </button>
          {selectedCustomer && customerOrders.length === 0 && (
            <button
              type="button"
              onClick={async () => {
                if (confirm(`Are you sure you want to permanently delete customer "${selectedCustomer.fullname}"?`)) {
                  const success = await deleteCustomer(selectedCustomer.id);
                  if (success) {
                    onClose();
                  }
                }
              }}
              className="glass-btn-primary px-5 py-2 rounded-xl text-xs font-semibold"
            >
              Delete Customer
            </button>
          )}
        </div>
      </div>
    </GlassModal>
  );
};

export default RelatedOrdersModal;

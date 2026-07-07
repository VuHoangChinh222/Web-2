import React from 'react';
import { ShoppingBag, MapPin, CreditCard, Calendar, Trash2 } from 'lucide-react';
import GlassModal from '../../components/GlassModal';

const OrderDetailModal = ({
  isOpen,
  onClose,
  activeOrder,
  activeCustomer,
  activeItems,
  products,
  updateOrderStatus,
  deleteOrderDetail,
  deleteOrder,
  formatDate,
  mode = 'view'
}) => {
  const getStatusBadgeLabel = (status) => {
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
      title={activeOrder ? (mode === 'edit' ? `Edit Order: ${activeOrder.id}` : `Invoice: ${activeOrder.id}`) : 'Order Detail'}
      maxWidth="max-w-2xl"
    >
      {activeOrder && (
        <div className="space-y-6">
          {/* Split Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Contact */}
            <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01]">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2.5 flex items-center gap-1.5">
                <ShoppingBag size={10} className="text-purple-400" /> Customer Information
              </h4>
              <div className="space-y-1">
                <p className="text-xs font-bold text-white">{activeCustomer ? activeCustomer.fullname : 'Guest Customer'}</p>
                <p className="text-[11px] text-slate-400">{activeCustomer ? activeCustomer.email : 'N/A'}</p>
                <p className="text-[11px] text-slate-400">Phone: {activeCustomer ? activeCustomer.phone : 'N/A'}</p>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01]">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2.5 flex items-center gap-1.5">
                <MapPin size={10} className="text-purple-400" /> Shipping Destination
              </h4>
              <div className="space-y-1">
                <p className="text-xs font-bold text-white">{activeOrder.recipientName || 'N/A'}</p>
                <p className="text-[11px] text-slate-400">Phone: {activeOrder.recipientPhone || 'N/A'}</p>
                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  {activeOrder.shippingAddress}
                </p>
              </div>
            </div>
          </div>

          {/* Status and Payment Information */}
          <div className="flex flex-wrap gap-4 items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.01]">
            <div className="flex items-center gap-3">
              <div className="text-slate-400">
                <CreditCard size={16} />
              </div>
              <div className="text-xs">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Payment Method</p>
                <p className="font-semibold text-slate-200">{activeOrder.paymentMethod}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-slate-400">
                <Calendar size={16} />
              </div>
              <div className="text-xs">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Checkout Date</p>
                <p className="font-semibold text-slate-200">{formatDate(activeOrder.orderDate)}</p>
              </div>
            </div>

            {/* Dynamic Status Update / View Status */}
            <div className="flex items-center gap-2 border-l border-white/10 pl-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status:</span>
              {mode === 'edit' ? (
                <select
                  value={activeOrder.status}
                  onChange={(e) => updateOrderStatus(activeOrder.id, e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-md glass-input bg-[#0F1224] border border-purple-500/20 text-purple-300 font-semibold text-white"
                >
                  <option value="0" className="bg-[#0F1224] text-white">Processing</option>
                  <option value="1" className="bg-[#0F1224] text-white">Shipped</option>
                  <option value="2" className="bg-[#0F1224] text-white">Completed</option>
                  <option value="3" className="bg-[#0F1224] text-white">Cancelled</option>
                </select>
              ) : (
                getStatusBadgeLabel(activeOrder.status)
              )}
            </div>
          </div>

          {/* Items List */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Order Items</h4>
            <div className="overflow-x-auto glass-scrollbar max-h-56 pr-1">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 font-medium">
                    <th className="py-2 pb-1.5 pl-2">Product</th>
                    <th className="py-2 pb-1.5 text-center">Price</th>
                    <th className="py-2 pb-1.5 text-center">Qty</th>
                    <th className="py-2 pb-1.5 text-right">Total</th>
                    {mode === 'edit' && <th className="py-2 pb-1.5 text-right pr-2">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {activeItems.map((item) => {
                    const prod = products.find(p => p.id === item.productId);
                    const isProcessing = activeOrder.status === '0' || activeOrder.status === 'Processing';
                    const canDelete = mode === 'edit' && isProcessing;

                    const handleDeleteItem = async () => {
                      if (activeItems.length === 1) {
                        if (confirm("Deleting this item will delete the entire order because it is the only item in the order. Do you want to proceed?")) {
                          const success = await deleteOrder(activeOrder.id);
                          if (success) {
                            onClose();
                          }
                        }
                      } else {
                        if (confirm(`Are you sure you want to delete "${prod ? prod.name : 'Deleted Product'}" from this order?`)) {
                          await deleteOrderDetail(item.id);
                        }
                      }
                    };

                    return (
                      <tr key={item.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="py-2.5 pl-2 flex items-center gap-2">
                          <img
                            src={prod?.image}
                            alt=""
                            className="w-9 h-7 rounded object-cover border border-white/10 animate-fade-in"
                          />
                          <span className="font-semibold text-white truncate max-w-[180px]" title={prod ? prod.name : 'Deleted Product'}>
                            {prod ? prod.name : 'Deleted Product'}
                          </span>
                        </td>
                        <td className="py-2.5 text-center text-slate-300 font-mono">
                          ${item.price.toFixed(2)}
                        </td>
                        <td className="py-2.5 text-center text-slate-300 font-mono">
                          {item.quantity}
                        </td>
                        <td className="py-2.5 text-right font-semibold text-white font-mono">
                          ${item.total.toFixed(2)}
                        </td>
                        {mode === 'edit' && (
                          <td className="py-2.5 text-right pr-2">
                            {canDelete ? (
                              <button
                                onClick={handleDeleteItem}
                                className="p-1 rounded hover:bg-rose-500/10 text-rose-400 hover:border-rose-500/30 transition-all border border-transparent"
                                title="Delete item from order"
                              >
                                <Trash2 size={12} />
                              </button>
                            ) : (
                              <span className="text-[9px] text-slate-500">Locked</span>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Invoice Total Calculation */}
          <div className="border-t border-white/5 pt-4 flex flex-col items-end gap-2 text-xs">
            <div className="flex justify-between w-48 text-slate-400">
              <span>Subtotal:</span>
              <span>${activeOrder.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-48 text-slate-400">
              <span>Shipping:</span>
              <span>FREE</span>
            </div>
            <div className="flex justify-between w-48 text-slate-400">
              <span>Estimated Tax (8%):</span>
              <span>${(activeOrder.totalAmount * 0.08).toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-48 text-base font-bold text-white border-t border-white/5 pt-2 mt-1">
              <span>Grand Total:</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">${(activeOrder.totalAmount * 1.08).toFixed(2)}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="glass-btn-primary px-6 py-2 rounded-xl text-xs font-semibold"
            >
              Close Invoice
            </button>
          </div>
        </div>
      )}
    </GlassModal>
  );
};

export default OrderDetailModal;

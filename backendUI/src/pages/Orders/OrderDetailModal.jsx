import React from 'react';
import { ShoppingBag, MapPin, CreditCard, Calendar } from 'lucide-react';
import GlassModal from '../../components/GlassModal';

const OrderDetailModal = ({
  isOpen,
  onClose,
  activeOrder,
  activeCustomer,
  activeItems,
  products,
  updateOrderStatus,
  formatDate
}) => {
  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={activeOrder ? `Invoice: ${activeOrder.id}` : 'Order Detail'}
      maxWidth="max-w-2xl"
    >
      {activeOrder && activeCustomer && (
        <div className="space-y-6">
          {/* Split Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Contact */}
            <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01]">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2.5 flex items-center gap-1.5">
                <ShoppingBag size={10} className="text-purple-400" /> Customer Information
              </h4>
              <div className="space-y-1">
                <p className="text-xs font-bold text-white">{activeCustomer.fullname}</p>
                <p className="text-[11px] text-slate-400">{activeCustomer.email}</p>
                <p className="text-[11px] text-slate-400">Phone: {activeCustomer.phone}</p>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01]">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2.5 flex items-center gap-1.5">
                <MapPin size={10} className="text-purple-400" /> Shipping Destination
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeOrder.shippingAddress}
              </p>
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

            {/* Dynamic Status Update */}
            <div className="flex items-center gap-2 border-l border-white/10 pl-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status:</span>
              <select
                value={activeOrder.status}
                onChange={(e) => updateOrderStatus(activeOrder.id, e.target.value)}
                className="px-2.5 py-1 text-xs rounded-md glass-input bg-[#0F1224] border border-purple-500/20 text-purple-300 font-semibold"
              >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Items List */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Order Items</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 glass-scrollbar">
              {activeItems.map((item) => {
                const prod = products.find(p => p.id === item.productId);
                return (
                  <div key={item.id} className="flex items-center justify-between p-2 rounded-lg border border-white/5 bg-white/[0.01]">
                    <div className="flex items-center gap-3">
                      <img
                        src={prod?.image}
                        alt=""
                        className="w-10 h-8 rounded object-cover border border-white/10"
                      />
                      <div>
                        <p className="text-xs font-bold text-white truncate max-w-[200px]">{prod ? prod.name : 'Deleted Product'}</p>
                        <p className="text-[10px] text-slate-500 font-mono">${item.price.toFixed(2)} x {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-white">${item.total.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
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

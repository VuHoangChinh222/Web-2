import React from 'react';
import GlassModal from '../../components/GlassModal';
import { Printer } from 'lucide-react';

const InvoiceModal = ({ isOpen, onClose, order, customer, orderDetails = [], formatPrice, formatDate, resolveImageUrl }) => {
  if (!order) return null;

  // Filter details for this order
  const details = orderDetails.filter(d => {
    const dOrderId = d.orderId || d.order?.id;
    return dOrderId === order.id;
  });

  const subtotal = order.totalAmount;
  const shippingFee = order.shippingFee || 0;
  const grandTotal = subtotal + shippingFee;

  const handlePrint = () => {
    window.print();
  };

  return (
    <GlassModal isOpen={isOpen} onClose={onClose} title={`Invoice: #${order.id}`} maxWidth="max-w-2xl">
      <div className="w-full text-slate-200 text-xs space-y-6">
        
        {/* Invoice Header */}
        <div className="flex justify-between items-start border-b border-white/10 pb-4">
          <div>
            <p className="text-slate-400 mt-0.5">Order Code: <span className="font-mono text-purple-400 font-semibold">{order.orderCode}</span></p>
          </div>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <Printer size={13} /> Print Invoice
          </button>
        </div>

        {/* Customer & Shipping Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Information */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-[11px] uppercase tracking-wider text-purple-400">Customer Information</h4>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 space-y-1.5">
              <p className="font-semibold text-white">{customer ? customer.fullname : 'Unknown'}</p>
              <p className="text-slate-400">{customer ? customer.email : 'No email'}</p>
              <p className="text-slate-400">Phone: {customer ? customer.phone : 'N/A'}</p>
            </div>
          </div>

          {/* Shipping Destination */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-[11px] uppercase tracking-wider text-purple-400">Shipping Destination</h4>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 space-y-1.5">
              <p className="font-semibold text-white">{order.recipientName || (customer ? customer.fullname : 'N/A')}</p>
              <p className="text-slate-400">Phone: {order.recipientPhone || (customer ? customer.phone : 'N/A')}</p>
              <p className="text-slate-400">{order.shippingAddress || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Metadata Details */}
        <div className="grid grid-cols-3 gap-4 border-t border-b border-white/10 py-4">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Payment Method</span>
            <span className="font-semibold text-white mt-1 block">{order.paymentMethod || 'COD'}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Checkout Date</span>
            <span className="font-semibold text-white mt-1 block">{formatDate(order.orderDate)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Status</span>
            <span className="mt-1 block">
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                order.status === '2' || order.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                order.status === '0' || order.status === 'Processing' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                order.status === '1' || order.status === 'Shipped' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}>
                {order.status === '2' || order.status === 'Completed' ? 'Completed' :
                 order.status === '0' || order.status === 'Processing' ? 'Processing' :
                 order.status === '1' || order.status === 'Shipped' ? 'Shipped' : 'Cancelled'}
              </span>
            </span>
          </div>
        </div>

        {/* Order Items Table */}
        <div className="space-y-2">
          <h4 className="font-bold text-white text-[11px] uppercase tracking-wider text-purple-400">Order Items</h4>
          <div className="overflow-x-auto border border-white/5 rounded-xl bg-white/[0.01]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-[10px] uppercase tracking-wider text-slate-400">
                  <th className="p-3 font-semibold">Product</th>
                  <th className="p-3 font-semibold text-right">Price</th>
                  <th className="p-3 font-semibold text-center w-16">Qty</th>
                  <th className="p-3 font-semibold text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {details.map((item, idx) => {
                  const varName = item.productVariant 
                    ? `${item.productVariant.product?.name || 'Product'} (${item.productVariant.color === 'Mặc định' || item.productVariant.color === 'Default' ? '' : item.productVariant.color + ', '}${item.productVariant.size})`
                    : 'Unknown Product';
                  const imgUrl = item.productVariant?.product?.thumbnail || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80';
                  const priceVal = item.price ? parseFloat(item.price) : 0;
                  const itemTotal = priceVal * (item.quantity || 0);

                  return (
                    <tr key={item.id || idx}>
                      <td className="p-3 font-medium text-white max-w-[280px]">
                        <div className="flex items-center gap-3">
                          <img 
                            src={resolveImageUrl ? resolveImageUrl(imgUrl) : imgUrl} 
                            alt={varName} 
                            className="w-10 h-10 rounded-lg object-cover border border-white/10 flex-shrink-0"
                          />
                          <span className="truncate" title={varName}>{varName}</span>
                        </div>
                      </td>
                      <td className="p-3 text-right font-mono">{formatPrice(priceVal)}</td>
                      <td className="p-3 text-center">{item.quantity}</td>
                      <td className="p-3 text-right font-mono text-white">{formatPrice(itemTotal)}</td>
                    </tr>
                  );
                })}
                {details.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-4 text-center text-slate-500">No items found for this order.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pricing Subtotal Grid */}
        <div className="flex justify-end pt-2">
          <div className="w-64 space-y-2 border-t border-white/5 pt-4">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal:</span>
              <span className="font-mono text-white">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Shipping:</span>
              <span className="font-mono text-white">{shippingFee > 0 ? formatPrice(shippingFee) : 'FREE'}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-white border-t border-white/10 pt-2">
              <span>Grand Total:</span>
              <span className="font-mono text-purple-400">{formatPrice(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end border-t border-white/10 pt-4 mt-6">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Close Invoice
          </button>
        </div>

      </div>
    </GlassModal>
  );
};

export default InvoiceModal;

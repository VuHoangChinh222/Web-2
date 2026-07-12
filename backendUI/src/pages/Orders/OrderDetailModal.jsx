import React from 'react';
import { Printer, Trash2 } from 'lucide-react';
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
  resolveImageUrl,
  mode = 'view'
}) => {
  if (!activeOrder) return null;

  const formatPrice = (price) => {
    if (price === undefined || price === null) return '0 VND';
    return new Intl.NumberFormat('vi-VN').format(price) + ' VND';
  };

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

  const handlePrint = () => {
    window.print();
  };

  const subtotal = activeOrder.totalAmount;
  const shippingFee = activeOrder.shippingFee || 0;
  const grandTotal = subtotal + shippingFee;

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'edit' ? `Edit Order: #${activeOrder.id}` : `Invoice: #${activeOrder.id}`}
      maxWidth="max-w-2xl"
    >
      <div className="w-full text-slate-200 text-xs space-y-6">
        
        {/* Invoice Header */}
        <div className="flex justify-between items-start border-b border-white/10 pb-4">
          <div>
            <p className="text-slate-400 mt-0.5 font-semibold">Order Code: <span className="font-mono text-purple-400 font-bold">{activeOrder.orderCode}</span></p>
          </div>
          {mode === 'view' && (
            <button 
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <Printer size={13} /> Print Invoice
            </button>
          )}
        </div>

        {/* Customer & Shipping Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Information */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-[11px] uppercase tracking-wider text-purple-400">Customer Information</h4>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 space-y-1.5">
              <p className="font-semibold text-white">{activeCustomer ? activeCustomer.fullname : 'Unknown'}</p>
              <p className="text-slate-400">{activeCustomer ? activeCustomer.email : 'No email'}</p>
              <p className="text-slate-400">Phone: {activeCustomer ? activeCustomer.phone : 'N/A'}</p>
            </div>
          </div>

          {/* Shipping Destination */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-[11px] uppercase tracking-wider text-purple-400">Shipping Destination</h4>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 space-y-1.5">
              <p className="font-semibold text-white">{activeOrder.recipientName || (activeCustomer ? activeCustomer.fullname : 'N/A')}</p>
              <p className="text-slate-400">Phone: {activeOrder.recipientPhone || (activeCustomer ? activeCustomer.phone : 'N/A')}</p>
              <p className="text-slate-400">{activeOrder.shippingAddress || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Metadata Details */}
        <div className="grid grid-cols-3 gap-4 border-t border-b border-white/10 py-4">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Payment Method</span>
            <span className="font-semibold text-white mt-1 block">{activeOrder.paymentMethod || 'COD'}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Checkout Date</span>
            <span className="font-semibold text-white mt-1 block">{formatDate(activeOrder.orderDate)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Status</span>
            <div className="mt-1">
              {mode === 'edit' ? (
                <select
                  value={activeOrder.status}
                  onChange={(e) => updateOrderStatus(activeOrder.id, e.target.value)}
                  className="px-2 py-0.5 text-[11px] rounded-md glass-input bg-[#0F1224] border border-purple-500/20 text-purple-300 font-semibold"
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
                  {mode === 'edit' && <th className="p-3 font-semibold text-center w-16">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {activeItems.map((item, idx) => {
                  const prod = products.find(p => p.id === item.productId);
                  const varName = item.productVariant 
                    ? `${item.productVariant.product?.name || 'Product'} (${item.productVariant.color === 'Mặc định' || item.productVariant.color === 'Default' ? '' : item.productVariant.color + ', '}${item.productVariant.size})`
                    : (prod ? prod.name : 'Unknown Product');
                  const imgUrl = item.productVariant?.imageUrl || item.productVariant?.product?.thumbnail || prod?.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80';
                  
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
                      <td className="p-3 text-right font-mono">{formatPrice(item.price)}</td>
                      <td className="p-3 text-center">{item.quantity}</td>
                      <td className="p-3 text-right font-mono text-white">{formatPrice(item.total)}</td>
                      {mode === 'edit' && (
                        <td className="p-3 text-center">
                          {canDelete ? (
                            <button
                              onClick={handleDeleteItem}
                              className="p-1.5 rounded hover:bg-rose-500/10 text-rose-400 hover:border-rose-500/30 transition-all border border-transparent"
                              title="Delete item from order"
                            >
                              <Trash2 size={12} />
                            </button>
                          ) : (
                            <span className="text-[9px] text-slate-500 font-semibold">Locked</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
                {activeItems.length === 0 && (
                  <tr>
                    <td colSpan={mode === 'edit' ? 5 : 4} className="p-4 text-center text-slate-500">
                      No items found for this order.
                    </td>
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
            Close
          </button>
        </div>

      </div>
    </GlassModal>
  );
};

export default OrderDetailModal;

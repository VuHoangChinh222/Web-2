import React, { useState } from 'react';
import { Search, Eye, Edit2, Trash2 } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import GlassCard from '../../components/GlassCard';
import OrderDetailModal from './OrderDetailModal';
import orderService from '../../services/orderService';

const mapOrderFromBackend = (order) => {
  if (!order) return null;
  return {
    id: order.id,
    customerId: order.customer ? order.customer.id : order.customerId,
    orderCode: order.orderCode || `ORD-${order.id}`,
    orderDate: order.createdAt || order.orderDate,
    totalAmount: order.totalPrice ? parseFloat(order.totalPrice) : 0,
    shippingAddress: order.shippingAddress || 'Hà Nội',
    paymentMethod: order.paymentMethod || 'COD',
    paymentStatus: order.paymentStatus || 'PENDING',
    status: order.orderStatus,
    note: order.note || '',
    recipientName: order.recipientName || '',
    recipientPhone: order.recipientPhone || ''
  };
};

const mapOrderDetailFromBackend = (detail) => {
  if (!detail) return null;
  return {
    id: detail.id,
    orderId: detail.order ? detail.order.id : detail.orderId,
    productId: detail.productId || (detail.productVariant ? (detail.productVariant.product ? detail.productVariant.product.id : detail.productVariant.productId) : 1),
    price: detail.price ? parseFloat(detail.price) : 0,
    quantity: detail.quantity || 1,
    total: (detail.price ? parseFloat(detail.price) : 0) * (detail.quantity || 1)
  };
};

const mapCustomerFromBackend = (cust) => {
  if (!cust) return null;
  const active = cust.status === 1;
  return {
    id: cust.id,
    fullname: cust.fullName || cust.fullname || cust.username || cust.email || 'Unknown',
    username: cust.username || cust.email || '',
    email: cust.email,
    phone: cust.phone || '',
    address: cust.address || '',
    avatar: cust.imageUrl || cust.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    active: active,
    status: cust.status
  };
};

const mapProductFromBackend = (prod) => {
  if (!prod) return null;
  return {
    id: prod.id,
    name: prod.name,
    slug: prod.slug || '',
    description: prod.description || '',
    shortDescription: prod.shortDescription || '',
    price: prod.basePrice ? parseFloat(prod.basePrice) : 0,
    salePrice: prod.discountPrice ? parseFloat(prod.discountPrice) : (prod.basePrice ? parseFloat(prod.basePrice) : 0),
    stock: 120, // default stock count as it is variant-based on DB
    categoryId: prod.category ? prod.category.id : '',
    category: prod.category,
    image: prod.thumbnail || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80',
    status: prod.status === 1 ? 'Active' : 'Draft',
    createdAt: prod.createdAt
  };
};

const Orders = ({ selectedOrderId, setSelectedOrderId, isOpen, setIsOpen }) => {
  const {
    orders,
    setOrders,
    orderDetails,
    setOrderDetails,
    customers,
    products
  } = useAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalMode, setModalMode] = useState('view'); // 'view' or 'edit'

  const formatDate = (dateVal) => {
    if (!dateVal) return 'N/A';
    if (Array.isArray(dateVal)) {
      const [year, month, day, hour = 0, minute = 0, second = 0] = dateVal;
      return new Date(year, month - 1, day, hour, minute, second).toLocaleString();
    }
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleString();
  };

  // Map collections locally
  const mappedOrders = (orders || []).map(mapOrderFromBackend).filter(Boolean);
  const mappedOrderDetails = (orderDetails || []).map(mapOrderDetailFromBackend).filter(Boolean);
  const mappedCustomers = (customers || []).map(mapCustomerFromBackend).filter(Boolean);
  const mappedProducts = (products || []).map(mapProductFromBackend).filter(Boolean);

  // Filter orders
  const filteredOrders = mappedOrders.filter(o => {
    const cust = mappedCustomers.find(c => c.id === o.customerId);
    const customerName = cust ? cust.fullname.toLowerCase() : '';
    const matchesSearch = String(o.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.orderCode && o.orderCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      customerName.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
      o.status === statusFilter ||
      (statusFilter === '0' && o.status === 'Processing') ||
      (statusFilter === '1' && o.status === 'Shipped') ||
      (statusFilter === '2' && o.status === 'Completed') ||
      (statusFilter === '3' && o.status === 'Cancelled');
    return matchesSearch && matchesStatus;
  });

  // Open Order Detail modal in view mode
  const handleOpenDetail = (id) => {
    setSelectedOrderId(id);
    setModalMode('view');
    setIsOpen(true);
  };

  // Open Order Detail modal in edit mode
  const handleOpenEdit = (id) => {
    setSelectedOrderId(id);
    setModalMode('edit');
    setIsOpen(true);
  };

  // Local helper to update status with formatted payload
  const updateOrderStatus = async (orderId, newStatus) => {
    const orderObj = mappedOrders.find(o => o.id === orderId);
    if (!orderObj) return;
    const body = {
      customerId: orderObj.customerId,
      orderCode: orderObj.orderCode,
      recipientName: orderObj.recipientName || (mappedCustomers.find(c => c.id === orderObj.customerId)?.fullname) || 'Customer',
      recipientPhone: orderObj.recipientPhone || (mappedCustomers.find(c => c.id === orderObj.customerId)?.phone) || '',
      shippingAddress: orderObj.shippingAddress,
      totalPrice: orderObj.totalAmount,
      shippingFee: 0,
      paymentMethod: orderObj.paymentMethod,
      paymentStatus: orderObj.paymentStatus,
      orderStatus: newStatus,
      note: orderObj.note
    };
    try {
      const updated = await orderService.update(orderId, body);
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
    } catch (err) {
      alert("Lỗi khi cập nhật đơn hàng: " + err.message);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      await orderService.delete(orderId);
      setOrders(prev => prev.filter(o => o.id !== orderId));
      return true;
    } catch (err) {
      alert("Lỗi khi xóa đơn hàng: " + err.message);
      return false;
    }
  };

  // Local helper to delete detail item and update order price
  const handleDeleteOrderDetail = async (detailId) => {
    const detail = mappedOrderDetails.find(d => d.id === detailId);
    if (!detail) return;

    try {
      await orderService.deleteDetail(detailId);
      setOrderDetails(prev => prev.filter(d => d.id !== detailId));
    } catch (err) {
      alert("Lỗi khi xóa chi tiết đơn hàng: " + err.message);
      return;
    }

    const activeOrderObj = mappedOrders.find(o => o.id === selectedOrderId);
    if (!activeOrderObj) return;

    const remainingDetails = mappedOrderDetails.filter(d => d.orderId === activeOrderObj.id && d.id !== detailId);
    const newTotalAmt = remainingDetails.reduce((sum, item) => sum + item.total, 0);

    const body = {
      customerId: activeOrderObj.customerId,
      orderCode: activeOrderObj.orderCode,
      recipientName: activeOrderObj.recipientName || (mappedCustomers.find(c => c.id === activeOrderObj.customerId)?.fullname) || 'Customer',
      recipientPhone: activeOrderObj.recipientPhone || (mappedCustomers.find(c => c.id === activeOrderObj.customerId)?.phone) || '',
      shippingAddress: activeOrderObj.shippingAddress,
      totalPrice: newTotalAmt,
      shippingFee: 0,
      paymentMethod: activeOrderObj.paymentMethod,
      paymentStatus: activeOrderObj.paymentStatus,
      orderStatus: activeOrderObj.status,
      note: activeOrderObj.note
    };

    try {
      const updated = await orderService.update(activeOrderObj.id, body);
      setOrders(prev => prev.map(o => o.id === activeOrderObj.id ? updated : o));
    } catch (err) {
      alert("Lỗi khi cập nhật tổng tiền đơn hàng: " + err.message);
    }
  };

  // Status Styling Badge
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

  // Find active order details
  const activeOrder = mappedOrders.find(o => o.id === selectedOrderId);
  const activeCustomer = activeOrder ? mappedCustomers.find(c => c.id === activeOrder.customerId) : null;
  const activeItems = activeOrder ? mappedOrderDetails.filter(d => d.orderId === activeOrder.id) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-wide">Orders Registry</h2>
        <p className="text-xs text-slate-400">Total orders tracked: {mappedOrders.length} checkouts</p>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 rounded-xl border border-white/5 bg-[#0F1224]/30 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] md:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by ID or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-lg text-xs glass-input"
            />
          </div>

          {/* Status filter */}
          <div className="flex flex-wrap gap-1 border border-white/5 rounded-lg p-1 bg-white/[0.02]">
            {[
              { value: 'all', label: 'All' },
              { value: '0', label: 'Processing' },
              { value: '1', label: 'Shipped' },
              { value: '2', label: 'Completed' },
              { value: '3', label: 'Cancelled' }
            ].map(status => (
              <button
                key={status.value}
                onClick={() => setStatusFilter(status.value)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all
                  ${statusFilter === status.value
                    ? 'bg-purple-600/30 text-purple-300'
                    : 'text-slate-500 hover:text-slate-300'}`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders List Table */}
      <GlassCard hoverEffect={false}>
        <div className="overflow-x-auto glass-scrollbar -mx-5 px-5">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 font-medium">
                <th className="py-3">Order ID</th>
                <th className="py-3">Customer</th>
                <th className="py-3">Order Date</th>
                <th className="py-3">Amount</th>
                <th className="py-3">Payment</th>
                <th className="py-3">Status</th>
                <th className="py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  const cust = mappedCustomers.find(c => c.id === order.customerId);
                  return (
                    <tr key={order.id} className="hover:bg-white/[0.01] transition-colors">
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
                })
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Order Details Modal */}
      <OrderDetailModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        activeOrder={activeOrder}
        activeCustomer={activeCustomer}
        activeItems={activeItems}
        products={mappedProducts}
        updateOrderStatus={updateOrderStatus}
        deleteOrderDetail={handleDeleteOrderDetail}
        deleteOrder={handleDeleteOrder}
        formatDate={formatDate}
        mode={modalMode}
      />
    </div>
  );
};

export default Orders;

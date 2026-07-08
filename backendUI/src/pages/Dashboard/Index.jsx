import React, { useState, useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import productVariantService from '../../services/productVariantService';

// Import refactored subcomponents
import MetricCards from './MetricCards';
import RevenueChart from './RevenueChart';
import StockShareChart from './StockShareChart';
import RecentOrdersTable from './RecentOrdersTable';
import StockAndBestSellersCard from './StockAndBestSellersCard';
import InvoiceModal from './InvoiceModal';

const mapOrderFromBackend = (order) => {
  if (!order) return null;
  return {
    id: order.id,
    customerId: order.customer ? order.customer.id : order.customerId,
    orderCode: order.orderCode || `ORD-${order.id}`,
    orderDate: order.createdAt || order.orderDate,
    totalAmount: order.totalPrice ? parseFloat(order.totalPrice) : 0,
    shippingFee: order.shippingFee ? parseFloat(order.shippingFee) : 0,
    shippingAddress: order.shippingAddress || 'Hà Nội',
    paymentMethod: order.paymentMethod || 'COD',
    paymentStatus: order.paymentStatus || 'PENDING',
    status: order.orderStatus,
    note: order.note || '',
    recipientName: order.recipientName || '',
    recipientPhone: order.recipientPhone || ''
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

const formatPrice = (price) => {
  if (price === undefined || price === null) return '0 VND';
  return new Intl.NumberFormat('vi-VN').format(price) + ' VND';
};

const formatDate = (dateVal) => {
  if (!dateVal) return 'N/A';
  if (Array.isArray(dateVal)) {
    const [year, month, day, hour, minute, second] = dateVal;
    const d = new Date(year, month - 1, day, hour || 0, minute || 0, second || 0);
    return d.toLocaleString();
  }
  const d = new Date(dateVal);
  return isNaN(d.getTime()) ? 'N/A' : d.toLocaleString();
};

const parseOrderDate = (dateVal) => {
  if (!dateVal) return null;
  if (Array.isArray(dateVal)) {
    const [year, month, day] = dateVal;
    return new Date(year, month - 1, day);
  }
  const d = new Date(dateVal);
  return isNaN(d.getTime()) ? null : d;
};

// Helper for Order Status badges in RecentOrders list
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

const Dashboard = ({ setActivePage }) => {
  const { products, orders, customers, categoriesProduct, resolveImageUrl, orderDetails } = useAdmin();

  // State to hold all product variants for low-stock variant checks
  const [allVariants, setAllVariants] = useState([]);
  const [variantsLoading, setVariantsLoading] = useState(false);

  // States for Invoice Popup
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  useEffect(() => {
    const fetchAllVariants = async () => {
      try {
        setVariantsLoading(true);
        const res = await productVariantService.getAll(0, 2000);
        setAllVariants(res.content || res.Content || res || []);
      } catch (e) {
        console.error("Error fetching all variants for low stock widget:", e);
      } finally {
        setVariantsLoading(false);
      }
    };
    fetchAllVariants();
  }, []);

  // Map collections locally
  const mappedOrders = (orders || []).map(mapOrderFromBackend).filter(Boolean);
  const mappedProducts = (products || []).map(mapProductFromBackend).filter(Boolean);
  const mappedCustomers = (customers || []).map(mapCustomerFromBackend).filter(Boolean);

  // 1. Calculate general statistics
  const completedOrders = mappedOrders.filter(o => o.status === '2' || o.status === 'Completed');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const processingOrdersCount = mappedOrders.filter(o => o.status === '0' || o.status === 'Processing').length;
  const activeCustomersCount = mappedCustomers.filter(c => c.active).length;

  // 2. Prepare Low-Stock Items (including specific variants <= 10)
  const lowStockVariants = allVariants.filter(v => v.stockQuantity <= 10).map(v => {
    const sizePart = v.size ? ` - Size ${v.size}` : '';
    const colorPart = v.color && v.color !== 'Mặc định' && v.color !== 'Default' ? ` - ${v.color}` : '';
    return {
      id: `var-${v.id}`,
      name: `${v.product?.name || 'Unknown Product'}${sizePart}${colorPart}`,
      image: v.product?.thumbnail || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80',
      stock: v.stockQuantity,
      categoryName: v.product?.category?.name || 'N/A',
      isVariant: true
    };
  });

  const displayLowStock = lowStockVariants.length > 0 ? lowStockVariants : mappedProducts.filter(p => p.stock <= 10).map(p => ({
    id: `prod-${p.id}`,
    name: p.name,
    image: p.image,
    stock: p.stock,
    categoryName: categoriesProduct.find(c => c.id === p.categoryId)?.name || 'N/A',
    isVariant: false
  }));

  // 3. Prepare Best Sellers (calculated dynamically from orderDetails)
  const getBestSellers = () => {
    const salesCount = {};
    (orderDetails || []).forEach(detail => {
      const varObj = detail.productVariant;
      if (varObj && varObj.product) {
        const prodId = varObj.product.id;
        const qty = detail.quantity || 0;
        if (!salesCount[prodId]) {
          salesCount[prodId] = {
            product: varObj.product,
            qtySold: 0
          };
        }
        salesCount[prodId].qtySold += qty;
      }
    });

    const sorted = Object.values(salesCount)
      .sort((a, b) => b.qtySold - a.qtySold)
      .slice(0, 4);

    return sorted.map(item => ({
      id: `best-${item.product.id}`,
      name: item.product.name,
      image: item.product.thumbnail || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80',
      sold: item.qtySold,
      categoryName: item.product.category?.name || 'N/A'
    }));
  };

  const bestSellers = getBestSellers();
  const displayBestSellers = bestSellers.length > 0 ? bestSellers : mappedProducts.slice(0, 4).map((p, idx) => ({
    id: `mock-best-${p.id}`,
    name: p.name,
    image: p.image,
    sold: [15, 12, 8, 5][idx] || 0,
    categoryName: categoriesProduct.find(c => c.id === p.categoryId)?.name || 'N/A'
  }));

  // Handlers for Invoice
  const handleOpenInvoice = (order) => {
    setSelectedInvoiceOrder(order);
    setIsInvoiceOpen(true);
  };

  const invoiceCustomer = selectedInvoiceOrder 
    ? mappedCustomers.find(c => c.id === selectedInvoiceOrder.customerId) 
    : null;

  return (
    <div className="space-y-6">
      {/* Top Banner Message */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-purple-900/40 via-pink-900/20 to-transparent border border-purple-500/20 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Welcome back to CHINH Control Panel</h2>
          <p className="text-xs text-slate-400 mt-1">Here is a comprehensive look at your commerce store analytics and activities.</p>
        </div>
        <button
          onClick={() => setActivePage('orders')}
          className="glass-btn-primary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
        >
          Manage Sales <ArrowUpRight size={14} />
        </button>
      </div>

      {/* 4 Metric Cards Grid */}
      <MetricCards
        totalRevenue={totalRevenue}
        processingOrdersCount={processingOrdersCount}
        totalProducts={mappedProducts.length}
        lowStockCount={displayLowStock.length}
        activeCustomersCount={activeCustomersCount}
        totalCustomers={mappedCustomers.length}
        formatPrice={formatPrice}
      />

      {/* Analytics & Stock Share Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Analytics Chart with 7 Days / Month / Quarter / Year filters */}
        <RevenueChart
          completedOrders={completedOrders}
          parseOrderDate={parseOrderDate}
          formatPrice={formatPrice}
        />

        {/* Stock Share Chart */}
        <StockShareChart
          categoriesProduct={categoriesProduct}
          mappedProducts={mappedProducts}
        />
      </div>

      {/* Recent Orders & Stock / Bestsellers Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders with Detailed View Modal triggers */}
        <RecentOrdersTable
          mappedOrders={mappedOrders}
          mappedCustomers={mappedCustomers}
          formatDate={formatDate}
          formatPrice={formatPrice}
          getStatusBadge={getStatusBadge}
          onOpenInvoice={handleOpenInvoice}
        />

        {/* Stock Alerts & Best Sellers toggle card */}
        <StockAndBestSellersCard
          displayLowStock={displayLowStock}
          displayBestSellers={displayBestSellers}
          resolveImageUrl={resolveImageUrl}
          loading={variantsLoading}
        />
      </div>

      {/* Invoice Modal Details Popup */}
      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        order={selectedInvoiceOrder}
        customer={invoiceCustomer}
        orderDetails={orderDetails}
        formatPrice={formatPrice}
        formatDate={formatDate}
        resolveImageUrl={resolveImageUrl}
      />
    </div>
  );
};

export default Dashboard;

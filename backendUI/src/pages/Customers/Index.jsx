import React, { useState } from 'react';
import { Search, Edit2, Trash2, Mail, Phone, MapPin, UserPlus, ShoppingBag } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import GlassCard from '../../components/GlassCard';
import CustomerFormModal from './CustomerFormModal';
import RelatedOrdersModal from './RelatedOrdersModal';
import customerService from '../../services/customerService';
import userAddressService from '../../services/userAddressService';
import orderService from '../../services/orderService';


const Customers = () => {
  const { 
    customers, 
    setCustomers,
    orders, 
    setOrders,
    uploadImage, 
    resolveImageUrl, 
    userAddresses,
    setUserAddresses
  } = useAdmin();

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [currentCustomer, setCurrentCustomer] = useState(null);

  // Related orders modal state
  const [relatedModalOpen, setRelatedModalOpen] = useState(false);
  const [selectedCustomerForDelete, setSelectedCustomerForDelete] = useState(null);

  // Map customers locally
  const mappedCustomers = (customers || []).map(cust => {
    if (!cust) return null;
    const active = cust.status === 1;

    // Find default address from userAddresses state
    const defaultAddr = (userAddresses || []).find(addr => 
      (addr.customerId === cust.id || addr.customer?.id === cust.id) && addr.isDefault
    ) || (userAddresses || []).find(addr => 
      (addr.customerId === cust.id || addr.customer?.id === cust.id)
    );

    const addressText = defaultAddr ? 
      [defaultAddr.addressLine, defaultAddr.ward, defaultAddr.district, defaultAddr.city]
        .filter(part => part && part !== 'N/A')
        .join(', ') 
      : '';

    return {
      id: cust.id,
      fullname: cust.fullName || cust.fullname || cust.username || cust.email || 'Unknown',
      username: cust.username || cust.email || '',
      email: cust.email,
      phone: cust.phone || '',
      address: addressText,
      avatar: cust.imageUrl || cust.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      active: active,
      status: cust.status
    };
  }).filter(Boolean);

  // Filter and enrich customers
  const enrichedCustomers = mappedCustomers.map(cust => {
    // Note: raw orders from database uses customerId or customer object.
    // Let's check both: o.customerId or o.customer?.id
    const custOrders = (orders || []).filter(o => o.customerId === cust.id || o.customer?.id === cust.id);
    const spending = custOrders
      .filter(o => o.orderStatus === 'Completed' || o.orderStatus === '2')
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    return {
      ...cust,
      orderCount: custOrders.length,
      totalSpending: spending
    };
  });

  const filteredCustomers = enrichedCustomers.filter(cust =>
    cust.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cust.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cust.phone.includes(searchTerm)
  );

  const handleOpenAdd = () => {
    setCurrentCustomer(null);
    setModalType('add');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (customer) => {
    setCurrentCustomer(customer);
    setModalType('edit');
    setIsModalOpen(true);
  };

  // Submit Operations
  const handleFormSubmit = async (formData) => {
    const body = {
      username: formData.username,
      fullName: formData.fullname,
      email: formData.email,
      phone: formData.phone || '',
      imageUrl: formData.avatar || formData.imageUrl || '',
      status: formData.active ? 1 : 0
    };
    if (formData.password && formData.password.trim() !== '') {
      body.password = formData.password;
    }

    let customerId = formData.id;

    try {
      if (modalType === 'add') {
        const newCustomer = await customerService.create(body);
        setCustomers(prev => [...prev, newCustomer]);
        customerId = newCustomer.id;
      } else {
        const updatedCustomer = await customerService.update(formData.id, body);
        setCustomers(prev => prev.map(c => c.id === formData.id ? updatedCustomer : c));
      }

      // Save or update address
      if (customerId) {
        const addressText = (formData.address || '').trim();
        const existingAddr = (userAddresses || []).find(addr => 
          (addr.customerId === customerId || addr.customer?.id === customerId) && addr.isDefault
        ) || (userAddresses || []).find(addr => 
          (addr.customerId === customerId || addr.customer?.id === customerId)
        );

        if (addressText) {
          const addressBody = {
            customerId: customerId,
            recipientName: formData.fullname || body.fullName || 'Recipient',
            recipientPhone: formData.phone || body.phone || '0912345678',
            addressLine: addressText,
            ward: existingAddr?.ward || 'N/A',
            district: existingAddr?.district || 'N/A',
            city: existingAddr?.city || 'N/A',
            isDefault: true
          };

          if (existingAddr) {
            const updatedAddr = await userAddressService.update(existingAddr.id, addressBody);
            setUserAddresses(prev => prev.map(a => a.id === existingAddr.id ? updatedAddr : a));
          } else {
            const newAddr = await userAddressService.create(addressBody);
            setUserAddresses(prev => [...prev, newAddr]);
          }
        }
      }
    } catch (err) {
      alert("Lỗi thao tác khách hàng: " + err.message);
    }

    setIsModalOpen(false);
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      await orderService.delete(orderId);
      setOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (err) {
      alert("Lỗi khi xóa đơn hàng: " + err.message);
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    try {
      await customerService.delete(customerId);
      setCustomers(prev => prev.filter(c => c.id !== customerId));
      return true;
    } catch (err) {
      alert("Lỗi khi xóa khách hàng: " + err.message);
      return false;
    }
  };

  const handleDelete = async (id) => {
    const customer = mappedCustomers.find(c => c.id === id);
    if (!customer) return;

    const hasOrders = orders.some(o => o.customerId === id || o.customer?.id === id);
    if (hasOrders) {
      setSelectedCustomerForDelete(customer);
      setRelatedModalOpen(true);
      return;
    }
    if (confirm(`Are you sure you want to delete customer record "${customer.fullname}"?`)) {
      await handleDeleteCustomer(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Customers Directory</h2>
          <p className="text-xs text-slate-400">Total customers: {mappedCustomers.length} subscribers</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="glass-btn-primary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 self-end sm:self-auto"
        >
          <UserPlus size={16} /> Add Customer
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 rounded-xl border border-white/5 bg-[#0F1224]/30 backdrop-blur-md">
        <div className="relative flex-1 min-w-[200px] md:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg text-xs glass-input"
          />
        </div>
      </div>

      {/* Customers Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full h-40 flex flex-col items-center justify-center text-slate-500 border border-white/5 rounded-2xl bg-[#0F1224]/10">
            <ShoppingBag size={24} className="text-slate-600 mb-2" />
            <p className="text-xs font-semibold">No customers matched.</p>
          </div>
        ) : (
          filteredCustomers.map(cust => (
            <GlassCard key={cust.id} hoverEffect={true} className="flex flex-col justify-between h-full relative overflow-hidden">
              {/* Active / Inactive Tag */}
              <div className="absolute top-4 right-4">
                {cust.active ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Active</span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-500/20 text-slate-400 border border-slate-500/30">Inactive</span>
                )}
              </div>

              {/* Profile Card Header */}
              <div>
                <div className="flex items-center gap-3.5 mb-4">
                  <img src={resolveImageUrl(cust.avatar)} alt={cust.fullname} className="w-12 h-12 rounded-full object-cover border border-purple-500/20" />
                  <div>
                    <h3 className="font-bold text-white text-base">{cust.fullname}</h3>
                    <p className="text-[10px] font-mono text-slate-500">ID: {cust.id}</p>
                  </div>
                </div>

                {/* Details List */}
                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Mail size={12} className="text-purple-400 flex-shrink-0" />
                    <span className="truncate">{cust.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={12} className="text-purple-400 flex-shrink-0" />
                    <span>{cust.phone}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin size={12} className="text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2 leading-relaxed" title={cust.address}>{cust.address}</span>
                  </div>
                </div>
              </div>

              {/* Stats & Operations footer */}
              <div className="mt-5 pt-3.5 border-t border-white/5 flex items-center justify-between">
                {/* Spending Statistics */}
                <div className="flex gap-4">
                  <div>
                    <p className="text-[9px] uppercase font-bold tracking-wider text-slate-500">Orders</p>
                    <p className="text-sm font-bold text-slate-200 flex items-center gap-1">
                      <ShoppingBag size={11} className="text-slate-400" />
                      <span>{cust.orderCount}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold tracking-wider text-slate-500">Total Spent</p>
                    <p className="text-sm font-bold text-emerald-400">${cust.totalSpending.toFixed(2)}</p>
                  </div>
                </div>

                {/* CRUD Controls */}
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(cust)}
                    className="p-2 rounded-lg glass-btn text-blue-400 hover:border-blue-500/40"
                    title="Edit Customer Info"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(cust.id)}
                    className="p-2 rounded-lg glass-btn text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30"
                    title="Delete Customer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>

      {/* Add/Edit Modal Form */}
      <CustomerFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        modalType={modalType}
        customerData={currentCustomer}
        resolveImageUrl={resolveImageUrl}
        uploadImage={uploadImage}
        onSubmit={handleFormSubmit}
      />

      {/* Related Orders Dependency Modal */}
      <RelatedOrdersModal
        isOpen={relatedModalOpen}
        onClose={() => {
          setRelatedModalOpen(false);
          setSelectedCustomerForDelete(null);
        }}
        selectedCustomer={selectedCustomerForDelete}
        orders={orders}
        deleteOrder={handleDeleteOrder}
        deleteCustomer={handleDeleteCustomer}
      />
    </div>
  );
};

export default Customers;

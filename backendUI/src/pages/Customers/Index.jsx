import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Mail, Phone, MapPin, UserPlus, ShoppingBag } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import GlassCard from '../../components/GlassCard';
import GlassModal from '../../components/GlassModal';

const Customers = () => {
  const { customers, orders, addCustomer, updateCustomer, deleteCustomer, uploadImage, resolveImageUrl } = useAdmin();

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add');

  // Form state
  const [currentCustomer, setCurrentCustomer] = useState({
    id: '',
    fullname: '',
    email: '',
    phone: '',
    address: '',
    active: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
  });

  // Filter and enrich customers
  const enrichedCustomers = (customers || []).map(cust => {
    const custOrders = (orders || []).filter(o => o.customerId === cust.id);
    const spending = custOrders.filter(o => o.status === 'Completed').reduce((sum, o) => sum + o.totalAmount, 0);
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
    setCurrentCustomer({
      id: '',
      fullname: '',
      email: '',
      phone: '',
      address: '',
      active: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    });
    setModalType('add');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (customer) => {
    setCurrentCustomer(customer);
    setModalType('edit');
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const url = await uploadImage(file);
        setCurrentCustomer(prev => ({ ...prev, avatar: url }));
      } catch (err) {
        alert("Lỗi tải lên hình ảnh: " + err.message);
      }
    }
  };

  // Submit Operations
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentCustomer.fullname || !currentCustomer.email || !currentCustomer.phone) {
      alert("Name, Email, and Phone number are required.");
      return;
    }

    if (modalType === 'add') {
      addCustomer(currentCustomer);
    } else {
      updateCustomer(currentCustomer);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this customer record?")) {
      deleteCustomer(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Customers Directory</h2>
          <p className="text-xs text-slate-400">Total customers: {customers.length} subscribers</p>
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
      <GlassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalType === 'add' ? 'Add New Customer Profile' : 'Edit Customer Profile'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar upload */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Profile Photo *</label>
            <div className="flex items-center gap-4">
              {currentCustomer.avatar ? (
                <img src={resolveImageUrl(currentCustomer.avatar)} alt="Avatar Preview" className="w-12 h-12 rounded-full object-cover border border-purple-500/20" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-purple-600/10 border border-dashed border-purple-500/30 flex items-center justify-center text-slate-500 text-[10px]">No Pic</div>
              )}
              <div className="flex-1">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-purple-600/20 file:text-purple-300 hover:file:bg-purple-600/30 file:cursor-pointer glass-input cursor-pointer"
                />
                <span className="text-[9px] text-slate-500 block mt-1">Select a customer profile photo from your device.</span>
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name *</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Phạm Minh Trí"
              value={currentCustomer.fullname}
              onChange={(e) => setCurrentCustomer({...currentCustomer, fullname: e.target.value})}
              className="w-full px-3 py-2 rounded-lg text-xs glass-input"
            />
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address *</label>
              <input 
                type="email" 
                required
                placeholder="tri.pm@example.com"
                value={currentCustomer.email}
                onChange={(e) => setCurrentCustomer({...currentCustomer, email: e.target.value})}
                className="w-full px-3 py-2 rounded-lg text-xs glass-input"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone Number *</label>
              <input 
                type="text" 
                required
                placeholder="0912345678"
                value={currentCustomer.phone}
                onChange={(e) => setCurrentCustomer({...currentCustomer, phone: e.target.value})}
                className="w-full px-3 py-2 rounded-lg text-xs glass-input"
              />
            </div>
          </div>

          {/* Status & Address */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Customer Status</label>
              <select
                value={currentCustomer.active}
                onChange={(e) => setCurrentCustomer({...currentCustomer, active: e.target.value === 'true'})}
                className="w-full px-3 py-2 rounded-lg text-xs glass-input bg-[#0F1224]"
              >
                <option value="true">Active (Access Allowed)</option>
                <option value="false">Suspended / Suspended</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Default Address</label>
              <textarea 
                rows="2"
                placeholder="Enter street, city, region..."
                value={currentCustomer.address}
                onChange={(e) => setCurrentCustomer({...currentCustomer, address: e.target.value})}
                className="w-full px-3 py-2 rounded-lg text-xs glass-input"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="glass-btn px-4 py-2 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="glass-btn-primary px-5 py-2 rounded-xl text-xs font-semibold"
            >
              Save Customer Details
            </button>
          </div>
        </form>
      </GlassModal>
    </div>
  );
};

export default Customers;

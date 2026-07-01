import React, { useState, useEffect } from 'react';
import GlassModal from '../../components/GlassModal';

const CustomerFormModal = ({
  isOpen,
  onClose,
  modalType,
  customerData,
  resolveImageUrl,
  uploadImage,
  onSubmit
}) => {
  const [form, setForm] = useState({
    id: '',
    fullname: '',
    email: '',
    phone: '',
    address: '',
    active: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
  });

  useEffect(() => {
    if (isOpen) {
      if (modalType === 'add') {
        setForm({
          id: '',
          fullname: '',
          email: '',
          phone: '',
          address: '',
          active: true,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
        });
      } else if (customerData) {
        setForm(customerData);
      }
    }
  }, [isOpen, modalType, customerData]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const url = await uploadImage(file);
        setForm(prev => ({ ...prev, avatar: url }));
      } catch (err) {
        alert("Lỗi tải lên hình ảnh: " + err.message);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.fullname || !form.email || !form.phone) {
      alert("Name, Email, and Phone number are required.");
      return;
    }
    onSubmit(form);
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={modalType === 'add' ? 'Add New Customer Profile' : 'Edit Customer Profile'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Avatar upload */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Profile Photo *</label>
          <div className="flex items-center gap-4">
            {form.avatar ? (
              <img src={resolveImageUrl(form.avatar)} alt="Avatar Preview" className="w-12 h-12 rounded-full object-cover border border-purple-500/20" />
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
            value={form.fullname}
            onChange={(e) => setForm({...form, fullname: e.target.value})}
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
              value={form.email}
              onChange={(e) => setForm({...form, email: e.target.value})}
              className="w-full px-3 py-2 rounded-lg text-xs glass-input"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone Number *</label>
            <input 
              type="text" 
              required
              placeholder="0912345678"
              value={form.phone}
              onChange={(e) => setForm({...form, phone: e.target.value})}
              className="w-full px-3 py-2 rounded-lg text-xs glass-input"
            />
          </div>
        </div>

        {/* Status & Address */}
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Customer Status</label>
            <select
              value={form.active}
              onChange={(e) => setForm({...form, active: e.target.value === 'true'})}
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
              value={form.address}
              onChange={(e) => setForm({...form, address: e.target.value})}
              className="w-full px-3 py-2 rounded-lg text-xs glass-input"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
          <button 
            type="button" 
            onClick={onClose}
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
  );
};

export default CustomerFormModal;

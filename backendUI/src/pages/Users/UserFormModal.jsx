import React, { useState, useEffect } from 'react';
import GlassModal from '../../components/GlassModal';

const UserFormModal = ({
  isOpen,
  onClose,
  modalType,
  userData,
  roles,
  resolveImageUrl,
  uploadImage,
  onSubmit,
  currentUser
}) => {
  const [form, setForm] = useState({
    id: '',
    fullname: '',
    username: '',
    email: '',
    password: '',
    roleId: '',
    active: true,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&h=80&q=80'
  });

  const isSelf = userData && currentUser && Number(userData.id) === Number(currentUser.id);

  useEffect(() => {
    if (isOpen) {
      if (modalType === 'add') {
        setForm({
          id: '',
          fullname: '',
          username: '',
          email: '',
          password: '',
          roleId: roles[0]?.id || '',
          active: true,
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&h=80&q=80'
        });
      } else if (userData) {
        setForm({
          ...userData,
          password: ''
        });
      }
    }
  }, [isOpen, modalType, userData, roles]);

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
    if (!form.fullname || !form.username || !form.email || !form.roleId) {
      alert("Name, Username, Email, and Security Role are required fields.");
      return;
    }
    if (modalType === 'add' && !form.password) {
      alert("Security password is required for new console accounts.");
      return;
    }
    onSubmit(form);
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={modalType === 'add' ? 'Create User Account' : 'Edit User Account Details'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Avatar image input */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Profile Photo</label>
          <div className="flex items-center gap-4">
            <img src={resolveImageUrl(form.avatar)} alt="Avatar" className="w-12 h-12 rounded-full object-cover border border-purple-500/20" />
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full text-xs text-slate-400 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-purple-600/20 file:text-purple-300 hover:file:bg-purple-600/30 file:cursor-pointer glass-input cursor-pointer"
              />
              <span className="text-[9px] text-slate-500 block mt-1">Upload profile avatar for this console account.</span>
            </div>
          </div>
        </div>

        {/* Name & username */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Dương Quốc Bảo"
              value={form.fullname}
              onChange={(e) => setForm({ ...form, fullname: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-xs glass-input"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">System Username *</label>
            <input
              type="text"
              required
              placeholder="e.g. duong_bao"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-xs glass-input"
            />
          </div>
        </div>

        {/* Email & Password */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address *</label>
            <input
              type="email"
              required
              placeholder="bao.dq@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-xs glass-input"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {modalType === 'add' ? 'Security Password *' : 'Change Password'}
            </label>
            <input
              type="password"
              required={modalType === 'add'}
              placeholder={modalType === 'edit' ? 'Leave empty to keep same password' : '••••••••'}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-xs glass-input"
            />
          </div>
        </div>

        {/* Role & status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Role *</label>
            <select
              value={form.roleId}
              onChange={(e) => setForm({ ...form, roleId: e.target.value })}
              disabled={isSelf}
              className={`w-full px-3 py-2 rounded-lg text-xs glass-input bg-[#0F1224] text-white ${isSelf ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {roles.map(r => (
                <option key={r.id} value={r.id} className="bg-[#0F1224] text-white">{r.name}</option>
              ))}
            </select>
            {isSelf && <span className="text-[8px] text-amber-400 block">Cannot change your own role.</span>}
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</label>
            <select
              value={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.value === 'true' })}
              disabled={isSelf}
              className={`w-full px-3 py-2 rounded-lg text-xs glass-input bg-[#0F1224] text-white ${isSelf ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="true" className="bg-[#0F1224] text-white">Active (Access Granted)</option>
              <option value="false" className="bg-[#0F1224] text-white">Suspended (Access Revoked)</option>
            </select>
            {isSelf && <span className="text-[8px] text-amber-400 block">Cannot suspend your own account.</span>}
          </div>
        </div>

        {/* Submit Actions */}
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
            Save User
          </button>
        </div>
      </form>
    </GlassModal>
  );
};

export default UserFormModal;

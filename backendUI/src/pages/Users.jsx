import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Mail, Shield, ShieldCheck, UserCheck } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import GlassCard from '../components/GlassCard';
import GlassModal from '../components/GlassModal';

const Users = ({ currentUser }) => {
  const { users, roles, addUser, updateUser, deleteUser } = useAdmin();

  // Search & Modals
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add');

  // Form State
  const [currentStaff, setCurrentStaff] = useState({
    id: '',
    username: '',
    fullname: '',
    email: '',
    roleId: '',
    active: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
  });



  // Filters
  const filteredUsers = users.filter(u => 
    u.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Open Actions
  const handleOpenAdd = () => {
    setCurrentStaff({
      id: '',
      username: '',
      fullname: '',
      email: '',
      roleId: roles[0]?.id || '',
      active: true,
      avatar: ''
    });
    setModalType('add');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (staff) => {
    setCurrentStaff(staff);
    setModalType('edit');
    setIsModalOpen(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentStaff(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Operations
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentStaff.username || !currentStaff.fullname || !currentStaff.email) {
      alert("Username, Full Name and Email are required.");
      return;
    }

    if (modalType === 'add') {
      addUser(currentStaff);
    } else {
      updateUser(currentStaff);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    // Security check: currentUser.id comes from active session
    deleteUser(id, currentUser.id);
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Staff Management</h2>
          <p className="text-xs text-slate-400">Manage console administrative users</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="glass-btn-primary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 self-end sm:self-auto"
        >
          <Plus size={16} /> Create User
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="flex gap-4 items-center justify-between p-4 rounded-xl border border-white/5 bg-[#0F1224]/30 backdrop-blur-md">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search staff by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg text-xs glass-input"
          />
        </div>
      </div>

      {/* Users grid list */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredUsers.map((staff) => {
          const roleObj = roles.find(r => r.id === staff.roleId);
          const isSelf = staff.id === currentUser.id;
          
          return (
            <GlassCard key={staff.id} hoverEffect={true} className={`flex flex-col justify-between h-full relative overflow-hidden border
              ${isSelf ? 'border-purple-500/30 shadow-lg shadow-purple-500/5' : 'border-white/5'}`}>
              
              {/* Profile indicators */}
              <div className="absolute top-4 right-4 flex gap-1.5">
                {isSelf && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-0.5">
                    <UserCheck size={9} /> You
                  </span>
                )}
                {staff.active ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Active</span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-500/20 text-slate-400 border border-slate-500/30">Suspended</span>
                )}
              </div>

              <div>
                {/* Header profile details */}
                <div className="flex items-center gap-3.5 mb-4">
                  <img src={staff.avatar} alt={staff.fullname} className="w-12 h-12 rounded-full object-cover border border-purple-500/20" />
                  <div>
                    <h3 className="font-bold text-white text-base">{staff.fullname}</h3>
                    <p className="text-[10px] font-mono text-slate-500">@{staff.username}</p>
                  </div>
                </div>

                {/* Details List */}
                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Mail size={12} className="text-purple-400 flex-shrink-0" />
                    <span className="truncate">{staff.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield size={12} className="text-purple-400 flex-shrink-0" />
                    <span className="font-semibold text-purple-300">{roleObj ? roleObj.name : 'Unknown Role'}</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-5 pt-3.5 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono">UID: {staff.id}</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(staff)}
                    className="p-2 rounded-lg glass-btn text-blue-400 hover:border-blue-500/40"
                    title="Edit User"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(staff.id)}
                    className={`p-2 rounded-lg glass-btn transition-colors
                      ${isSelf 
                        ? 'text-slate-600 border-white/5 cursor-not-allowed' 
                        : 'text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30'}`}
                    disabled={isSelf}
                    title={isSelf ? 'Cannot delete yourself' : 'Delete User'}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      <GlassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalType === 'add' ? 'Create Staff User' : 'Edit Staff Details'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar upload */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Profile Image *</label>
            <div className="flex items-center gap-4">
              {currentStaff.avatar ? (
                <img src={currentStaff.avatar} alt="Avatar" className="w-12 h-12 rounded-full object-cover border border-purple-500/20" />
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
                <span className="text-[9px] text-slate-500 block mt-1">Select an avatar image from your device.</span>
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name *</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Võ Quang Dương"
              value={currentStaff.fullname}
              onChange={(e) => setCurrentStaff({...currentStaff, fullname: e.target.value})}
              className="w-full px-3 py-2 rounded-lg text-xs glass-input"
            />
          </div>

          {/* Username & Email */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Username *</label>
              <input 
                type="text" 
                required
                disabled={modalType === 'edit'}
                placeholder="admin_duong"
                value={currentStaff.username}
                onChange={(e) => setCurrentStaff({...currentStaff, username: e.target.value})}
                className="w-full px-3 py-2 rounded-lg text-xs glass-input disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address *</label>
              <input 
                type="email" 
                required
                placeholder="duong.vq@chinh.com"
                value={currentStaff.email}
                onChange={(e) => setCurrentStaff({...currentStaff, email: e.target.value})}
                className="w-full px-3 py-2 rounded-lg text-xs glass-input"
              />
            </div>
          </div>

          {/* Role & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">System Role *</label>
              <select
                value={currentStaff.roleId}
                onChange={(e) => setCurrentStaff({...currentStaff, roleId: e.target.value})}
                className="w-full px-3 py-2 rounded-lg text-xs glass-input bg-[#0F1224]"
              >
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</label>
              <select
                value={currentStaff.active}
                onChange={(e) => setCurrentStaff({...currentStaff, active: e.target.value === 'true'})}
                className="w-full px-3 py-2 rounded-lg text-xs glass-input bg-[#0F1224]"
              >
                <option value="true">Active</option>
                <option value="false">Suspended / Inactive</option>
              </select>
            </div>
          </div>

          {/* Actions */}
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
              Save User
            </button>
          </div>
        </form>
      </GlassModal>
    </div>
  );
};

export default Users;

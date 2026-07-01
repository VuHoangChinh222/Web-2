import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Mail, Shield, User, Key, KeyRound } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import GlassCard from '../../components/GlassCard';
import GlassModal from '../../components/GlassModal';

const Users = () => {
  const { users, roles, currentUser, addUser, updateUser, deleteUsers, uploadImage, resolveImageUrl } = useAdmin();

  // Search filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add');

  // Form State
  const [currentUserForm, setCurrentUserForm] = useState({
    id: '',
    fullname: '',
    username: '',
    email: '',
    password: '',
    roleId: '',
    active: true,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&h=80&q=80'
  });

  const filteredUsers = users.filter(usr => 
    usr.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usr.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usr.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setCurrentUserForm({
      id: '',
      fullname: '',
      username: '',
      email: '',
      password: '',
      roleId: roles[0]?.id || '',
      active: true,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&h=80&q=80'
    });
    setModalType('add');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (usr) => {
    setCurrentUserForm({
      ...usr,
      password: '' // Keep empty to indicate password not updated unless typed
    });
    setModalType('edit');
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const url = await uploadImage(file);
        setCurrentUserForm(prev => ({ ...prev, avatar: url }));
      } catch (err) {
        alert("Lỗi tải lên hình ảnh: " + err.message);
      }
    }
  };

  // Submit Operations
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentUserForm.fullname || !currentUserForm.username || !currentUserForm.email || !currentUserForm.roleId) {
      alert("Name, Username, Email, and Security Role are required fields.");
      return;
    }
    if (modalType === 'add' && !currentUserForm.password) {
      alert("Security password is required for new console accounts.");
      return;
    }

    if (modalType === 'add') {
      addUser(currentUserForm);
    } else {
      updateUser(currentUserForm);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (id === currentUser?.id) {
      alert("Self Demolition Blocked: You cannot delete the admin profile you are currently signed in with.");
      return;
    }
    if (confirm("Are you sure you want to delete this staff user? This will revoke all terminal permissions.")) {
      deleteUsers(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Console Users</h2>
          <p className="text-xs text-slate-400">Total console users: {users.length} administrators & editors</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="glass-btn-primary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 self-end sm:self-auto"
        >
          <Plus size={16} /> Create User
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 rounded-xl border border-white/5 bg-[#0F1224]/30 backdrop-blur-md">
        <div className="relative flex-1 min-w-[200px] md:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg text-xs glass-input"
          />
        </div>
      </div>

      {/* Users Registry List Table */}
      <GlassCard hoverEffect={false}>
        <div className="overflow-x-auto glass-scrollbar -mx-5 px-5">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 font-medium">
                <th className="py-3">Console User</th>
                <th className="py-3">System Username</th>
                <th className="py-3">Email Address</th>
                <th className="py-3">Security Role</th>
                <th className="py-3">Status</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((usr) => {
                const assignedRole = roles.find(r => r.id === usr.roleId);
                const isSelf = usr.id === currentUser?.id;
                return (
                  <tr key={usr.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="py-3.5">
                      <div className="flex items-center gap-3">
                        <img src={resolveImageUrl(usr.avatar)} alt="" className="w-9 h-9 rounded-full object-cover border border-white/10" />
                        <div>
                          <p className="font-semibold text-white text-sm flex items-center gap-1.5">
                            <span>{usr.fullname}</span>
                            {isSelf && (
                              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-600/30 text-purple-300 border border-purple-500/30">You</span>
                            )}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">UID: {usr.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 font-mono text-purple-400 font-semibold">{usr.username}</td>
                    <td className="py-3.5 text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Mail size={11} className="text-slate-500" />
                        <span>{usr.email}</span>
                      </div>
                    </td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        {assignedRole ? assignedRole.name : 'Unknown Role'}
                      </span>
                    </td>
                    <td className="py-3.5">
                      {usr.active ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Active</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-500/20 text-slate-400 border border-slate-500/30">Suspended</span>
                      )}
                    </td>
                    <td className="py-3.5 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(usr)}
                          className="p-1.5 rounded glass-btn text-blue-400 hover:border-blue-500/40"
                          title="Edit user details"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(usr.id)}
                          disabled={isSelf}
                          className="p-1.5 rounded glass-btn text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Delete user account"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Add / Edit User Modal */}
      <GlassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalType === 'add' ? 'Create User Account' : 'Edit User Account Details'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Avatar image input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Profile Photo</label>
            <div className="flex items-center gap-4">
              <img src={resolveImageUrl(currentUserForm.avatar)} alt="Avatar" className="w-12 h-12 rounded-full object-cover border border-purple-500/20" />
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
                value={currentUserForm.fullname}
                onChange={(e) => setCurrentUserForm({...currentUserForm, fullname: e.target.value})}
                className="w-full px-3 py-2 rounded-lg text-xs glass-input"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">System Username *</label>
              <input 
                type="text" 
                required
                placeholder="e.g. duong_bao"
                value={currentUserForm.username}
                onChange={(e) => setCurrentUserForm({...currentUserForm, username: e.target.value})}
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
                value={currentUserForm.email}
                onChange={(e) => setCurrentUserForm({...currentUserForm, email: e.target.value})}
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
                value={currentUserForm.password}
                onChange={(e) => setCurrentUserForm({...currentUserForm, password: e.target.value})}
                className="w-full px-3 py-2 rounded-lg text-xs glass-input"
              />
            </div>
          </div>

          {/* Role & status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Role *</label>
              <select
                value={currentUserForm.roleId}
                onChange={(e) => setCurrentUserForm({...currentUserForm, roleId: e.target.value})}
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
                value={currentUserForm.active}
                onChange={(e) => setCurrentUserForm({...currentUserForm, active: e.target.value === 'true'})}
                className="w-full px-3 py-2 rounded-lg text-xs glass-input bg-[#0F1224]"
              >
                <option value="true">Active (Access Granted)</option>
                <option value="false">Suspended (Access Revoked)</option>
              </select>
            </div>
          </div>

          {/* Submit Actions */}
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

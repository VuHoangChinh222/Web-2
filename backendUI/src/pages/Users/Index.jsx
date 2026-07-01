import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Mail } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import GlassCard from '../../components/GlassCard';
import UserFormModal from './UserFormModal';
import RelatedContentModal from './RelatedContentModal';

const Users = () => {
  const { 
    users, 
    roles, 
    currentUser, 
    addUser, 
    updateUser, 
    deleteUser, 
    uploadImage, 
    resolveImageUrl,
    blogs,
    deleteBlog,
    categoriesBlog
  } = useAdmin();

  // Search filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add');

  // Related content modal state
  const [relatedModalOpen, setRelatedModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form State
  const [currentUserForm, setCurrentUserForm] = useState(null);

  const filteredUsers = users.filter(usr => 
    usr.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usr.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usr.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setCurrentUserForm(null);
    setModalType('add');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (usr) => {
    setCurrentUserForm(usr);
    setModalType('edit');
    setIsModalOpen(true);
  };

  // Submit Operations
  const handleFormSubmit = (formData) => {
    if (modalType === 'add') {
      addUser(formData);
    } else {
      updateUser(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (usr) => {
    if (usr.id === currentUser?.id) {
      alert("Self Demolition Blocked: You cannot delete the admin profile you are currently signed in with.");
      return;
    }

    // Check if user has related blogs
    const relatedBlogs = blogs.filter(b => Number(b.authorId) === Number(usr.id));
    if (relatedBlogs.length > 0) {
      setSelectedUser(usr);
      setRelatedModalOpen(true);
      return;
    }

    if (confirm(`Are you sure you want to delete this staff user "${usr.fullname}"? This will revoke all terminal permissions.`)) {
      deleteUser(usr.id, currentUser?.id);
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
                          onClick={() => handleDelete(usr)}
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
      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        modalType={modalType}
        userData={currentUserForm}
        roles={roles}
        resolveImageUrl={resolveImageUrl}
        uploadImage={uploadImage}
        onSubmit={handleFormSubmit}
      />

      {/* Related Content / Constraint Modal */}
      <RelatedContentModal
        isOpen={relatedModalOpen}
        onClose={() => {
          setRelatedModalOpen(false);
          setSelectedUser(null);
        }}
        selectedUser={selectedUser}
        blogs={blogs}
        categoriesBlog={categoriesBlog}
        resolveImageUrl={resolveImageUrl}
        deleteBlog={deleteBlog}
        deleteUser={deleteUser}
        currentUser={currentUser}
      />
    </div>
  );
};

export default Users;

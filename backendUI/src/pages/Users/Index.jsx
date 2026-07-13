import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Mail, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import GlassCard from '../../components/GlassCard';
import UserFormModal from './UserFormModal';
import RelatedContentModal from './RelatedContentModal';
import UserViewModal from './UserViewModal';
import userService from '../../services/userService';
import blogService from '../../services/blogService';

const mapUserFromBackend = (user) => {
  if (!user) return null;
  const active = user.status === 1;
  return {
    id: user.id,
    username: user.username,
    fullname: user.fullName || user.username,
    email: user.email,
    phone: user.phone || '',
    roleId: user.role ? user.role.id : null,
    role: user.role ? {
      id: user.role.id,
      name: user.role.name,
      description: user.role.description,
      permissions: user.role.permissions || []
    } : null,
    active: active,
    avatar: user.imageUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    status: user.status
  };
};

const Users = () => {
  const { 
    users, 
    setUsers,
    roles, 
    currentUser, 
    uploadImage, 
    resolveImageUrl,
    blogs,
    setBlogs,
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
  const [viewUserModalOpen, setViewUserModalOpen] = useState(false);
  const [selectedUserForView, setSelectedUserForView] = useState(null);

  const mappedUsers = (users || []).map(mapUserFromBackend).filter(Boolean);

  const filteredUsers = mappedUsers.filter(usr => 
    usr.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usr.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usr.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);
      if (start === 1) {
        end = 5;
      } else if (end === totalPages) {
        start = totalPages - 4;
      }
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    return pages;
  };

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

  const handleOpenView = (usr) => {
    setSelectedUserForView(usr);
    setViewUserModalOpen(true);
  };

  const handleToggleStatus = async (usr) => {
    if (usr.id === currentUser?.id) {
      alert("Self Demolition Blocked: You cannot suspend your own account.");
      return;
    }

    const nextStatus = usr.active ? 0 : 1;
    const body = {
      username: usr.username,
      fullName: usr.fullname,
      email: usr.email,
      phone: usr.phone || '0912345678',
      imageUrl: usr.avatar === 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80' ? '' : usr.avatar,
      status: nextStatus,
      role: {
        id: usr.roleId
      }
    };

    try {
      const updatedUser = await userService.update(usr.id, body);
      setUsers(prev => prev.map(u => u.id === usr.id ? updatedUser : u));
    } catch (err) {
      alert("Lỗi khi đổi trạng thái: " + err.message);
    }
  };

  // Submit Operations
  const handleFormSubmit = async (formData) => {
    // Safety check: Cannot change own status or role
    let targetRoleId = parseInt(formData.roleId);
    let targetStatus = formData.active ? 1 : 0;
    
    if (formData.id === currentUser?.id) {
      targetStatus = 1; // Force active status
      if (currentUser.role) {
        targetRoleId = currentUser.role.id; // Force original role
      }
    }

    const body = {
      username: formData.username,
      fullName: formData.fullname,
      email: formData.email,
      phone: formData.phone || '0912345678',
      imageUrl: formData.avatar || formData.imageUrl || '',
      status: targetStatus,
      role: {
        id: targetRoleId
      }
    };
    if (formData.password && formData.password.trim() !== '') {
      body.password = formData.password;
    }

    try {
      if (modalType === 'add') {
        const newUser = await userService.create(body);
        setUsers(prev => [...prev, newUser]);
      } else {
        const updatedUser = await userService.update(formData.id, body);
        setUsers(prev => prev.map(u => u.id === formData.id ? updatedUser : u));
      }
    } catch (err) {
      alert("Lỗi thao tác người dùng: " + err.message);
    }
    setIsModalOpen(false);
  };

  const handleDeleteUser = async (userId) => {
    try {
      await userService.delete(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      return true;
    } catch (err) {
      alert("Lỗi khi xóa người dùng: " + err.message);
      return false;
    }
  };

  const handleDeleteBlog = async (blogId) => {
    try {
      await blogService.delete(blogId);
      setBlogs(prev => prev.filter(b => b.id !== blogId));
      return true;
    } catch (err) {
      alert("Lỗi khi xóa bài viết: " + err.message);
      return false;
    }
  };

  const handleDelete = async (usr) => {
    if (usr.id === currentUser?.id) {
      alert("Self Demolition Blocked: You cannot delete the admin profile you are currently signed in with.");
      return;
    }

    // Check if user has related blogs
    const relatedBlogs = blogs.filter(b => {
      const blogAuthorId = b.author ? b.author.id : b.userId;
      return Number(blogAuthorId) === Number(usr.id);
    });
    if (relatedBlogs.length > 0) {
      setSelectedUser(usr);
      setRelatedModalOpen(true);
      return;
    }

    if (confirm(`Are you sure you want to delete this staff user "${usr.fullname}"? This will revoke all terminal permissions.`)) {
      await handleDeleteUser(usr.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Console Users</h2>
          <p className="text-xs text-slate-400">Total console users: {mappedUsers.length} administrators & editors</p>
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
              {currentItems.map((usr) => {
                const assignedRole = roles.find(r => r.id === usr.roleId);
                const isSelf = usr.id === currentUser?.id;
                return (
                  <tr 
                    key={usr.id} 
                    className={`hover:bg-white/[0.01] transition-colors ${
                      !usr.active 
                        ? 'opacity-60 bg-rose-500/[0.02] border-l-2 border-l-rose-500/40 grayscale-[20%]' 
                        : ''
                    }`}
                  >
                    <td className="py-3.5">
                      <div className="flex items-center gap-3">
                        {usr.avatar ? (
                          <>
                            <img 
                              src={resolveImageUrl(usr.avatar)} 
                              alt="" 
                              className="w-9 h-9 rounded-full object-cover border border-white/10" 
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div 
                              className="w-9 h-9 rounded-full border border-purple-500/30 bg-purple-600/30 text-purple-200 flex items-center justify-center font-bold text-xs flex-shrink-0"
                              style={{ display: 'none' }}
                            >
                              {usr.fullname ? usr.fullname.charAt(0).toUpperCase() : 'U'}
                            </div>
                          </>
                        ) : (
                          <div className="w-9 h-9 rounded-full border border-purple-500/30 bg-purple-600/30 text-purple-200 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {usr.fullname ? usr.fullname.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}
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
                        <button
                          onClick={() => handleToggleStatus(usr)}
                          disabled={isSelf}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all ${isSelf ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          title={isSelf ? "Cannot change your own status" : "Click to suspend user"}
                        >
                          Active
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleStatus(usr)}
                          disabled={isSelf}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-500/20 text-slate-400 border border-slate-500/30 hover:bg-slate-500/30 transition-all ${isSelf ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          title={isSelf ? "Cannot change your own status" : "Click to activate user"}
                        >
                          Suspended
                        </button>
                      )}
                    </td>
                    <td className="py-3.5 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenView(usr)}
                          className="p-1.5 rounded glass-btn text-emerald-400 hover:border-emerald-500/40"
                          title="View user details"
                        >
                          <Eye size={12} />
                        </button>
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 pt-6 mt-4">
          <p className="text-xs text-slate-400 order-2 sm:order-1">
            Showing <span className="font-semibold text-white">{indexOfFirstItem + 1}</span> to{" "}
            <span className="font-semibold text-white">
              {Math.min(indexOfLastItem, totalItems)}
            </span>{" "}
            of <span className="font-semibold text-white">{totalItems}</span> users
          </p>
          <div className="flex items-center gap-1.5 order-1 sm:order-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-white/5 text-slate-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.05] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>
            
            {getVisiblePages().map(pageNumber => (
              <button
                key={pageNumber}
                onClick={() => setCurrentPage(pageNumber)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center border transition-all duration-200 ${
                  currentPage === pageNumber
                    ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20"
                    : "border-white/5 text-slate-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.05]"
                }`}
              >
                {pageNumber}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-white/5 text-slate-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.05] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

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
        currentUser={currentUser}
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
        deleteBlog={handleDeleteBlog}
        deleteUser={handleDeleteUser}
        currentUser={currentUser}
      />

      <UserViewModal
        isOpen={viewUserModalOpen}
        onClose={() => {
          setViewUserModalOpen(false);
          setSelectedUserForView(null);
        }}
        user={selectedUserForView}
        roles={roles}
        blogs={blogs}
        resolveImageUrl={resolveImageUrl}
      />
    </div>
  );
};

export default Users;

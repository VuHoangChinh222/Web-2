import React, { useState } from 'react';
import { Shield, ShieldAlert, CheckSquare, Square, Save, Plus, Edit2, Trash2 } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import GlassCard from '../../components/GlassCard';
import RoleFormModal from './RoleFormModal';
import roleService from '../../services/roleService';

const Roles = () => {
  const { roles, setRoles, users } = useAdmin();

  // List of all system entities for dynamic permissions
  const entities = [
    { key: 'Product', label: 'Products Catalog', desc: 'Full CRUD control over the products inventory, stock levels, and detail sheets.' },
    { key: 'CategoryProduct', label: 'Product Categories', desc: 'Classify and organize products catalog classifications.' },
    { key: 'ProductVariant', label: 'Product Variants', desc: 'Define variants like colors, sizes, and price modifiers.' },
    { key: 'ProductImage', label: 'Product Images', desc: 'Upload and manage image assets for products.' },
    { key: 'Order', label: 'Customer Orders', desc: 'Process customer checkouts and update payment/shipping statuses.' },
    { key: 'OrderDetail', label: 'Order Items & Details', desc: 'View specific products and quantities in customer orders.' },
    { key: 'Customer', label: 'Customers Directory', desc: 'Manage customer accounts, addresses, and profiles.' },
    { key: 'CategoryBlog', label: 'Blog Categories', desc: 'Group and classify marketing blog articles.' },
    { key: 'Blog', label: 'Blog Posts', desc: 'Publish, edit, and manage articles and promotions.' },
    { key: 'Banner', label: 'Banners & Promos', desc: 'Control homepage sliders and promotional images.' },
    { key: 'User', label: 'Staff Users', desc: 'Manage backend console administrator and employee users.' },
    { key: 'Role', label: 'Roles & Security', desc: 'Configure system roles, access policies, and permission groups.' }
  ];

  const systemPermissions = [
    { key: 'dashboard_view', label: 'View Dashboard Analytics', description: 'Access the main sales dashboard, trends, and quick summaries.' },
    ...entities.map(ent => ({
      key: `manage_${ent.key.toLowerCase()}`,
      label: `Manage ${ent.label}`,
      description: ent.desc
    }))
  ];

  // Active selected role for permission adjustment
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const activeRole = roles.find(r => r.id === selectedRoleId);

  // Temporary state for checkboxes
  const [tempPermissions, setTempPermissions] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // add or edit
  const [currentRole, setCurrentRole] = useState(null);

  // Auto-select first role when loaded
  React.useEffect(() => {
    if (!selectedRoleId && roles.length > 0) {
      setSelectedRoleId(roles[0].id);
    }
  }, [roles, selectedRoleId]);

  // Sync checkboxes when active role changes
  React.useEffect(() => {
    if (activeRole) {
      setTempPermissions(activeRole.permissions || []);
    }
  }, [activeRole]);

  const handleRoleChange = (roleId) => {
    setSelectedRoleId(roleId);
  };

  const handleTogglePermission = (permissionKey) => {
    // Ngăn chặn sửa đổi quyền của vai trò quản trị tối cao ROLE_ADMIN để bảo vệ an toàn hệ thống
    if (activeRole?.name === 'ROLE_ADMIN') {
      alert("The authority of the Super Admin role (ROLE_ADMIN) is default and cannot be changed.");
      return;
    }
    setTempPermissions(prev =>
      prev.includes(permissionKey)
        ? prev.filter(k => k !== permissionKey)
        : [...prev, permissionKey]
    );
  };

  const handleSave = async () => {
    if (!selectedRoleId) return;
    if (activeRole?.name === 'ROLE_ADMIN') {
      alert("Không thể lưu cấu hình quyền cho vai trò quản trị tối cao ROLE_ADMIN.");
      return;
    }
    try {
      const roleObj = roles.find(r => r.id === selectedRoleId);
      if (!roleObj) return;
      const body = {
        name: roleObj.name,
        description: roleObj.description,
        permissions: tempPermissions
      };
      const updated = await roleService.updatePermissions(selectedRoleId, body);
      setRoles(prev => prev.map(r => r.id === selectedRoleId ? { ...r, permissions: updated.permissions || [] } : r));
      alert(`Permissions configuration for role "${activeRole?.name}" has been saved successfully.`);
    } catch (err) {
      alert("Lỗi cập nhật quyền: " + err.message);
    }
  };

  // CRUD handlers
  const handleOpenAdd = () => {
    setModalType('add');
    setCurrentRole(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (role) => {
    if (role.name === 'ROLE_ADMIN') {
      alert("Cannot edit standard system admin role.");
      return;
    }
    setModalType('edit');
    setCurrentRole(role);
    setIsModalOpen(true);
  };

  const handleDeleteRole = async (role) => {
    if (role.name === 'ROLE_ADMIN') {
      alert("Cannot delete standard system admin role.");
      return;
    }
    const hasAssignedUsers = (users || []).some(u => u.roleId === role.id || u.role?.id === role.id);
    if (hasAssignedUsers) {
      alert("Cannot delete role: There are staff users currently assigned to this security role.");
      return;
    }
    if (confirm(`Are you sure you want to delete role "${role.name}"?`)) {
      try {
        await roleService.delete(role.id);
        setRoles(prev => prev.filter(r => r.id !== role.id));
      } catch (err) {
        alert("Lỗi khi xóa vai trò: " + err.message);
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (modalType === 'add') {
        const body = {
          name: formData.name,
          description: formData.description,
          permissions: []
        };
        const newRole = await roleService.create(body);
        setRoles(prev => [...prev, newRole]);
      } else {
        const body = {
          name: formData.name,
          description: formData.description,
          permissions: formData.permissions || []
        };
        const updated = await roleService.update(formData.id, body);
        setRoles(prev => prev.map(r => r.id === formData.id ? updated : r));
      }
    } catch (err) {
      alert("Lỗi thao tác vai trò: " + err.message);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Roles & Security</h2>
          <p className="text-xs text-slate-400">Configure administrative access boundaries and security roles</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="glass-btn-primary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 self-end sm:self-auto"
        >
          <Plus size={16} /> Create Role
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Select Role Card */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Security Roles</h3>
          <div className="space-y-3">
            {roles.map((r) => {
              const isActive = r.id === selectedRoleId;
              const isSystemAdmin = r.name === 'ROLE_ADMIN';
              return (
                <div
                  key={r.id}
                  className={`w-full p-4 rounded-xl border flex items-start justify-between gap-3 transition-all
                    ${isActive
                      ? 'bg-purple-900/10 border-purple-500/40 text-purple-300 shadow-md shadow-purple-500/5'
                      : 'bg-[#0F1224]/30 border-white/5 text-slate-400 hover:border-white/10 hover:text-slate-200'}`}
                >
                  <div className="cursor-pointer flex-1" onClick={() => handleRoleChange(r.id)}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Shield size={16} className={isActive ? 'text-purple-400' : 'text-slate-500'} />
                      <span className="font-bold text-sm text-white">{r.name}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-normal">{r.description}</p>
                  </div>
                  {!isSystemAdmin && (
                    <div className="flex flex-col gap-2 flex-shrink-0 justify-center">
                      <button
                        onClick={() => handleOpenEdit(r)}
                        className="p-1.5 rounded glass-btn text-blue-400 hover:border-blue-500/40"
                        title="Edit Role Name/Desc"
                      >
                        <Edit2 size={11} />
                      </button>
                      <button
                        onClick={() => handleDeleteRole(r)}
                        className="p-1.5 rounded glass-btn text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30"
                        title="Delete Role"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Permissions Checklist */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Permissions for: <strong className="text-purple-400">{activeRole?.name || 'No Role Selected'}</strong>
          </h3>

          <GlassCard hoverEffect={false} className="space-y-5">
            <div className="divide-y divide-white/5">
              {systemPermissions.map((perm) => {
                const isChecked = tempPermissions.includes(perm.key);
                return (
                  <div
                    key={perm.key}
                    onClick={() => handleTogglePermission(perm.key)}
                    className="flex items-start gap-3.5 py-4 cursor-pointer hover:bg-white/[0.01] transition-colors rounded-lg px-2 -mx-2"
                  >
                    <div className="mt-0.5 text-purple-400">
                      {isChecked ? (
                        <CheckSquare size={18} className="fill-purple-500/10" />
                      ) : (
                        <Square size={18} className="text-slate-500" />
                      )}
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${isChecked ? 'text-white' : 'text-slate-400'}`}>
                        {perm.label}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                        {perm.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-white/5 flex justify-end">
              <button
                onClick={handleSave}
                disabled={!selectedRoleId}
                className="glass-btn-primary px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={14} /> Save Permissions Configuration
              </button>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Role Add/Edit Modal */}
      <RoleFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        modalType={modalType}
        roleData={currentRole}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default Roles;

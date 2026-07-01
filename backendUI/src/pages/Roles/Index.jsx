import React, { useState } from 'react';
import { Shield, ShieldAlert, CheckSquare, Square, Save } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import GlassCard from '../../components/GlassCard';

const Roles = () => {
  const { roles, updateRolePermissions } = useAdmin();

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
    setTempPermissions(prev => 
      prev.includes(permissionKey)
        ? prev.filter(k => k !== permissionKey)
        : [...prev, permissionKey]
    );
  };

  const handleSave = async () => {
    const res = await updateRolePermissions(selectedRoleId, tempPermissions);
    if (res && res.success) {
      alert(`Quyền truy cập cho vai trò "${activeRole?.name}" đã được lưu thành công vào cơ sở dữ liệu.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-wide">Roles & Security</h2>
        <p className="text-xs text-slate-400">Configure administrative access boundaries and security roles</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Select Role Card */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Security Roles</h3>
          <div className="space-y-3">
            {roles.map((r) => {
              const isActive = r.id === selectedRoleId;
              return (
                <button
                  key={r.id}
                  onClick={() => handleRoleChange(r.id)}
                  className={`w-full text-left p-4 rounded-xl transition-all border
                    ${isActive 
                      ? 'bg-purple-900/10 border-purple-500/40 text-purple-300 shadow-md shadow-purple-500/5' 
                      : 'bg-[#0F1224]/30 border-white/5 text-slate-400 hover:border-white/10 hover:text-slate-200'}`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Shield size={16} className={isActive ? 'text-purple-400' : 'text-slate-500'} />
                    <span className="font-bold text-sm text-white">{r.name}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-normal">{r.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Permissions Checklist */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Permissions for: <strong className="text-purple-400">{activeRole?.name}</strong>
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
                className="glass-btn-primary px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Save size={14} /> Save Permissions Configuration
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Roles;

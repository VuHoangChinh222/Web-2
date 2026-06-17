import React, { useState } from 'react';
import { Shield, ShieldAlert, CheckSquare, Square, Save } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import GlassCard from '../components/GlassCard';

const Roles = () => {
  const { roles, updateRolePermissions } = useAdmin();

  // List of all system capabilities/permissions
  const systemPermissions = [
    { key: 'dashboard_view', label: 'View Dashboard Analytics', description: 'Access the main sales dashboard, trends, and quick summaries.' },
    { key: 'products_manage', label: 'Manage Products & Categories', description: 'Full CRUD control over the products catalog, stock counts, and classifications.' },
    { key: 'orders_manage', label: 'Process Customer Orders', description: 'Access orders list, change status (Pending, Completed, Cancelled), and view invoices.' },
    { key: 'customers_manage', label: 'Manage Customer Directory', description: 'Monitor customer profiles, contact credentials, and purchasing histories.' },
    { key: 'blogs_manage', label: 'Publish Marketing Blogs', description: 'Create and edit blog posts, categories, and set publication statuses.' },
    { key: 'banners_manage', label: 'Configure Banners & Promo', description: 'Design homepage promotional sliders, set redirect targets, and active states.' },
    { key: 'users_manage', label: 'Administrate Staff Access', description: 'Add/suspend backend system users, adjust roles, and security policies.' }
  ];

  // Active selected role for permission adjustment
  const [selectedRoleId, setSelectedRoleId] = useState(roles[0]?.id || '');
  const activeRole = roles.find(r => r.id === selectedRoleId);
  
  // Temporary state for checkboxes
  const [tempPermissions, setTempPermissions] = useState(activeRole?.permissions || []);

  const handleRoleChange = (roleId) => {
    setSelectedRoleId(roleId);
    const roleObj = roles.find(r => r.id === roleId);
    setTempPermissions(roleObj?.permissions || []);
  };

  const handleTogglePermission = (permissionKey) => {
    setTempPermissions(prev => 
      prev.includes(permissionKey)
        ? prev.filter(k => k !== permissionKey)
        : [...prev, permissionKey]
    );
  };

  const handleSave = () => {
    updateRolePermissions(selectedRoleId, tempPermissions);
    alert(`Permissions for role "${activeRole?.name}" have been updated successfully.`);
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

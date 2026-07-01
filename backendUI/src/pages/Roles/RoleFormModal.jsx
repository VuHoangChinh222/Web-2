import React, { useState, useEffect } from 'react';
import GlassModal from '../../components/GlassModal';

const RoleFormModal = ({
  isOpen,
  onClose,
  modalType,
  roleData,
  onSubmit
}) => {
  const [form, setForm] = useState({
    id: '',
    name: '',
    description: '',
    permissions: []
  });

  useEffect(() => {
    if (isOpen) {
      if (modalType === 'add') {
        setForm({
          id: '',
          name: '',
          description: '',
          permissions: []
        });
      } else if (roleData) {
        setForm({
          id: roleData.id || '',
          name: roleData.name || '',
          description: roleData.description || '',
          permissions: roleData.permissions || []
        });
      }
    }
  }, [isOpen, modalType, roleData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name) {
      alert("Role name is required.");
      return;
    }
    onSubmit(form);
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={modalType === 'add' ? 'Create New Security Role' : 'Edit Security Role'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Role Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. ROLE_SUPPORT"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 rounded-lg text-xs glass-input"
            disabled={modalType === 'edit' && form.name === 'ROLE_ADMIN'}
          />
          <span className="text-[9px] text-slate-500 block">Convention: Starts with ROLE_ (e.g. ROLE_SALES, ROLE_EDITOR)</span>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</label>
          <textarea
            rows="3"
            placeholder="Describe the operational access boundaries of this role..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 rounded-lg text-xs glass-input"
          />
        </div>

        {/* Submit controls */}
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
            Save Role
          </button>
        </div>
      </form>
    </GlassModal>
  );
};

export default RoleFormModal;

import React, { useState, useEffect } from 'react';
import GlassModal from '../../components/GlassModal';
import { useAdmin } from '../../context/AdminContext';

const CustomerFormModal = ({
  isOpen,
  onClose,
  modalType,
  customerData,
  resolveImageUrl,
  uploadImage,
  onSubmit
}) => {
  const { userAddresses } = useAdmin();

  const [form, setForm] = useState({
    id: '',
    fullname: '',
    email: '',
    phone: '',
    password: '',
    active: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
  });

  // Administrative data states
  const [vnData, setVnData] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState('');
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [selectedWardId, setSelectedWardId] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [addressLine, setAddressLine] = useState('');

  // Fetch VN administrative geography data
  const fetchVnData = async () => {
    try {
      const res = await fetch('https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json');
      if (res.ok) {
        const rawData = await res.json();
        const processed = preprocessVnData(rawData);
        setVnData(processed);
        setProvinces(processed);
      }
    } catch (err) {
      console.error("Failed to load VN geography data", err);
    }
  };

  const preprocessVnData = (data) => {
    if (!Array.isArray(data)) return [];
    let processed = JSON.parse(JSON.stringify(data));
    
    // Rename Dong Nai
    processed = processed.map(prov => {
      if (prov.Name && prov.Name.includes("Đồng Nai")) {
        return { ...prov, Name: "Thành phố Đồng Nai" };
      }
      return prov;
    });

    // Merge Ba Ria - Vung Tau and Binh Duong into HCMC
    const hcmc = processed.find(p => p.Name && p.Name.includes("Hồ Chí Minh"));
    const baria = processed.find(p => p.Name && p.Name.includes("Bà Rịa"));
    const binhduong = processed.find(p => p.Name && p.Name.includes("Bình Dương"));

    if (hcmc) {
      let extraDistricts = [];
      if (baria && Array.isArray(baria.Districts)) {
        extraDistricts = [...extraDistricts, ...baria.Districts];
      }
      if (binhduong && Array.isArray(binhduong.Districts)) {
        extraDistricts = [...extraDistricts, ...binhduong.Districts];
      }
      hcmc.Districts = [...(hcmc.Districts || []), ...extraDistricts];
    }

    processed = processed.filter(prov => {
      const isBaria = prov.Name && prov.Name.includes("Bà Rịa");
      const isBinhduong = prov.Name && prov.Name.includes("Bình Dương");
      return !isBaria && !isBinhduong;
    });

    return processed;
  };

  const cleanName = (name) => {
    if (!name) return '';
    return name
      .toLowerCase()
      .replace('tỉnh', '')
      .replace('thành phố', '')
      .replace('thị xã', '')
      .replace('quận', '')
      .replace('huyện', '')
      .replace('phường', '')
      .replace('xã', '')
      .replace('thị trấn', '')
      .trim();
  };

  useEffect(() => {
    if (isOpen) {
      fetchVnData();
      if (modalType === 'add') {
        setForm({
          id: '',
          fullname: '',
          email: '',
          phone: '',
          password: '',
          active: true,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
        });
        setCity('');
        setDistrict('');
        setWard('');
        setAddressLine('');
        setSelectedProvinceId('');
        setSelectedDistrictId('');
        setSelectedWardId('');
        setDistricts([]);
        setWards([]);
      } else if (customerData) {
        setForm({
          id: customerData.id || '',
          fullname: customerData.fullname || '',
          email: customerData.email || '',
          phone: customerData.phone || '',
          password: '',
          active: customerData.active,
          avatar: customerData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
        });

        // Find default address from userAddresses
        const defaultAddr = (userAddresses || []).find(addr =>
          (addr.customerId === customerData.id || addr.customer?.id === customerData.id) && addr.isDefault
        ) || (userAddresses || []).find(addr =>
          (addr.customerId === customerData.id || addr.customer?.id === customerData.id)
        );

        if (defaultAddr) {
          setCity(defaultAddr.city || '');
          setDistrict(defaultAddr.district || '');
          setWard(defaultAddr.ward || '');
          setAddressLine(defaultAddr.addressLine || '');
        } else {
          setCity('');
          setDistrict('');
          setWard('');
          setAddressLine('');
        }
      }
    }
  }, [isOpen, modalType, customerData, userAddresses]);

  // Synchronize dropdowns during Edit
  useEffect(() => {
    if (isOpen && modalType === 'edit' && vnData.length > 0 && customerData) {
      const defaultAddr = (userAddresses || []).find(addr =>
        (addr.customerId === customerData.id || addr.customer?.id === customerData.id) && addr.isDefault
      ) || (userAddresses || []).find(addr =>
        (addr.customerId === customerData.id || addr.customer?.id === customerData.id)
      );

      if (defaultAddr) {
        const foundProv = vnData.find(p => cleanName(p.Name) === cleanName(defaultAddr.city));
        if (foundProv) {
          setSelectedProvinceId(foundProv.Id);
          const provDistricts = foundProv.Districts || [];
          setDistricts(provDistricts);

          const foundDist = provDistricts.find(d => cleanName(d.Name) === cleanName(defaultAddr.district));
          if (foundDist) {
            setSelectedDistrictId(foundDist.Id);
            const distWards = foundDist.Wards || [];
            setWards(distWards);

            const foundWard = distWards.find(w => cleanName(w.Name) === cleanName(defaultAddr.ward));
            if (foundWard) {
              setSelectedWardId(foundWard.Id);
            } else {
              setSelectedWardId('');
            }
          } else {
            setSelectedDistrictId('');
            setWards([]);
            setSelectedWardId('');
          }
        } else {
          setSelectedProvinceId('');
          setDistricts([]);
          setSelectedDistrictId('');
          setWards([]);
          setSelectedWardId('');
        }
      }
    }
  }, [isOpen, modalType, vnData, customerData, userAddresses]);

  const handleProvinceChange = (e) => {
    const provId = e.target.value;
    setSelectedProvinceId(provId);
    setSelectedDistrictId('');
    setSelectedWardId('');
    setWards([]);

    if (provId) {
      const prov = provinces.find(p => p.Id === provId);
      setCity(prov.Name);
      setDistricts(prov.Districts || []);
      setDistrict('');
      setWard('');
    } else {
      setCity('');
      setDistricts([]);
      setDistrict('');
      setWard('');
    }
  };

  const handleDistrictChange = (e) => {
    const distId = e.target.value;
    setSelectedDistrictId(distId);
    setSelectedWardId('');

    if (distId) {
      const dist = districts.find(d => d.Id === distId);
      setDistrict(dist.Name);
      setWards(dist.Wards || []);
      setWard('');
    } else {
      setDistrict('');
      setWards([]);
      setWard('');
    }
  };

  const handleWardChange = (e) => {
    const wId = e.target.value;
    setSelectedWardId(wId);

    if (wId) {
      const w = wards.find(wd => wd.Id === wId);
      setWard(w.Name);
    } else {
      setWard('');
    }
  };

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
    if (modalType === 'add' && (!form.password || form.password.trim() === '')) {
      alert("Password is required when adding a new customer.");
      return;
    }
    onSubmit({
      ...form,
      city,
      district,
      ward,
      addressLine
    });
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
            onChange={(e) => setForm({ ...form, fullname: e.target.value })}
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
              onChange={(e) => setForm({ ...form, email: e.target.value })}
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
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-xs glass-input"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {modalType === 'add' ? 'Password *' : 'Password (leave blank to keep unchanged)'}
          </label>
          <input
            type="password"
            required={modalType === 'add'}
            placeholder={modalType === 'add' ? "••••••••" : "Leave blank to keep unchanged"}
            value={form.password || ''}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-3 py-2 rounded-lg text-xs glass-input"
          />
        </div>

        {/* Address Selection Dropdowns */}
        <div className="space-y-3 p-3 border border-white/5 bg-white/[0.01] rounded-xl">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Default Shipping Address</h4>
          
          <div className="grid grid-cols-3 gap-3">
            {/* Province / City */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Province/City</label>
              <select
                value={selectedProvinceId}
                onChange={handleProvinceChange}
                className="w-full px-2 py-1.5 rounded-lg text-xs glass-input bg-[#0F1224] text-white"
              >
                <option value="" className="bg-[#0F1224] text-white">Select City</option>
                {provinces.map(p => (
                  <option key={p.Id} value={p.Id} className="bg-[#0F1224] text-white">{p.Name}</option>
                ))}
              </select>
            </div>

            {/* District */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">District</label>
              <select
                value={selectedDistrictId}
                onChange={handleDistrictChange}
                disabled={!selectedProvinceId}
                className="w-full px-2 py-1.5 rounded-lg text-xs glass-input bg-[#0F1224] text-white disabled:opacity-50"
              >
                <option value="" className="bg-[#0F1224] text-white">Select District</option>
                {districts.map(d => (
                  <option key={d.Id} value={d.Id} className="bg-[#0F1224] text-white">{d.Name}</option>
                ))}
              </select>
            </div>

            {/* Ward / Commune */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Ward</label>
              <select
                value={selectedWardId}
                onChange={handleWardChange}
                disabled={!selectedDistrictId}
                className="w-full px-2 py-1.5 rounded-lg text-xs glass-input bg-[#0F1224] text-white disabled:opacity-50"
              >
                <option value="" className="bg-[#0F1224] text-white">Select Ward</option>
                {wards.map(w => (
                  <option key={w.Id} value={w.Id} className="bg-[#0F1224] text-white">{w.Name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Address Details (Street, House No.)</label>
            <input
              type="text"
              placeholder="e.g. 123 Nguyễn Trãi"
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg text-xs glass-input"
            />
          </div>
        </div>

        {/* Status */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Customer Status</label>
          <select
            value={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.value === 'true' })}
            className="w-full px-3 py-2 rounded-lg text-xs glass-input bg-[#0F1224] text-white"
          >
            <option value="true" className="bg-[#0F1224] text-white">Active (Access Allowed)</option>
            <option value="false" className="bg-[#0F1224] text-white">Suspended (Access Revoked)</option>
          </select>
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

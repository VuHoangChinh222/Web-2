import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Edit2, Trash2, Check, Loader2 } from 'lucide-react';
import GlassModal from '../../components/GlassModal';
import userAddressService from '../../services/userAddressService';

const CustomerAddressModal = ({ isOpen, onClose, customer, onAddressChanged }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState('add'); // 'add' | 'edit'
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  // Form states
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);

  // Administrative data states
  const [vnData, setVnData] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState('');
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [selectedWardId, setSelectedWardId] = useState('');

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

  // Load addresses when customer selection changes
  const fetchCustomerAddresses = async () => {
    if (!customer) return;
    setLoading(true);
    try {
      const res = await userAddressService.getByCustomer(customer.id);
      // Sort: defaults first, then by ID desc
      const data = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
      const sorted = data.sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return b.id - a.id;
      });
      setAddresses(sorted);
    } catch (err) {
      console.error("Failed to load customer addresses", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && customer) {
      fetchCustomerAddresses();
      fetchVnData();
      setIsFormOpen(false);
    }
  }, [isOpen, customer]);

  // Synchronize dropdowns during Edit
  useEffect(() => {
    if (isFormOpen && formType === 'edit' && selectedAddressId && vnData.length > 0) {
      const addr = addresses.find(a => a.id === selectedAddressId);
      if (addr) {
        // Find Province
        const foundProv = vnData.find(p => cleanName(p.Name) === cleanName(addr.city));
        if (foundProv) {
          setSelectedProvinceId(foundProv.Id);
          const provDistricts = foundProv.Districts || [];
          setDistricts(provDistricts);

          // Find District
          const foundDist = provDistricts.find(d => cleanName(d.Name) === cleanName(addr.district));
          if (foundDist) {
            setSelectedDistrictId(foundDist.Id);
            const distWards = foundDist.Wards || [];
            setWards(distWards);

            // Find Ward
            const foundWard = distWards.find(w => cleanName(w.Name) === cleanName(addr.ward));
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
  }, [isFormOpen, formType, selectedAddressId, vnData, addresses]);

  const handleOpenAdd = () => {
    setFormType('add');
    setSelectedAddressId(null);
    setRecipientName(customer?.fullname || customer?.fullName || '');
    setRecipientPhone(customer?.phone || '');
    setCity('');
    setDistrict('');
    setWard('');
    setAddressLine('');
    setIsDefault(addresses.length === 0);
    setSelectedProvinceId('');
    setSelectedDistrictId('');
    setSelectedWardId('');
    setDistricts([]);
    setWards([]);
    setErrorMsg('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (addr) => {
    setFormType('edit');
    setSelectedAddressId(addr.id);
    setRecipientName(addr.recipientName);
    setRecipientPhone(addr.recipientPhone);
    setCity(addr.city);
    setDistrict(addr.district);
    setWard(addr.ward);
    setAddressLine(addr.addressLine);
    setIsDefault(addr.isDefault);
    setErrorMsg('');
    setIsFormOpen(true);
  };

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

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!recipientName.trim()) {
      setErrorMsg("Recipient name cannot be empty!");
      return;
    }
    if (!recipientPhone.trim()) {
      setErrorMsg("Recipient phone number cannot be empty!");
      return;
    }
    if (!/^(0|\+84)[0-9]{9}$/.test(recipientPhone.trim())) {
      setErrorMsg("Invalid phone number format!");
      return;
    }
    if (!addressLine.trim()) {
      setErrorMsg("Address line cannot be empty!");
      return;
    }
    if (!city || !district || !ward) {
      setErrorMsg("Please select all region fields!");
      return;
    }

    setSaving(true);
    const addressData = {
      customerId: customer.id,
      recipientName: recipientName.trim(),
      recipientPhone: recipientPhone.trim(),
      addressLine: addressLine.trim(),
      ward,
      district,
      city,
      isDefault
    };

    try {
      if (formType === 'add') {
        await userAddressService.create(addressData);
      } else {
        await userAddressService.update(selectedAddressId, addressData);
      }
      setIsFormOpen(false);
      fetchCustomerAddresses();
      if (onAddressChanged) onAddressChanged();
    } catch (err) {
      console.error("Error saving address", err);
      setErrorMsg(err.response?.data?.message || "An error occurred, please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (addr) => {
    try {
      const addressData = {
        customerId: customer.id,
        recipientName: addr.recipientName,
        recipientPhone: addr.recipientPhone,
        addressLine: addr.addressLine,
        ward: addr.ward,
        district: addr.district,
        city: addr.city,
        isDefault: true
      };
      await userAddressService.update(addr.id, addressData);
      fetchCustomerAddresses();
      if (onAddressChanged) onAddressChanged();
    } catch (err) {
      console.error("Error setting default address", err);
    }
  };

  const handleDeleteAddress = async (addrId, isDef) => {
    if (isDef) {
      alert("Cannot delete the default address!");
      return;
    }
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        await userAddressService.delete(addrId);
        fetchCustomerAddresses();
        if (onAddressChanged) onAddressChanged();
      } catch (err) {
        console.error("Error deleting address", err);
      }
    }
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Shipping Addresses: ${customer?.fullname || customer?.fullName || ''}`}
    >
      <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {isFormOpen ? (
          /* Form Add/Edit */
          <form onSubmit={handleSaveAddress} className="space-y-4 border border-white/10 rounded-xl p-4 bg-white/[0.02]">
            <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider">
              {formType === 'add' ? 'Add New Address' : 'Update Address'}
            </h3>

            {errorMsg && (
              <div className="p-2.5 rounded-lg text-xs font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Recipient Name *</label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg text-xs glass-input"
                  placeholder="Full name"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg text-xs glass-input"
                  placeholder="Phone number"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Province / City */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Province/City *</label>
                <select
                  value={selectedProvinceId}
                  onChange={handleProvinceChange}
                  className="w-full px-2 py-1.5 rounded-lg text-xs glass-input bg-[#0F1224] text-white"
                >
                  <option value="" className="bg-[#0F1224] text-white">Select Province/City</option>
                  {provinces.map(p => (
                    <option key={p.Id} value={p.Id} className="bg-[#0F1224] text-white">{p.Name}</option>
                  ))}
                </select>
              </div>

              {/* District */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">District *</label>
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
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ward/Commune *</label>
                <select
                  value={selectedWardId}
                  onChange={handleWardChange}
                  disabled={!selectedDistrictId}
                  className="w-full px-2 py-1.5 rounded-lg text-xs glass-input bg-[#0F1224] text-white disabled:opacity-50"
                >
                  <option value="" className="bg-[#0F1224] text-white">Select Ward/Commune</option>
                  {wards.map(w => (
                    <option key={w.Id} value={w.Id} className="bg-[#0F1224] text-white">{w.Name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Address Details (Street, House No.) *</label>
              <input
                type="text"
                required
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg text-xs glass-input"
                placeholder="House number, street name, lane..."
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="admin-addr-default"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="rounded border-white/10 bg-white/5 text-purple-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <label htmlFor="admin-addr-default" className="text-xs text-slate-300 cursor-pointer select-none">
                Set as default shipping address
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="glass-btn px-4 py-1.5 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="glass-btn-primary px-4 py-1.5 rounded-lg text-xs flex items-center gap-1"
              >
                {saving && <Loader2 size={12} className="animate-spin" />}
                Save Address
              </button>
            </div>
          </form>
        ) : (
          /* Address List */
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Customer Address List ({addresses.length})
              </span>
              <button
                onClick={handleOpenAdd}
                className="glass-btn-primary px-3 py-1.5 rounded-lg text-xs flex items-center gap-1"
              >
                <Plus size={14} /> Add Address
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-10 text-slate-500">
                <Loader2 size={24} className="animate-spin mr-2" />
                <span>Loading address list...</span>
              </div>
            ) : addresses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 border border-white/5 bg-white/[0.01] rounded-xl text-slate-500 text-xs">
                <MapPin size={24} className="mb-2 opacity-50" />
                <span>No addresses configured for this customer yet.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`p-3.5 rounded-xl border transition-colors flex items-start justify-between gap-4 ${
                      addr.isDefault
                        ? 'border-purple-500/30 bg-purple-500/[0.03]'
                        : 'border-white/5 bg-white/[0.01] hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{addr.recipientName}</span>
                        <span className="text-xs text-slate-400">({addr.recipientPhone})</span>
                        {addr.isDefault && (
                          <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {addr.addressLine}, {addr.ward}, {addr.district}, {addr.city}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(addr)}
                          className="p-1.5 rounded-md hover:bg-white/5 text-blue-400 hover:text-blue-300"
                          title="Edit Address"
                        >
                          <Edit2 size={12} />
                        </button>
                        {!addr.isDefault && (
                          <button
                            onClick={() => handleDeleteAddress(addr.id, addr.isDefault)}
                            className="p-1.5 rounded-md hover:bg-white/5 text-rose-400 hover:text-rose-300"
                            title="Delete Address"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                      {!addr.isDefault && (
                        <button
                          onClick={() => handleSetDefault(addr)}
                          className="text-[10px] font-semibold text-purple-400 hover:text-purple-300"
                        >
                          Set Default
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </GlassModal>
  );
};

export default CustomerAddressModal;

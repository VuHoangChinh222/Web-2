/* 
 * SHIPPINGFORM COMPONENT - WITH SHOPEE STYLE SAVED ADDRESS SELECTOR & INLINE ADD ADDRESS
 * Sinh viên: Vũ Hoàng Chính
 * Môn học: Chuyên đề WEB 2 & ReactJS
 */

import React, { useState, useEffect } from 'react';
import userAddressService from '../../services/userAddressService';
import '../../assets/css/AddressManagement.css';

const ShippingForm = ({
  handleSubmit,
  fullName,
  setFullName,
  phone,
  setPhone,
  address,
  setAddress,
  notes,
  setNotes,
  navigate,
  errorMessage,
  addresses = [],
  customer,
  refreshAddresses
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // States cho modal thêm địa chỉ mới
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);

  // Dropdown IDs dữ liệu hành chính VN
  const [vnData, setVnData] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedProvinceId, setSelectedProvinceId] = useState('');
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [selectedWardId, setSelectedWardId] = useState('');

  const handleSelectAddress = (addr) => {
    setFullName(addr.recipientName);
    setPhone(addr.recipientPhone);
    setAddress(`${addr.addressLine}, ${addr.ward}, ${addr.district}, ${addr.city}`);
    setIsModalOpen(false);
  };

  const preprocessVnData = (data) => {
    if (!Array.isArray(data)) return [];

    // Clone data to avoid mutating original
    let processed = JSON.parse(JSON.stringify(data));

    // 1. Rename "Tỉnh Đồng Nai" to "Thành phố Đồng Nai"
    processed = processed.map(prov => {
      if (prov.Name && prov.Name.includes("Đồng Nai")) {
        return { ...prov, Name: "Thành phố Đồng Nai" };
      }
      return prov;
    });

    // 2. Merge "Bà Rịa - Vũng Tàu" and "Bình Dương" into "Thành phố Hồ Chí Minh"
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

    // 3. Remove "Bà Rịa - Vũng Tàu" and "Bình Dương" from the top-level list
    processed = processed.filter(prov => {
      const isBaria = prov.Name && prov.Name.includes("Bà Rịa");
      const isBinhduong = prov.Name && prov.Name.includes("Bình Dương");
      return !isBaria && !isBinhduong;
    });

    return processed;
  };

  // Mở modal thêm địa chỉ mới và tải dữ liệu hành chính
  const handleOpenAddModal = async () => {
    setRecipientName(customer?.fullName || '');
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
    setIsAddModalOpen(true);

    if (vnData.length === 0) {
      try {
        const res = await fetch('https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json');
        if (res.ok) {
          const rawData = await res.json();
          const data = preprocessVnData(rawData);
          setVnData(data);
          setProvinces(data);
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu hành chính:", err);
      }
    }
  };

  // Dropdown handlers
  const handleProvinceChange = (e) => {
    const provId = e.target.value;
    setSelectedProvinceId(provId);
    setSelectedDistrictId('');
    setSelectedWardId('');
    setWards([]);

    if (provId) {
      const province = provinces.find(p => p.Id === provId);
      setCity(province.Name);
      setDistricts(province.Districts || []);
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

  // Submit lưu địa chỉ mới từ checkout
  const handleSaveNewAddress = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!recipientName.trim()) {
      setErrorMsg("Họ và tên người nhận không được để trống!");
      return;
    }
    if (!recipientPhone.trim()) {
      setErrorMsg("Số điện thoại không được để trống!");
      return;
    }
    if (!/^(0|\+84)[0-9]{9}$/.test(recipientPhone.trim())) {
      setErrorMsg("Số điện thoại không đúng định dạng (Ví dụ: 0912345678)!");
      return;
    }
    if (!addressLine.trim()) {
      setErrorMsg("Vui lòng nhập số nhà, tên đường cụ thể!");
      return;
    }
    if (!city || !district || !ward) {
      setErrorMsg("Vui lòng chọn đầy đủ Tỉnh/Thành, Quận/Huyện, Xã/Phường!");
      return;
    }

    setSaving(true);
    const newAddress = {
      customerId: customer.id,
      recipientName: recipientName.trim(),
      recipientPhone: recipientPhone.trim(),
      addressLine: addressLine.trim(),
      ward: ward,
      district: district,
      city: city,
      isDefault: isDefault
    };

    try {
      const created = await userAddressService.create(newAddress);
      alert("Thêm địa chỉ giao hàng thành công!");
      setIsAddModalOpen(false);
      if (refreshAddresses) {
        await refreshAddresses(customer.id, created.id);
      }
    } catch (err) {
      console.error("Lỗi khi tạo địa chỉ mới từ Checkout:", err);
      setErrorMsg("Đã xảy ra lỗi hệ thống, vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="form-card checkout-form-card">
      {errorMessage && (
        <div className="checkout-error-alert">
          <i className="fa-solid fa-triangle-exclamation checkout-error-icon"></i> {errorMessage}
        </div>
      )}

      {/* Shopee-style Selected Address Section */}
      {addresses.length > 0 ? (
        <div className="selected-address-card" style={{
          border: '1px solid var(--accent, #f97316)',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 1) 0%, rgba(249, 115, 22, 0.04) 100%)',
          boxShadow: '0 4px 15px rgba(249, 115, 22, 0.15)',
          position: 'relative'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px',
            color: 'var(--accent, #f97316)',
            fontWeight: '800',
            fontSize: '0.95rem',
            letterSpacing: '0.5px'
          }}>
            <i className="fa-solid fa-location-dot"></i> ĐỊA CHỈ NHẬN HÀNG
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '15px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-main, #f8fafc)' }}>
                {fullName} <span style={{ color: 'var(--text-muted, #94a3b8)', fontWeight: '500', fontSize: '0.95rem', marginLeft: '10px' }}>| {phone}</span>
              </div>
              <div style={{ marginTop: '8px', fontSize: '0.95rem', color: 'var(--text-main, #f8fafc)', lineHeight: '1.5' }}>
                {address}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              style={{
                background: 'transparent',
                border: '1px solid var(--accent)',
                color: 'var(--accent)',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer',
                padding: '6px 14px',
                borderRadius: '6px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'var(--accent)';
                e.target.style.color = '#fff';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = 'var(--accent)';
              }}
            >
              Thay đổi
            </button>
          </div>
        </div>
      ) : (
        <div style={{
          padding: '2rem 1.5rem',
          borderRadius: '12px',
          background: 'var(--bg-card)',
          border: '2px dashed var(--border-color)',
          marginBottom: '1.5rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}>
          <i className="fa-solid fa-map-location-dot" style={{ fontSize: '2.5rem', color: 'var(--text-muted)', opacity: 0.5 }}></i>
          <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Bạn chưa cấu hình địa chỉ nhận hàng nào.</span>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleOpenAddModal}
            style={{ padding: '8px 20px', fontSize: '0.85rem', textTransform: 'none' }}
          >
            <i className="fa-solid fa-plus"></i> Thêm địa chỉ mới
          </button>
        </div>
      )}

      {/* Main Order Form */}
      <form onSubmit={handleSubmit}>

        {/* Order Notes Field */}
        <div className="form-group" style={{ marginTop: '1rem' }}>
          <label>Ghi chú đơn hàng (Tùy chọn)</label>
          <textarea
            className="form-input"
            rows="4"
            placeholder="Ghi chú về thời gian nhận hàng, chỉ dẫn giao hàng chi tiết..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </div>

        <div className="checkout-actions-row">
          <button type="button" className="btn btn-outline checkout-action-btn" onClick={() => navigate('cart')}>
            Quay lại giỏ hàng
          </button>
          <button type="submit" className="btn btn-primary checkout-action-btn" disabled={addresses.length === 0}>
            Xác nhận thanh toán
          </button>
        </div>
      </form>

      {/* Shopee-style Address Selector Modal */}
      {isModalOpen && (
        <div className="address-modal-overlay">
          <div className="address-modal-card" style={{ maxWidth: '540px' }}>
            <h3 className="address-modal-title">
              Địa Chỉ Của Tôi
            </h3>

            <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px' }}>
              {addresses.map((addr) => {
                const formattedAddrStr = `${addr.addressLine}, ${addr.ward}, ${addr.district}, ${addr.city}`;
                const isSelected = address === formattedAddrStr;
                return (
                  <div
                    key={addr.id}
                    onClick={() => handleSelectAddress(addr)}
                    className={`address-item-card ${addr.isDefault ? 'is-default-card' : ''}`}
                    style={{
                      cursor: 'pointer',
                      borderWidth: isSelected ? '2px' : '1px',
                      borderColor: isSelected ? 'var(--accent)' : 'var(--border-color)',
                      padding: '1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <span style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '1rem' }}>{addr.recipientName}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{addr.recipientPhone}</span>
                        {addr.isDefault && (
                          <span className="badge-default" style={{ padding: '1px 6px', fontSize: '0.7rem' }}>Mặc định</span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
                        {addr.addressLine}<br />
                        {addr.ward}, {addr.district}, {addr.city}
                      </div>
                    </div>
                    {isSelected && (
                      <i className="fa-solid fa-circle-check" style={{ color: 'var(--accent)', fontSize: '1.3rem', marginLeft: '10px' }}></i>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid var(--border-color)' }}>
              <button
                type="button"
                className="btn-action-text"
                onClick={() => {
                  setIsModalOpen(false);
                  handleOpenAddModal();
                }}
                style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <i className="fa-solid fa-plus"></i> Thêm địa chỉ mới
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsModalOpen(false)}
                style={{ padding: '6px 15px', borderRadius: '6px', fontSize: '0.85rem' }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Smart Dropdowns Address Creation Modal */}
      {isAddModalOpen && (
        <div className="address-modal-overlay">
          <div className="address-modal-card">
            <h3 className="address-modal-title">
              Thêm Địa Chỉ Mới
            </h3>

            {errorMsg && (
              <div className="checkout-error-alert" style={{ margin: '10px 0 0 0' }}>
                <i className="fa-solid fa-circle-exclamation"></i> {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveNewAddress} className="address-form-grid" style={{ marginTop: '1rem' }}>

              {/* Họ tên người nhận */}
              <div className="form-group">
                <label>Họ và tên người nhận <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nhập họ và tên người nhận"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                />
              </div>

              {/* Điện thoại liên hệ */}
              <div className="form-group">
                <label>Số điện thoại liên hệ <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="Ví dụ: 0912345678"
                  required
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                />
              </div>

              {/* Tỉnh / Thành phố */}
              <div className="form-group">
                <label>Tỉnh / Thành phố <span style={{ color: '#ef4444' }}>*</span></label>
                {provinces.length > 0 ? (
                  <select
                    className="form-select"
                    required
                    value={selectedProvinceId}
                    onChange={handleProvinceChange}
                  >
                    <option value="">Chọn Tỉnh / Thành phố</option>
                    {provinces.map(p => (
                      <option key={p.Id} value={p.Id}>{p.Name}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Nhập Tỉnh/Thành phố"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                )}
              </div>

              {/* Quận / Huyện */}
              <div className="form-group">
                <label>Quận / Huyện <span style={{ color: '#ef4444' }}>*</span></label>
                {provinces.length > 0 ? (
                  <select
                    className="form-select"
                    required
                    value={selectedDistrictId}
                    onChange={handleDistrictChange}
                    disabled={!selectedProvinceId}
                  >
                    <option value="">Chọn Quận / Huyện</option>
                    {districts.map(d => (
                      <option key={d.Id} value={d.Id}>{d.Name}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Nhập Quận/Huyện"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                  />
                )}
              </div>

              {/* Phường / Xã */}
              <div className="form-group">
                <label>Phường / Xã <span style={{ color: '#ef4444' }}>*</span></label>
                {provinces.length > 0 ? (
                  <select
                    className="form-select"
                    required
                    value={selectedWardId}
                    onChange={handleWardChange}
                    disabled={!selectedDistrictId}
                  >
                    <option value="">Chọn Phường / Xã</option>
                    {wards.map(w => (
                      <option key={w.Id} value={w.Id}>{w.Name}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Nhập Phường/Xã"
                    required
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                  />
                )}
              </div>

              {/* Địa chỉ chi tiết */}
              <div className="form-group form-group-full">
                <label>Địa chỉ cụ thể (Số nhà, đường) <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Số nhà, tên ngõ, tên đường..."
                  required
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                />
              </div>

              {/* Đặt làm mặc định checkbox */}
              <div className="form-group form-group-full" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="checkoutIsDefaultCheckbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="checkoutIsDefaultCheckbox" style={{ cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  Đặt làm địa chỉ mặc định
                </label>
              </div>

              {/* Actions */}
              <div className="address-form-actions form-group-full">
                <button type="button" className="btn btn-outline" onClick={() => setIsAddModalOpen(false)} disabled={saving}>
                  Trở Lại
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Đang lưu...' : 'Hoàn thành'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ShippingForm;

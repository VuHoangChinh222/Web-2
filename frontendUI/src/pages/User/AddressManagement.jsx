/* 
 * ADDRESSMANAGEMENT COMPONENT - DELIVERY ADDRESS MANAGEMENT WITH SMART DROPDOWNS
 * Sinh viên: Vũ Hoàng Chính
 * Môn học: Chuyên đề WEB 2 & ReactJS
 */

import React, { useState, useEffect } from 'react';
import { getCookie } from '../../utils/cookieHelper';
import userAddressService from '../../services/userAddressService';
import IsLoading from '../../components/IsLoading';
import '../../assets/css/AddressManagement.css';

const AddressManagement = ({ navigate }) => {
  const [customer, setCustomer] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Dữ liệu hành chính Việt Nam
  const [vnData, setVnData] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingVnData, setLoadingVnData] = useState(false);

  // States cho modal thêm/sửa địa chỉ
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' hoặc 'edit'
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

  // Dropdown IDs
  const [selectedProvinceId, setSelectedProvinceId] = useState('');
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [selectedWardId, setSelectedWardId] = useState('');

  // 1. Kiểm tra đăng nhập và nạp danh sách địa chỉ
  useEffect(() => {
    const loggedCustomer = getCookie('customer');
    if (!loggedCustomer) {
      alert("Hệ thống bảo mật: Vui lòng đăng nhập để quản lý địa chỉ!");
      navigate('login');
      return;
    }
    setCustomer(loggedCustomer);
    fetchAddresses(loggedCustomer.id);
    fetchVnAdministrativeData();
  }, [navigate]);

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

  // 2. Tải dữ liệu hành chính Việt Nam từ CDN
  const fetchVnAdministrativeData = async () => {
    setLoadingVnData(true);
    try {
      const res = await fetch('https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json');
      if (res.ok) {
        const rawData = await res.json();
        const data = preprocessVnData(rawData);
        setVnData(data);
        setProvinces(data);
      } else {
        console.warn("Không thể fetch trực tiếp, sử dụng dữ liệu tĩnh.");
      }
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu hành chính Việt Nam:", err);
    } finally {
      setLoadingVnData(false);
    }
  };

  const fetchAddresses = async (customerId) => {
    setLoading(true);
    try {
      const data = await userAddressService.getByCustomerId(customerId);
      // Sắp xếp địa chỉ mặc định lên đầu
      const sorted = Array.isArray(data) ? data.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0)) : [];
      setAddresses(sorted);
    } catch (err) {
      console.error("Lỗi khi tải danh sách địa chỉ:", err);
    } finally {
      setLoading(false);
    }
  };

  // Hàm chuẩn hóa tên để so sánh không phân biệt tiền tố (Tỉnh, Thành Phố, Quận, Huyện...)
  const cleanName = (name) => {
    if (!name) return "";
    return name.toLowerCase()
      .replace('tỉnh', '')
      .replace('thành phố', '')
      .replace('quận', '')
      .replace('huyện', '')
      .replace('thị xã', '')
      .replace('phường', '')
      .replace('xã', '')
      .replace('thị trấn', '')
      .trim();
  };

  // Đồng bộ hóa dropdown khi mở sửa địa chỉ
  useEffect(() => {
    if (isModalOpen && modalType === 'edit' && selectedAddressId && vnData.length > 0) {
      const addr = addresses.find(a => a.id === selectedAddressId);
      if (addr) {
        // Tìm tỉnh/thành
        const foundProvince = vnData.find(p => cleanName(p.Name) === cleanName(addr.city));
        if (foundProvince) {
          setSelectedProvinceId(foundProvince.Id);
          const pDistricts = foundProvince.Districts || [];
          setDistricts(pDistricts);

          // Tìm quận/huyện
          const foundDistrict = pDistricts.find(d => cleanName(d.Name) === cleanName(addr.district));
          if (foundDistrict) {
            setSelectedDistrictId(foundDistrict.Id);
            const dWards = foundDistrict.Wards || [];
            setWards(dWards);

            // Tìm phường/xã
            const foundWard = dWards.find(w => cleanName(w.Name) === cleanName(addr.ward));
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
  }, [isModalOpen, modalType, selectedAddressId, vnData, addresses]);

  // Mở modal thêm địa chỉ - Điền mặc định tên và điện thoại của tài khoản
  const handleOpenAddModal = () => {
    setModalType('add');
    setSelectedAddressId(null);
    setRecipientName(customer?.fullName || '');
    setRecipientPhone(customer?.phone || '');
    setCity('');
    setDistrict('');
    setWard('');
    setAddressLine('');
    setIsDefault(addresses.length === 0); // Nếu chưa có địa chỉ nào, tự động đặt làm mặc định
    setSelectedProvinceId('');
    setSelectedDistrictId('');
    setSelectedWardId('');
    setDistricts([]);
    setWards([]);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  // Mở modal sửa địa chỉ
  const handleOpenEditModal = (addr) => {
    setModalType('edit');
    setSelectedAddressId(addr.id);
    setRecipientName(addr.recipientName);
    setRecipientPhone(addr.recipientPhone);
    setCity(addr.city);
    setDistrict(addr.district);
    setWard(addr.ward);
    setAddressLine(addr.addressLine);
    setIsDefault(addr.isDefault);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  // Xử lý thay đổi Tỉnh/Thành phố
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

  // Xử lý thay đổi Quận/Huyện
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

  // Xử lý thay đổi Phường/Xã
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

  // Xử lý lưu (Thêm/Sửa) địa chỉ
  const handleSaveAddress = async (e) => {
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
    const addressData = {
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
      if (modalType === 'add') {
        await userAddressService.create(addressData);
        alert("Thêm địa chỉ giao hàng thành công!");
      } else {
        await userAddressService.update(selectedAddressId, addressData);
        alert("Cập nhật địa chỉ thành công!");
      }
      setIsModalOpen(false);
      fetchAddresses(customer.id);
    } catch (err) {
      console.error("Lỗi khi lưu địa chỉ:", err);
      setErrorMsg(err.response?.data?.message || "Đã xảy ra lỗi hệ thống, vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  // Xóa địa chỉ
  const handleDeleteAddress = async (id, isDef) => {
    if (isDef) {
      alert("Không thể xóa địa chỉ giao hàng mặc định!");
      return;
    }
    if (window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) {
      try {
        await userAddressService.delete(id);
        alert("Xóa địa chỉ thành công!");
        fetchAddresses(customer.id);
      } catch (err) {
        console.error("Lỗi khi xóa địa chỉ:", err);
        alert("Không thể xóa địa chỉ này.");
      }
    }
  };

  // Thiết lập địa chỉ mặc định
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
      alert("Đặt địa chỉ mặc định thành công!");
      fetchAddresses(customer.id);
    } catch (err) {
      console.error("Lỗi khi đặt địa chỉ mặc định:", err);
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <IsLoading message="Đang tải danh sách địa chỉ..." />
      </div>
    );
  }

  return (
    <div className="page-container page-transition">
      <div className="address-manager-container">

        {/* Tiêu đề & Nút thêm địa chỉ */}
        <div className="address-header-row">
          <h2 className="address-header-title">Địa chỉ của tôi</h2>
          <button className="btn-add-address" onClick={handleOpenAddModal}>
            <i className="fa-solid fa-plus"></i> Thêm địa chỉ mới
          </button>
        </div>

        {/* Danh sách địa chỉ */}
        {addresses.length === 0 ? (
          <div className="no-address-state">
            <i className="fa-solid fa-map-location-dot no-address-icon"></i>
            <p>Bạn chưa thêm địa chỉ nhận hàng nào.</p>
          </div>
        ) : (
          <div className="address-list">
            {addresses.map((addr) => (
              <div key={addr.id} className={`address-item-card ${addr.isDefault ? 'is-default-card' : ''}`}>

                {/* Thông tin bên trái */}
                <div className="address-item-left">
                  <div className="address-item-user-info">
                    <span className="address-item-name">{addr.recipientName}</span>
                    <div className="address-item-divider"></div>
                    <span className="address-item-phone">{addr.recipientPhone}</span>
                  </div>
                  <div className="address-item-details">
                    {addr.addressLine}<br />
                    {addr.ward}, {addr.district}, {addr.city}
                  </div>
                  {addr.isDefault && (
                    <div className="address-item-badges">
                      <span className="badge-default">Mặc định</span>
                    </div>
                  )}
                </div>

                {/* Các nút hành động bên phải */}
                <div className="address-item-right">
                  <div className="address-item-actions">
                    <button className="btn-action-text" onClick={() => handleOpenEditModal(addr)}>Cập nhật</button>
                    {!addr.isDefault && (
                      <button className="btn-action-text danger" onClick={() => handleDeleteAddress(addr.id, addr.isDefault)}>Xóa</button>
                    )}
                  </div>
                  {!addr.isDefault && (
                    <button className="btn-set-default" onClick={() => handleSetDefault(addr)}>
                      Thiết lập mặc định
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Nút quay lại trang cá nhân */}
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '15px' }}>
          <button className="btn btn-outline" onClick={() => navigate('user')}>
            <i className="fa-solid fa-arrow-left"></i> Quay lại tài khoản
          </button>
        </div>

        {/* Modal Thêm/Sửa địa chỉ */}
        {isModalOpen && (
          <div className="address-modal-overlay">
            <div className="address-modal-card">
              <h3 className="address-modal-title">
                {modalType === 'add' ? 'Địa chỉ mới' : 'Cập nhật địa chỉ'}
              </h3>

              {errorMsg && (
                <div className="checkout-error-alert" style={{ margin: 0 }}>
                  <i className="fa-solid fa-circle-exclamation"></i> {errorMsg}
                </div>
              )}

              <form onSubmit={handleSaveAddress} className="address-form-grid">

                {/* Tên người nhận */}
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

                {/* Số điện thoại */}
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
                  {vnData.length > 0 ? (
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
                  {vnData.length > 0 ? (
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
                  {vnData.length > 0 ? (
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

                {/* Checkbox địa chỉ mặc định */}
                <div className="form-group form-group-full" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.5rem' }}>
                  <input
                    type="checkbox"
                    id="isDefaultCheckbox"
                    checked={isDefault}
                    disabled={modalType === 'edit' && addresses.length > 0 && addresses.find(a => a.id === selectedAddressId)?.isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="isDefaultCheckbox" style={{ cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    Đặt làm địa chỉ mặc định
                  </label>
                </div>

                {/* Hành động modal */}
                <div className="address-form-actions form-group-full">
                  <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)} disabled={saving}>
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
    </div>
  );
};

export default AddressManagement;

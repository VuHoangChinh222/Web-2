/* 
 * CHECKOUTVIEW COMPONENT - SECURE TRANSACTION & DATABASE INTEGRATION
 * Sinh viên: Vũ Hoàng Chính
 * Môn học: Chuyên đề ASP.NET Core & ReactJS
 */

import { useState, useEffect } from 'react';
import { getCookie } from '../../utils/cookieHelper';
import ShippingForm from './ShippingForm';
import OrderSummary from './OrderSummary';
import userAddressService from '../../services/userAddressService';
import '../../assets/css/checkoutCSS/Index.css';

const CheckoutView = ({ cart, navigate }) => {
  const [customer, setCustomer] = useState(null);

  // States cho Form
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [addresses, setAddresses] = useState([]);

  // Trạng thái xử lý lỗi
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Kiểm tra đăng nhập bảo mật & nạp dữ liệu từ Cookie
  useEffect(() => {
    const loggedCustomer = getCookie('customer');
    if (!loggedCustomer) {
      alert("Hệ thống bảo mật: Bạn phải đăng nhập để tiến hành đặt hàng!");
      navigate('login');
      return;
    }
    setCustomer(loggedCustomer);
    refreshAddresses(loggedCustomer.id);
  }, [navigate]);

  const refreshAddresses = async (customerId, selectNewAddrId = null) => {
    const targetId = customerId || customer?.id;
    if (!targetId) return;
    try {
      const data = await userAddressService.getByCustomerId(targetId);
      const addrList = Array.isArray(data) ? data : [];
      setAddresses(addrList);
      
      // Nếu có địa chỉ đã lưu, tìm địa chỉ mặc định hoặc dùng địa chỉ đầu tiên
      if (addrList.length > 0) {
        let selectedAddr = null;
        if (selectNewAddrId) {
          selectedAddr = addrList.find(a => a.id === selectNewAddrId);
        }
        if (!selectedAddr) {
          selectedAddr = addrList.find(a => a.isDefault) || addrList[0];
        }
        setFullName(selectedAddr.recipientName);
        setPhone(selectedAddr.recipientPhone);
        setAddress(`${selectedAddr.addressLine}, ${selectedAddr.ward}, ${selectedAddr.district}, ${selectedAddr.city}`);
      } else {
        const loggedCustomer = getCookie('customer');
        setFullName(loggedCustomer?.fullName || '');
        setPhone(loggedCustomer?.phone || '');
        setAddress(loggedCustomer?.address || '');
      }
      return addrList;
    } catch (err) {
      console.error("Lỗi khi tải địa chỉ:", err);
      const loggedCustomer = getCookie('customer');
      setFullName(loggedCustomer?.fullName || '');
      setPhone(loggedCustomer?.phone || '');
      setAddress(loggedCustomer?.address || '');
    }
  };

  // 2. Xử lý lưu thông tin giao hàng tạm thời và chuyển đến trang Thanh toán
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (cart.length === 0) {
      setErrorMessage("Giỏ hàng của bạn đang trống!");
      return;
    }

    if (!fullName.trim()) {
      setErrorMessage("Họ và tên nhận hàng không được để trống.");
      return;
    }

    if (!phone.trim()) {
      setErrorMessage("Số điện thoại liên hệ không được để trống.");
      return;
    }

    if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(phone.trim())) {
      setErrorMessage("Số điện thoại Việt Nam không hợp lệ (phải bắt đầu bằng 03, 05, 07, 08, 09 và gồm 10 chữ số).");
      return;
    }

    if (!address.trim()) {
      setErrorMessage("Địa chỉ nhận hàng không được để trống.");
      return;
    }

    // Lưu thông tin giao hàng tạm thời vào sessionStorage để trang Thanh toán sử dụng khi bấm xác nhận
    sessionStorage.setItem('checkout_shipping_info', JSON.stringify({
      fullName: fullName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      notes: notes.trim()
    }));

    navigate('payment');
  };

  if (!customer) return null;

  return (
    <div className="page-container page-transition">
      <h2 className="page-title">Thông tin <span>Thanh toán & Đơn hàng</span></h2>

      <div className="checkout-container">
        {/* Left Column: Shipping Form */}
        <ShippingForm
          handleSubmit={handleSubmit}
          fullName={fullName}
          setFullName={setFullName}
          phone={phone}
          setPhone={setPhone}
          address={address}
          setAddress={setAddress}
          notes={notes}
          setNotes={setNotes}
          navigate={navigate}
          errorMessage={errorMessage}
          addresses={addresses}
          customer={customer}
          refreshAddresses={refreshAddresses}
        />

        {/* Right Column: Order Summary */}
        <OrderSummary cart={cart} />
      </div>
    </div>
  );
};

export default CheckoutView;

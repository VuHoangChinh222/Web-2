/* 
 * USERINFOVIEW COMPONENT - PERSONAL CABINET & DYNAMIC VIP RANKING
 * Sinh viên: Vũ Hoàng Chính
 * Môn học: Chuyên đề ASP.NET Core & ReactJS
 */

import { useState, useEffect } from 'react';
import { getCookie, eraseCookie } from '../../utils/cookieHelper';
import orderService from '../../services/orderService';
import '../../assets/css/UserInfoView.css';

// Import các subcomponents đã được tách biệt
import UserProfileHeader from './UserProfileHeader';
import OrderHistoryTable from './OrderHistoryTable';
import OrderDetailModal from './OrderDetailModal';

export const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const UserInfoView = ({ navigate }) => {
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [totalSpent, setTotalSpent] = useState(0);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // 1. Kiểm tra đăng nhập và nạp dữ liệu
  useEffect(() => {
    const loggedCustomer = getCookie('customer');
    if (!loggedCustomer) {
      alert("Hệ thống bảo mật: Vui lòng đăng nhập để xem thông tin cá nhân!");
      navigate('login');
      return;
    }
    setCustomer(loggedCustomer);

    orderService.getOrdersByCustomerId(loggedCustomer.id)
      .then(data => {
        if (data && Array.isArray(data)) {
          setOrders(data);
          const sum = data.reduce((acc, order) => acc + (order.status === 2 ? order.totalAmount : 0), 0);
          setTotalSpent(sum);
        }
        setHasError(false);
      })
      .catch(err => {
        console.error("Lỗi khi tải lịch sử đơn hàng:", err);
        setHasError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  // 2. Xử lý đăng xuất
  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất tài khoản?")) {
      eraseCookie('customer');
      eraseCookie('token'); // Đảm bảo xóa sạch JWT Token khỏi phiên làm việc
      alert("Đăng xuất tài khoản thành công!");
      navigate('login');
      window.location.reload();
    }
  };

  // 3. Quy trình tính toán hạng VIP
  const getVipRank = (totalAmount) => {
    if (totalAmount <= 0) {
      return {
        name: "Chưa phân hạng ❌",
        className: "rank-none",
        description: "Hãy mua sắm để được tích điểm phân hạng!"
      };
    } else if (totalAmount > 0 && totalAmount <= 1000000) {
      return {
        name: "Hạng Đồng 🤎",
        className: "rank-bronze",
        description: "Hạng Đồng (Tích lũy từ 1đ - 1 triệu VND)"
      };
    } else if (totalAmount > 1000000 && totalAmount <= 10000000) {
      return {
        name: "Hạng Bạc 🥈",
        className: "rank-silver",
        description: "Hạng Bạc (Tích lũy từ 1 triệu - 10 triệu VND)"
      };
    } else if (totalAmount > 10000000 && totalAmount <= 20000000) {
      return {
        name: "Hạng Vàng 🥇",
        className: "rank-gold",
        description: "Hạng Vàng (Tích lũy từ 10 triệu - 20 triệu VND)"
      };
    } else {
      return {
        name: "Hạng Kim Cương 💎",
        className: "rank-diamond",
        description: "Hạng Kim Cương tối cao (Tích lũy trên 20 triệu VND)"
      };
    }
  };

  if (!customer) return null;

  const vipRank = getVipRank(totalSpent);

  return (
    <div className="page-container page-transition">
      <h2 className="page-title">Tài khoản <span>Của tôi</span></h2>

      <div className="user-profile-wrapper">
        {/* KHUNG THÔNG TIN CÁ NHÂN & VIP RANK COMPONENT */}
        <UserProfileHeader
          customer={customer}
          totalSpent={totalSpent}
          vipRank={vipRank}
          navigate={navigate}
          onLogout={handleLogout}
        />

        {/* LỊCH SỬ MUA SẮM COMPONENT */}
        <OrderHistoryTable
          orders={orders}
          loading={loading}
          hasError={hasError}
          onViewDetail={(orderId) => setSelectedOrderId(orderId)}
        />
      </div>

      {/* Render Modal chi tiết đơn hàng khi chọn Xem chi tiết */}
      {selectedOrderId && (
        <OrderDetailModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
        />
      )}
    </div>
  );
};

export default UserInfoView;

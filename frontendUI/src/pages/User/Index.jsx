/* 
 * USERINFOVIEW COMPONENT - PERSONAL CABINET & DYNAMIC VIP RANKING
 * Sinh viên: Vũ Hoàng Chính
 * Môn học: Chuyên đề ASP.NET Core & ReactJS
 */

import { useState, useEffect } from 'react';
import { getCookie, eraseCookie } from '../../utils/cookieHelper';
import orderService from '../../services/orderService';
import IsLoading from '../../components/IsLoading';
import '../../assets/css/UserInfoView.css';

export const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const UserInfoView = ({ navigate }) => {
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [totalSpent, setTotalSpent] = useState(0);

  // 1. Kiểm tra trạng thái đăng nhập từ Cookie và nạp lịch sử giao dịch
  useEffect(() => {
    const loggedCustomer = getCookie('customer');
    if (!loggedCustomer) {
      alert("Hệ thống bảo mật: Vui lòng đăng nhập để xem thông tin cá nhân!");
      navigate('login');
      return;
    }
    setCustomer(loggedCustomer);

    // Tải lịch sử đơn hàng của khách hàng từ Database
    orderService.getOrdersByCustomerId(loggedCustomer.id)
      .then(data => {
        if (data && Array.isArray(data)) {
          setOrders(data);

          // Tính tổng tích lũy từ các đơn hàng để làm cơ sở phân hạng VIP động (chỉ nhưng đơn hàng đã hoàn thành thì mới tính)
          const sum = data.reduce((acc, order) => acc + (order.status === 2 ? order.totalAmount : 0), 0);
          setTotalSpent(sum);
        }
        setHasError(false);
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi khi tải lịch sử đơn hàng:", err);
        setHasError(true);
        setLoading(false);
      });
  }, [navigate]);

  // 2. Hàm xử lý đăng xuất người dùng
  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất tài khoản?")) {
      eraseCookie('customer');
      alert("Đăng xuất tài khoản thành công!");
      navigate('login');
      window.location.reload(); // Reload để đồng bộ lại thanh Header/Navbar
    }
  };

  // 3. Quy trình tính toán cấp bậc Hạng thành viên động
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
        {/* KHUNG THÔNG TIN CÁ NHÂN & VIP RANK */}
        <div className="user-profile-header">
          <div className="user-profile-avatar-circle">
            {customer.fullName ? customer.fullName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="user-profile-details">
            <h3 className="user-profile-name">{customer.fullName}</h3>
            <div className="user-profile-meta">
              <span><i className="fa-solid fa-envelope"></i> {customer.email}</span>
              {customer.phone && <span><i className="fa-solid fa-phone"></i> {customer.phone}</span>}
              {customer.address && <span><i className="fa-solid fa-location-dot"></i> {customer.address}</span>}
            </div>

            <div className="user-profile-badge-row">
              <span className="user-profile-badge-label">Cấp bậc khách hàng:</span>
              <span className={`rank-badge ${vipRank.className}`} title={vipRank.description}>
                {vipRank.name}
              </span>
              <span className="user-profile-spent-amount">
                (Tổng chi tiêu: <strong className="user-profile-spent-val">{formatPrice(totalSpent)}</strong>)
              </span>
            </div>
          </div>
          <div className="user-profile-actions-wrapper">
            <button className="user-profile-edit-btn" onClick={() => navigate('user-info')}>
              <i className="fa-solid fa-user-pen"></i> Sửa thông tin
            </button>
            <button className="btn btn-outline user-profile-logout-btn" onClick={handleLogout}>
              <i className="fa-solid fa-right-from-bracket"></i> Đăng xuất
            </button>
          </div>
        </div>

        {/* LỊCH SỬ MUA SẮM */}
        <div className="orders-section-card">
          <h3 className="orders-title">
            <i className="fa-solid fa-receipt orders-title-icon"></i> Lịch sử đơn hàng
          </h3>

          {loading ? (
            <IsLoading message="Đang tải dữ liệu đơn hàng..." />
          ) : hasError ? (
            <div className="empty-state user-profile-empty" style={{ color: '#ef4444' }}>
              <i className="fa-solid fa-circle-exclamation" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}></i>
              <p>Lỗi kết nối đến máy chủ. Vui lòng kiểm tra đường truyền!</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="empty-state user-profile-empty">
              <i className="fa-solid fa-box-open user-profile-empty-icon"></i>
              <p className="user-profile-empty-text">Bạn chưa thực hiện bất kỳ giao dịch mua sắm nào.</p>
            </div>
          ) : (
            <div className="orders-table-wrapper">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Mã Đơn #</th>
                    <th>Ngày Đặt</th>
                    <th>Tổng Tiền</th>
                    <th>Số Món</th>
                    <th>Trạng Thái</th>
                    <th>Ghi Chú</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => {
                    // Cấu hình nhãn trạng thái theo mã Status
                    let statusText = "Chờ duyệt";
                    let statusClass = "status-pending";
                    if (order.status === 1) {
                      statusText = "Đang giao";
                      statusClass = "status-shipping";
                    } else if (order.status === 2) {
                      statusText = "Đã xong";
                      statusClass = "status-completed";
                    }

                    return (
                      <tr key={order.id}>
                        <td><strong>{order.id}</strong></td>
                        <td>{new Date(order.orderDate).toLocaleString('vi-VN')}</td>
                        <td><strong className="user-profile-spent-val">{formatPrice(order.totalAmount)}</strong></td>
                        <td>{order.totalItems} sản phẩm</td>
                        <td>
                          <span className={`status-pill ${statusClass}`}>{statusText}</span>
                        </td>
                        <td className="orders-table-notes">{order.notes || 'Không có ghi chú'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserInfoView;

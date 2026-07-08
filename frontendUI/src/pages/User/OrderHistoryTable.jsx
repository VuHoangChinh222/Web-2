/* 
 * ORDERHISTORYTABLE COMPONENT
 * Sinh viên: Vũ Hoàng Chính
 * Môn học: Chuyên đề ASP.NET Core & ReactJS
 */

import React from 'react';
import IsLoading from '../../components/IsLoading';

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + ' VND';

const OrderHistoryTable = ({ orders, loading, hasError, onViewDetail }) => {
  return (
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
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => {
                let statusText = "Chờ duyệt";
                let statusClass = "status-pending";
                if (order.status === 1) {
                  statusText = "Đang giao";
                  statusClass = "status-shipping";
                } else if (order.status === 2) {
                  statusText = "Đã xong";
                  statusClass = "status-completed";
                } else if (order.status === 3) {
                  statusText = "Đã hủy";
                  statusClass = "status-cancelled";
                }

                return (
                  <tr
                    key={order.id}
                    onClick={() => onViewDetail(order.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td><strong>#{order.id}</strong></td>
                    <td>{new Date(order.orderDate).toLocaleString('vi-VN')}</td>
                    <td><strong className="user-profile-spent-val">{formatPrice(order.totalAmount)}</strong></td>
                    <td>{order.totalItems} sản phẩm</td>
                    <td>
                      <span className={`status-pill ${statusClass}`}>{statusText}</span>
                    </td>
                    <td className="orders-table-notes">{order.notes || 'Không có ghi chú'}</td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm user-profile-edit-btn"
                        style={{ padding: '6px 12px', fontSize: '0.8rem', height: 'auto' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetail(order.id);
                        }}
                      >
                        <i className="fa-solid fa-eye"></i> Xem chi tiết
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderHistoryTable;

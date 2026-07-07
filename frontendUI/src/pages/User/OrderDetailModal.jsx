/* 
 * ORDERDETAILMODAL COMPONENT
 * Sinh viên: Vũ Hoàng Chính
 * Môn học: Chuyên đề ASP.NET Core & ReactJS
 */

import React, { useState, useEffect } from 'react';
import orderService from '../../services/orderService';
import { resolveImageUrl } from '../../config';
import '../../assets/css/OrderDetail.css';

const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const OrderDetailModal = ({ orderId, onClose }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    orderService.getOrderDetailById(orderId)
      .then(data => {
        setDetail(data);
        setError(null);
      })
      .catch(err => {
        console.error("Lỗi khi tải chi tiết đơn hàng:", err);
        setError("Không thể tải thông tin chi tiết của đơn hàng này.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [orderId]);

  if (!orderId) return null;

  return (
    <div className="order-detail-modal-overlay" onClick={onClose}>
      <div className="order-detail-modal-content" onClick={e => e.stopPropagation()}>
        <div className="order-detail-modal-header">
          <h3>Chi tiết Đơn hàng #{orderId}</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="order-detail-modal-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--accent)' }}></i>
              <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Đang tải thông tin đơn hàng...</p>
            </div>
          ) : error ? (
            <div className="empty-state user-profile-empty" style={{ color: '#ef4444' }}>
              <i className="fa-solid fa-circle-exclamation" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}></i>
              <p>{error}</p>
            </div>
          ) : detail ? (
            <>
              {/* Tóm tắt chung */}
              <div className="order-modal-summary-grid">
                <div>
                  <strong>Ngày đặt hàng:</strong> {new Date(detail.orderDate).toLocaleString('vi-VN')}
                </div>
                <div>
                  <strong>Trạng thái:</strong>{' '}
                  <span className={`status-pill status-${detail.status === 0 ? 'pending' : detail.status === 1 ? 'shipping' : detail.status === 2 ? 'completed' : 'cancelled'}`}>
                    {detail.statusText}
                  </span>
                </div>
              </div>

              {/* Thông tin giao nhận */}
              <div className="order-modal-shipping-info">
                <h4><i className="fa-solid fa-truck-ramp-box"></i> Thông tin giao nhận hàng</h4>
                <p><strong>Họ tên khách hàng:</strong> {detail.customer?.fullName}</p>
                <p><strong>Số điện thoại liên hệ:</strong> {detail.customer?.phone || 'Chưa cung cấp'}</p>
                <p><strong>Địa chỉ giao hàng:</strong> {detail.customer?.address || 'Chưa cung cấp'}</p>
                <p><strong>Ghi chú đơn hàng:</strong> <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>{detail.notes || 'Không có ghi chú'}</span></p>
              </div>

              {/* Danh sách mặt hàng */}
              <div className="order-modal-items">
                <h4><i className="fa-solid fa-basket-shopping"></i> Danh sách mặt hàng mua</h4>
                <div className="order-modal-table-wrapper">
                  <table className="order-modal-table">
                    <thead>
                      <tr>
                        <th>Hình ảnh</th>
                        <th>Tên sản phẩm</th>
                        <th>Đơn giá</th>
                        <th>Số lượng</th>
                        <th>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.items?.map(item => (
                        <tr key={item.id}>
                          <td>
                            <img 
                              src={resolveImageUrl(item.productImageUrl)} 
                              alt={item.productName} 
                              className="order-modal-item-img"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'src/assets/images/fallback_product.png';
                              }}
                            />
                          </td>
                          <td><strong>{item.productName}</strong></td>
                          <td>{formatPrice(item.unitPrice)}</td>
                          <td>x{item.quantity}</td>
                          <td><strong className="order-modal-subtotal">{formatPrice(item.subTotal)}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="order-modal-total">
                  <span>Tổng giá trị đơn hàng:</span>
                  <strong className="total-val">{formatPrice(detail.totalAmount)}</strong>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;

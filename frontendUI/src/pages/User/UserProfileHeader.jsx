/* 
 * USERPROFILEHEADER COMPONENT
 * Sinh viên: Vũ Hoàng Chính
 * Môn học: Chuyên đề ASP.NET Core & ReactJS
 */

import React from 'react';

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + ' VND';

const UserProfileHeader = ({ customer, totalSpent, vipRank, navigate, onLogout }) => {
  return (
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
        <button className="btn btn-outline user-profile-logout-btn" onClick={onLogout}>
          <i className="fa-solid fa-right-from-bracket"></i> Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default UserProfileHeader;

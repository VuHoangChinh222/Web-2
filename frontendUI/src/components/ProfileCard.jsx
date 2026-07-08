/* 
 * PROFILE CARD COMPONENT - PREMIUM REACT COMPONENT
 * Sinh viên: Vũ Hoàng Chính
 * Môn học: Chuyên đề ASP.NET Core & ReactJS
 */

import React from 'react';
import '../assets/css/ProfileCard.css';
import avatarImg from '../assets/images/profile_avatar.jpg';

const ProfileCard = () => {
  return (
    <div className="profile-card-container">
      {/* Premium Gradient Header */}
      <div className="profile-card-header">
        <div className="profile-card-blob"></div>
      </div>

      {/* Avatar Wrapper with Online Status */}
      <div className="profile-card-avatar-wrapper">
        <img
          src={avatarImg}
          alt="Vũ Hoàng Chính Avatar"
          className="profile-card-avatar"
        />
        <div className="profile-card-status" title="Active developer online"></div>
      </div>

      {/* Body Info */}
      <div className="profile-card-body">
        <h3 className="profile-card-name">Vũ Hoàng Chính</h3>
        {/* Student Badges */}
        <div className="profile-card-badges">
          <div className="profile-card-badge-row">
            <span>Mã số sinh viên:</span>
            <span className="profile-card-badge-value">2122110380</span>
          </div>
          <div className="profile-card-badge-row">
            <span>Lớp chuyên ngành:</span>
            <span className="profile-card-badge-value">CCQ2211J</span>
          </div>
          <div className="profile-card-badge-row">
            <span>Giáo viên hướng dẫn:</span>
            <span className="profile-card-badge-value">Hồ Diên Lợi</span>
          </div>
          <div className="profile-card-badge-row">
            <span>Học phần:</span>
            <span className="profile-card-badge-value">Chuyên đề ứng dụng lập trình Web 2</span>
          </div>
        </div>
        {/* Action Buttons */}
        <div className="profile-card-actions">
          <a
            href="https://github.com/VuHoangChinh222"
            target="_blank"
            rel="noopener noreferrer"
            className="profile-card-btn profile-card-btn-primary"
          >
            <i className="fa-brands fa-github"></i> GitHub
          </a>
          <button
            onClick={() => alert("Thông tin liên hệ: vuhoangchinh222@gmail.com")}
            className="profile-card-btn profile-card-btn-secondary"
          >
            Liên Hệ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;

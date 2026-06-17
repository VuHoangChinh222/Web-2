package com.example.vuhoangchinh.Entities;

// Import các annotation JPA để cấu hình ORM ánh xạ bảng dữ liệu MySQL
import jakarta.persistence.*; // Annotations như @Entity, @Table, @Id, @Column, @ManyToOne, @JoinColumn, v.v.

// Import Lombok hỗ trợ viết mã nguồn ngắn gọn, tự động sinh code
import lombok.*; // Annotations như @Data, @NoArgsConstructor, @AllArgsConstructor

// Import annotation của Hibernate hỗ trợ sinh thời gian tự động
import org.hibernate.annotations.CreationTimestamp; // Tự động điền ngày tạo khi insert
import org.hibernate.annotations.UpdateTimestamp; // Tự động điền ngày cập nhật khi update

// Import thư viện xử lý thời gian chuẩn của Java
import java.time.LocalDateTime; // Lớp xử lý ngày giờ hệ thống

/**
 * @Entity: Khai báo lớp này là một thực thể JPA đại diện cho bảng dữ liệu.
 * @Table(name = "users"): Chỉ định tên bảng trong cơ sở dữ liệu MySQL tương ứng là "users".
 * @Data: Lombok tự động sinh Getter, Setter, toString, equals, hashCode.
 * @NoArgsConstructor: Sinh Constructor không tham số.
 * @AllArgsConstructor: Sinh Constructor chứa đầy đủ thuộc tính.
 */
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    // Khóa chính tự động tăng (Auto-Increment) đại diện cho tài khoản quản trị/nhân viên
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Tên đăng nhập hệ thống, là duy nhất (unique), không được null, dài tối đa 50 ký tự
    @Column(unique = true, nullable = false, length = 50)
    private String username;

    // Mật khẩu đăng nhập (mật khẩu đã được mã hóa bằng BCrypt), không được null, dài tối đa 255 ký tự
    @Column(nullable = false, length = 255)
    private String password;

    // Họ tên đầy đủ của nhân viên/quản trị viên, dài tối đa 100 ký tự
    @Column(name = "full_name", length = 100)
    private String fullName;

    // Địa chỉ email của nhân viên/quản trị viên, là duy nhất (unique), dài tối đa 100 ký tự
    @Column(unique = true, length = 100)
    private String email;

    // Số điện thoại liên hệ, dài tối đa 15 ký tự
    @Column(length = 15)
    private String phone;

    // Ảnh đại diện của nhân viên/quản trị viên, lưu đường dẫn ảnh, không được null, dài tối đa 255 ký tự
    @Column(name = "image_url", nullable = false, length = 255)
    private String imageUrl;

    // Trạng thái hoạt động tài khoản (1: Đang hoạt động, 0: Đã khóa), mặc định là 1
    @Column(nullable = false)
    private Integer status = 1;

    /**
     * Mối quan hệ Nhiều-Một (@ManyToOne): Nhiều tài khoản User có thể có cùng một vai trò Role (ví dụ: Role EMPLOYEE).
     * @JoinColumn(name = "role_id", nullable = false): Xác định cột khóa ngoại "role_id" để liên kết sang bảng roles.
     */
    @ManyToOne
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    /**
     * @CreationTimestamp: Tự động điền ngày giờ hiện tại của hệ thống lúc thêm mới dòng dữ liệu.
     * updatable = false: Không cho phép chỉnh sửa giá trị cột này trong lệnh UPDATE.
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * @UpdateTimestamp: Tự động cập nhật thời gian hiện tại mỗi khi chỉnh sửa dữ liệu người dùng.
     */
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

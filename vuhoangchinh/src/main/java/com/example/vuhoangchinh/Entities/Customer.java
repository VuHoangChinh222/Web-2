package com.example.vuhoangchinh.Entities;

// Import các annotation JPA để ánh xạ thực thể Java sang bảng cơ sở dữ liệu MySQL
import jakarta.persistence.*; // Annotations như @Entity, @Table, @Id, @Column, v.v.

// Import Lombok giúp sinh mã tự động
import lombok.*; // Annotations như @Data, @NoArgsConstructor, @AllArgsConstructor

// Import annotation của Hibernate hỗ trợ sinh thời gian tự động
import org.hibernate.annotations.CreationTimestamp; // Tự động điền ngày tạo khi insert
import org.hibernate.annotations.UpdateTimestamp; // Tự động điền ngày cập nhật khi update

// Import thư viện xử lý thời gian chuẩn của Java
import java.time.LocalDateTime; // Lớp xử lý ngày giờ hệ thống

// Import các annotation hỗ trợ bẫy lỗi Validation
import jakarta.validation.constraints.*;

/**
 * @Entity: Khai báo lớp này là một thực thể JPA được ánh xạ xuống Database.
 * @Table(name = "customers"): Chỉ định tên bảng trong CSDL MySQL tương ứng là "customers".
 * @Data: Lombok annotation tự động sinh ra Getter, Setter, toString, equals và hashCode.
 * @NoArgsConstructor: Tự động tạo constructor không đối số (bắt buộc đối với JPA Entity).
 * @AllArgsConstructor: Tự động tạo constructor chứa đầy đủ tất cả thuộc tính.
 */
@Entity
@Table(name = "customers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Customer {

    /**
     * @Id: Xác định trường này là Khóa chính (Primary Key - PK) của bảng.
     * @GeneratedValue(strategy = GenerationType.IDENTITY): Đặt cơ chế tự động tăng ID (Auto-Increment) của CSDL.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Trường email là duy nhất (unique = true), không được phép null, độ dài tối đa 100 ký tự
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng hợp lệ (Ví dụ: customer@gmail.com)")
    @Column(unique = true, nullable = false, length = 100)
    private String email;

    // Trường mật khẩu không được phép null, lưu chuỗi đã mã hóa dài tối đa 255 ký tự
    @Column(nullable = false, length = 255)
    private String password;

    // Tên cột trong DB tương ứng là "full_name", không được null, dài tối đa 100 ký tự
    @NotBlank(message = "Họ và tên không được để trống")
    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    // Trường số điện thoại, độ dài tối đa 15 ký tự
    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^(0|\\+84)(3|5|7|8|9)[0-9]{8}$", message = "Số điện thoại không đúng định dạng (Ví dụ: 0912345678)")
    @Column(length = 15)
    private String phone;

    // Tên cột tương ứng "image_url", có thể để null, hỗ trợ Base64 dài
    @Column(name = "image_url", columnDefinition = "LONGTEXT")
    private String imageUrl;

    // Trạng thái tài khoản (1: Hoạt động, 0: Bị khóa), mặc định là 1
    @Column(nullable = false)
    private Integer status = 1;

    /**
     * @CreationTimestamp: Tự động gán thời gian hiện tại của hệ thống khi ghi bản ghi mới vào DB.
     * updatable = false: Không cho phép thay đổi giá trị của cột này khi thực hiện các câu lệnh UPDATE.
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * @UpdateTimestamp: Tự động cập nhật thời gian hiện tại mỗi khi bản ghi này được chỉnh sửa.
     */
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

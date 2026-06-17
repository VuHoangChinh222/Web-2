package com.example.vuhoangchinh.Entities;

// Import các annotation JPA để cấu hình ORM ánh xạ thực thể Java sang bảng cơ sở dữ liệu MySQL
import jakarta.persistence.*; // Annotations như @Entity, @Table, @Id, @Column, v.v.

// Import Lombok hỗ trợ viết mã nguồn ngắn gọn, tự động sinh code
import lombok.*; // Annotations như @Data, @NoArgsConstructor, @AllArgsConstructor

/**
 * @Entity: Khai báo lớp này là một thực thể JPA được quản lý bởi Hibernate.
 * @Table(name = "roles"): Chỉ định tên bảng trong cơ sở dữ liệu MySQL tương ứng là "roles".
 * @Data: Lombok tự động sinh Getter, Setter, toString, equals, hashCode.
 * @NoArgsConstructor: Sinh Constructor không tham số.
 * @AllArgsConstructor: Sinh Constructor chứa đầy đủ thuộc tính.
 */
@Entity
@Table(name = "roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Role {

    // Khóa chính (Primary Key - PK) tự động tăng (Auto-Increment) của bảng roles
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Tên vai trò (Ví dụ: ROLE_ADMIN, ROLE_EMPLOYEE), là duy nhất (unique), không được null, dài tối đa 50 ký tự
    @Column(unique = true, nullable = false, length = 50)
    private String name;

    // Mô tả chi tiết vai trò, có thể null, dài tối đa 255 ký tự
    @Column(length = 255)
    private String description;
}

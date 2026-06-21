package com.example.vuhoangchinh.Entities;

// Import các annotation JPA để cấu hình ORM ánh xạ bảng cơ sở dữ liệu MySQL
import jakarta.persistence.*; // Annotations như @Entity, @Table, @Id, @Column, v.v.

// Import thư viện Lombok hỗ trợ viết mã nguồn ngắn gọn, tự động sinh code
import lombok.*; // Annotations như @Data, @NoArgsConstructor, @AllArgsConstructor

// Import thư viện bẫy lỗi Validation
import jakarta.validation.constraints.*;

/**
 * @Entity: Khai báo lớp này là một thực thể JPA đại diện cho bảng dữ liệu.
 * @Table(name = "category_products"): Chỉ định tên bảng trong cơ sở dữ liệu MySQL tương ứng là "category_products".
 * @Data: Lombok tự động sinh Getter, Setter, toString, equals, hashCode.
 * @NoArgsConstructor: Sinh Constructor không tham số (bắt buộc cho JPA).
 * @AllArgsConstructor: Sinh Constructor chứa đầy đủ thuộc tính.
 */
@Entity
@Table(name = "category_products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryProduct {

    // Khóa chính tự động tăng (Auto-Increment) đại diện cho danh mục sản phẩm
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Tên danh mục sản phẩm (Ví dụ: Giày thể thao, Quần áo), không được null, dài tối đa 100 ký tự
    @NotBlank(message = "Tên danh mục không được để trống")
    @Size(max = 100, message = "Tên danh mục không được vượt quá 100 ký tự")
    @Column(nullable = false, length = 100)
    private String name;

    // Slug phục vụ cho việc tối ưu hóa SEO URL (Ví dụ: "giay-the-thao"), là duy nhất (unique), không được null, dài tối đa 100 ký tự
    @Column(unique = true, nullable = false, length = 100)
    private String slug;

    // Mô tả chi tiết về danh mục, kiểu TEXT trong CSDL (cho phép lưu trữ chuỗi dài không giới hạn ký tự)
    @Column(columnDefinition = "TEXT")
    private String description;

    // Đường dẫn ảnh đại diện cho danh mục sản phẩm (Ví dụ: "/image/category-sneaker.png"), không được null, hỗ trợ Base64 dài
    @NotBlank(message = "Ảnh danh mục không được để trống")
    @Column(name = "image_url", nullable = false, columnDefinition = "LONGTEXT")
    private String imageUrl;

    // Trạng thái hiển thị danh mục trên Website (1: Hiển thị, 0: Ẩn), mặc định là 1
    @Column(nullable = false)
    private Integer status = 1;
}

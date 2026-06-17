package com.example.vuhoangchinh.Entities;

// Import các annotation của thư viện JPA để ánh xạ cơ sở dữ liệu MySQL
import jakarta.persistence.*; // Annotations như @Entity, @Table, @Id, @Column...

// Import các annotation hỗ trợ bẫy lỗi dữ liệu đầu vào (Validation)
import jakarta.validation.constraints.*; // Annotations như @NotBlank, @Size...

// Import các thư viện Lombok giúp tự động sinh các getter, setter, constructor
import lombok.*; // Annotations @Data, @NoArgsConstructor, @AllArgsConstructor

/**
 * @Entity: Khai báo lớp này là một thực thể JPA đại diện cho bảng dữ liệu.
 * @Table(name = "category_blogs"): Chỉ định tên bảng tương ứng trong cơ sở dữ liệu MySQL là "category_blogs".
 * @Data: Lombok tự động sinh ra Getter, Setter, toString, equals và hashCode.
 * @NoArgsConstructor: Lombok tự động sinh constructor không tham số.
 * @AllArgsConstructor: Lombok tự động sinh constructor có đầy đủ tham số.
 */
@Entity
@Table(name = "category_blogs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryBlog {

    // Khóa chính (Primary Key), tự động tăng (Auto-Increment)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Tên danh mục bài viết (Ví dụ: "Mẹo phối đồ", "Công nghệ đế giày"), bắt buộc nhập, tối đa 100 ký tự
    @Column(name = "name", nullable = false, length = 100)
    @NotBlank(message = "Tên danh mục bài viết không được để trống")
    @Size(max = 100, message = "Tên danh mục bài viết tối đa 100 ký tự")
    private String name;

    // Đường dẫn SEO slug duy nhất (Ví dụ: "meo-phoi-do"), bắt buộc nhập, tối đa 100 ký tự
    @Column(name = "slug", unique = true, nullable = false, length = 100)
    @NotBlank(message = "Đường dẫn SEO slug không được để trống")
    @Size(max = 100, message = "Đường dẫn SEO slug tối đa 100 ký tự")
    private String slug;

    // Đường dẫn URL hình ảnh đại diện của danh mục, bắt buộc nhập, tối đa 255 ký tự
    @Column(name = "image_url", nullable = false, length = 255)
    @NotBlank(message = "Đường dẫn hình ảnh đại diện không được để trống")
    @Size(max = 255, message = "Đường dẫn hình ảnh đại diện tối đa 255 ký tự")
    private String imageUrl;
}

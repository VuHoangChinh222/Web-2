package com.example.vuhoangchinh.Entities;

// Import các annotation của JPA ánh xạ cơ sở dữ liệu
import jakarta.persistence.*; // Annotations như @Entity, @Table, @Id, @Column, @ManyToOne...

// Import các annotation hỗ trợ bẫy lỗi dữ liệu đầu vào (Validation)
import jakarta.validation.constraints.*; // Annotations như @NotBlank, @NotNull, @Size...

// Import các thư viện Lombok giúp tự động sinh các getter, setter, constructor
import lombok.*; // Annotations @Data, @NoArgsConstructor, @AllArgsConstructor

// Import thư viện Hibernate hỗ trợ tự động ghi nhận thời gian
import org.hibernate.annotations.CreationTimestamp; // Tự ghi thời gian tạo
import org.hibernate.annotations.UpdateTimestamp; // Tự cập nhật thời gian sửa

// Import lớp thời gian chuẩn Java
import java.time.LocalDateTime;

/**
 * @Entity: Khai báo lớp này là một thực thể JPA đại diện cho bảng dữ liệu.
 * @Table(name = "blogs"): Chỉ định tên bảng trong cơ sở dữ liệu MySQL tương ứng là "blogs".
 * @Data: Lombok tự động sinh ra Getter, Setter, toString, equals và hashCode.
 * @NoArgsConstructor: Lombok tự động sinh constructor không tham số.
 * @AllArgsConstructor: Lombok tự động sinh constructor có đầy đủ tham số.
 */
@Entity
@Table(name = "blogs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Blog {

    // Khóa chính (Primary Key), tự động tăng (Auto-Increment)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Thiết lập quan hệ Nhiều-Một (Many-to-One) liên kết khóa ngoại với bảng "category_blogs"
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    @NotNull(message = "Danh mục bài viết trực thuộc là bắt buộc")
    private CategoryBlog categoryBlog;

    // Thiết lập quan hệ Nhiều-Một (Many-to-One) liên kết khóa ngoại với bảng "users" (Tác giả bài viết)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "author_id", nullable = false)
    @NotNull(message = "Tác giả viết bài là bắt buộc")
    private User author;

    // Tiêu đề bài viết tin tức (Ví dụ: "Top 5 mẫu giày Nike được săn đón nhất"), bắt buộc nhập, tối đa 200 ký tự
    @Column(name = "title", nullable = false, length = 200)
    @NotBlank(message = "Tiêu đề bài viết không được để trống")
    @Size(max = 200, message = "Tiêu đề bài viết tối đa 200 ký tự")
    private String title;

    // Đường dẫn SEO slug duy nhất của bài viết, bắt buộc nhập, tối đa 200 ký tự
    @Column(name = "slug", unique = true, nullable = false, length = 200)
    @NotBlank(message = "Đường dẫn SEO slug không được để trống")
    @Size(max = 200, message = "Đường dẫn SEO slug tối đa 200 ký tự")
    private String slug;

    // Tóm tắt nội dung ngắn của bài viết (hiển thị ở danh sách bài viết), tối đa 500 ký tự
    @Column(name = "summary", length = 500)
    @Size(max = 500, message = "Nội dung tóm tắt bài viết tối đa 500 ký tự")
    private String summary;

    // Nội dung bài viết chi tiết, cho phép lưu trữ chuỗi văn bản cực lớn (HTML/Markdown)
    @Column(name = "content", nullable = false, columnDefinition = "LONGTEXT")
    @NotBlank(message = "Nội dung bài viết không được để trống")
    private String content;

    // Đường dẫn hình ảnh thu nhỏ (thumbnail) hiển thị trong danh sách tin tức
    @Column(name = "thumbnail", length = 255)
    @Size(max = 255, message = "Đường dẫn ảnh thumbnail tối đa 255 ký tự")
    private String thumbnail;

    // Đường dẫn hình ảnh banner lớn hiển thị ở đầu bài viết chi tiết, bắt buộc nhập
    @Column(name = "image_url", nullable = false, length = 255)
    @NotBlank(message = "Đường dẫn ảnh banner không được để trống")
    @Size(max = 255, message = "Đường dẫn ảnh banner tối đa 255 ký tự")
    private String imageUrl;

    // Trạng thái hiển thị bài viết (1: Đăng tải công khai, 0: Bản nháp lưu trữ nội bộ)
    @Column(name = "status", nullable = false)
    @NotNull(message = "Trạng thái đăng tải bài viết là bắt buộc")
    private Integer status = 1;

    // Ngày tạo bài viết, tự động ghi nhận thời gian máy chủ lúc tạo mới, không cho phép update
    @Column(name = "created_at", updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    // Ngày cập nhật bài viết gần nhất, tự động ghi nhận thời gian máy chủ lúc chỉnh sửa
    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}

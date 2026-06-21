package com.example.vuhoangchinh.Entities;

// Import các annotation của thư viện JPA để ánh xạ cơ sở dữ liệu MySQL
import jakarta.persistence.*; // Annotations như @Entity, @Table, @Id, @Column...

// Import các annotation hỗ trợ bẫy lỗi dữ liệu đầu vào (Validation)
import jakarta.validation.constraints.*; // Annotations như @NotBlank, @NotNull, @Min, @Size...

// Import các thư viện Lombok giúp tự động sinh các getter, setter, constructor
import lombok.*; // Annotations @Data, @NoArgsConstructor, @AllArgsConstructor

/**
 * @Entity: Khai báo lớp này là một thực thể JPA đại diện cho bảng dữ liệu.
 * @Table(name = "banners"): Chỉ định tên bảng tương ứng trong cơ sở dữ liệu MySQL là "banners".
 * @Data: Lombok tự động sinh ra Getter, Setter, toString, equals và hashCode.
 * @NoArgsConstructor: Lombok tự động sinh constructor không tham số.
 * @AllArgsConstructor: Lombok tự động sinh constructor có đầy đủ tham số.
 */
@Entity
@Table(name = "banners")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Banner {

    // Khóa chính (Primary Key), tự động tăng (Auto-Increment)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Tiêu đề của banner quảng cáo (Ví dụ: "Khuyến mãi mùa hè 2026"), không bắt buộc nhập, tối đa 150 ký tự
    @Column(name = "title", length = 150)
    @Size(max = 150, message = "Tiêu đề banner quảng cáo tối đa 150 ký tự")
    private String title;

    // Đường dẫn URL hình ảnh của banner quảng cáo, bắt buộc nhập, hỗ trợ Base64 dài
    @Column(name = "image_url", nullable = false, columnDefinition = "LONGTEXT")
    @NotBlank(message = "Đường dẫn hình ảnh banner không được để trống")
    private String imageUrl;

    // Thứ tự hiển thị trên Slider (Ví dụ: 1 là hiển thị đầu tiên, 2 là tiếp theo...), tối thiểu là 1
    @Column(name = "position")
    @Min(value = 1, message = "Thứ tự hiển thị của banner phải lớn hơn hoặc bằng 1")
    private Integer position;

    // Trạng thái hiển thị của banner (1: Kích hoạt hiển thị công khai, 0: Ẩn/Lưu trữ tạm)
    @Column(name = "status", nullable = false)
    @NotNull(message = "Trạng thái hiển thị banner là bắt buộc")
    private Integer status = 1;
}

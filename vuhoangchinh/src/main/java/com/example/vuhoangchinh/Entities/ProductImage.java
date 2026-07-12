package com.example.vuhoangchinh.Entities;

// Import các annotation của JPA ánh xạ cơ sở dữ liệu
import jakarta.persistence.*; // Annotations như @Entity, @Table, @Id, @Column, @ManyToOne...

// Import các annotation hỗ trợ bẫy lỗi dữ liệu (Validation)
import jakarta.validation.constraints.*; // Annotations như @NotNull, @NotBlank, @Size...

// Import Lombok hỗ trợ tự sinh code
import lombok.*; // Annotations @Data, @NoArgsConstructor, @AllArgsConstructor

/**
 * @Entity: Khai báo lớp này là một thực thể JPA đại diện cho bảng dữ liệu MySQL.
 * @Table(name = "product_images"): Chỉ định tên bảng trong cơ sở dữ liệu MySQL tương ứng là "product_images".
 * @Data: Lombok tự động sinh ra Getter, Setter, toString, equals và hashCode.
 * @NoArgsConstructor: Lombok tự động sinh constructor không tham số.
 * @AllArgsConstructor: Lombok tự động sinh constructor có đầy đủ tham số.
 */
@Entity
@Table(name = "product_images")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductImage {

    // Khóa chính (Primary Key), tự động tăng (Auto-Increment)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Thiết lập quan hệ Nhiều-Một (Many-to-One) liên kết khóa ngoại với bảng "products"
    // FetchType.EAGER: Tự động tải thông tin sản phẩm gốc đi kèm khi truy vấn ảnh
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    @NotNull(message = "Sản phẩm trực thuộc là bắt buộc")
    private Product product;

    // Đường dẫn URL hình ảnh chi tiết phụ của sản phẩm, hỗ trợ Base64 dài
    @Column(name = "image_url", nullable = false, columnDefinition = "LONGTEXT")
    @NotBlank(message = "Đường dẫn hình ảnh không được để trống")
    private String imageUrl;

    // Màu sắc liên kết với ảnh này (nếu có) để lọc theo màu trên storefront
    @Column(name = "color", length = 50)
    private String color;

    // Thứ tự sắp xếp ảnh phụ
    @Column(name = "sort_order")
    private Integer sortOrder = 0;
}

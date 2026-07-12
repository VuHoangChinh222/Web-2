package com.example.vuhoangchinh.Entities;

// Import các annotation của thư viện JPA để ánh xạ thực thể vào MySQL
import jakarta.persistence.*; // Annotations như @Entity, @Table, @Id, @Column, @ManyToOne...

// Import các annotation hỗ trợ bẫy lỗi dữ liệu đầu vào (Validation)
import jakarta.validation.constraints.*; // Annotations như @NotNull, @NotBlank, @Min, @Size...

// Import thư viện Lombok giúp tự động sinh các getter, setter, constructor
import lombok.*; // Annotations @Data, @NoArgsConstructor, @AllArgsConstructor

// Import kiểu dữ liệu số thực chính xác cao
import java.math.BigDecimal;

/**
 * @Entity: Khai báo lớp này là một thực thể JPA đại diện cho bảng dữ liệu.
 * @Table(name = "product_variants"): Chỉ định tên bảng trong cơ sở dữ liệu MySQL tương ứng là "product_variants".
 * @Data: Lombok tự động sinh ra Getter, Setter, toString, equals và hashCode.
 * @NoArgsConstructor: Lombok tự động sinh constructor không tham số.
 * @AllArgsConstructor: Lombok tự động sinh constructor có đầy đủ tham số.
 */
@Entity
@Table(name = "product_variants", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"product_id", "size", "color"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariant {

    // Khóa chính (Primary Key), tự động tăng (Auto-Increment)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Thiết lập quan hệ Nhiều-Một (Many-to-One) liên kết khóa ngoại với bảng "products"
    // FetchType.EAGER: Tự động tải thông tin sản phẩm đi kèm khi truy vấn biến thể
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    @NotNull(message = "Sản phẩm trực thuộc là bắt buộc")
    private Product product;

    // Kích cỡ của biến thể sản phẩm (Ví dụ: 39, 40, S, M, L), tối đa 255 ký tự
    @Column(length = 255)
    @Size(max = 255, message = "Kích cỡ tối đa 255 ký tự")
    private String size;

    // Màu sắc của biến thể sản phẩm (Ví dụ: Đen, Trắng, Xanh), tối đa 50 ký tự
    @Column(length = 50)
    @Size(max = 50, message = "Màu sắc tối đa 50 ký tự")
    private String color;

    // Giá bán riêng của biến thể này (nếu khác so với giá bán cơ bản của sản phẩm), DECIMAL(12,2)
    @Column(precision = 12, scale = 2)
    @Min(value = 0, message = "Giá bán của biến thể không được là số âm")
    private BigDecimal price;

    // Giá khuyến mãi riêng của biến thể
    @Column(name = "sale_price", precision = 12, scale = 2)
    @Min(value = 0, message = "Giá khuyến mãi không được là số âm")
    private BigDecimal salePrice;

    // Số lượng tồn kho của biến thể cụ thể này, không được null, mặc định là 0, không được âm
    @Column(name = "stock_quantity", nullable = false)
    @NotNull(message = "Số lượng tồn kho không được để trống")
    @Min(value = 0, message = "Số lượng tồn kho không được nhỏ hơn 0")
    private Integer stockQuantity = 0;

    // Mã quản lý kho hàng riêng biệt (Stock Keeping Unit - SKU), là duy nhất (unique), tối đa 50 ký tự
    @Column(unique = true, length = 50)
    @Size(max = 50, message = "Mã SKU quản lý kho hàng tối đa 50 ký tự")
    private String sku;

    // Trạng thái của biến thể (1: Đang kinh doanh/Hiển thị, 0: Ngừng kinh doanh/Ẩn)
    @Column(nullable = false)
    private Integer status = 1;

    // Hàm lấy ảnh đại diện của biến thể dựa vào màu sắc
    public String getImageUrl() {
        if (product == null) return null;
        if (color != null && !color.trim().isEmpty() && !color.equalsIgnoreCase("Mặc định") && !color.equalsIgnoreCase("Default")) {
            java.util.List<ProductImage> imgs = product.getImages();
            if (imgs != null) {
                for (ProductImage img : imgs) {
                    if (img.getColor() != null && img.getColor().trim().equalsIgnoreCase(color.trim())) {
                        return img.getImageUrl();
                    }
                }
            }
        }
        return product.getThumbnail();
    }

}

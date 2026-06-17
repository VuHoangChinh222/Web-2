package com.example.vuhoangchinh.Entities;

// Import các annotation của thư viện JPA để ánh xạ thực thể vào MySQL
import jakarta.persistence.*; // Annotations như @Entity, @Table, @Id, @Column, @ManyToOne...

// Import các annotation hỗ trợ bẫy lỗi dữ liệu đầu vào (Validation)
import jakarta.validation.constraints.*; // Annotations như @NotNull, @Min...

// Import các thư viện Lombok giúp tự động sinh các getter, setter, constructor
import lombok.*; // Annotations @Data, @NoArgsConstructor, @AllArgsConstructor

// Import kiểu dữ liệu số thực của Java
import java.math.BigDecimal; // Kiểu số thực chính xác cao cho giá tiền tại thời điểm mua

/**
 * @Entity: Khai báo lớp này là một thực thể JPA đại diện cho bảng dữ liệu.
 * @Table(name = "order_details"): Chỉ định tên bảng trong cơ sở dữ liệu MySQL tương ứng là "order_details".
 * @Data: Lombok tự động sinh ra Getter, Setter, toString, equals và hashCode.
 * @NoArgsConstructor: Lombok tự động sinh constructor không tham số.
 * @AllArgsConstructor: Lombok tự động sinh constructor có đầy đủ tham số.
 */
@Entity
@Table(name = "order_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDetail {

    // Khóa chính (Primary Key), tự động tăng (Auto-Increment)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Thiết lập quan hệ Nhiều-Một (Many-to-One) liên kết khóa ngoại với bảng "orders"
    // FetchType.EAGER: Tự động tải thông tin đơn hàng đi kèm khi truy vấn chi tiết đơn hàng
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "order_id", nullable = false)
    @NotNull(message = "Đơn hàng trực thuộc là bắt buộc")
    private Order order;

    // Thiết lập quan hệ Nhiều-Một (Many-to-One) liên kết khóa ngoại với bảng "product_variants"
    // FetchType.EAGER: Tự động tải thông tin biến thể sản phẩm đi kèm khi truy vấn chi tiết đơn hàng
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_variant_id", nullable = false)
    @NotNull(message = "Biến thể sản phẩm là bắt buộc")
    private ProductVariant productVariant;

    // Giá bán của sản phẩm tại thời điểm mua, DECIMAL(12,2)
    // Trường này rất quan trọng để lưu vết giá lịch sử giao dịch (nếu sau này admin đổi giá sản phẩm
    // thì giá trị đơn hàng cũ và doanh số báo cáo cũ cũng không bị thay đổi).
    @Column(name = "price", nullable = false, precision = 12, scale = 2)
    @NotNull(message = "Giá bán tại thời điểm mua là bắt buộc")
    @Min(value = 0, message = "Giá bán không được là số âm")
    private BigDecimal price;

    // Số lượng sản phẩm mua trong đơn hàng này, không được null, tối thiểu là 1
    @Column(name = "quantity", nullable = false)
    @NotNull(message = "Số lượng mua là bắt buộc")
    @Min(value = 1, message = "Số lượng mua tối thiểu phải từ 1 sản phẩm trở lên")
    private Integer quantity;
}

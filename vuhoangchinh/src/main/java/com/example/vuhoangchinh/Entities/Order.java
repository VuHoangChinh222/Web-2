package com.example.vuhoangchinh.Entities;

// Import các annotation của thư viện JPA để ánh xạ thực thể vào MySQL
import jakarta.persistence.*; // Annotations như @Entity, @Table, @Id, @Column, @ManyToOne...

// Import các annotation hỗ trợ bẫy lỗi dữ liệu đầu vào (Validation)
import jakarta.validation.constraints.*; // Annotations như @NotNull, @NotBlank, @Min, @Size, @Pattern...

// Import các thư viện Lombok giúp tự động sinh các getter, setter, constructor
import lombok.*; // Annotations @Data, @NoArgsConstructor, @AllArgsConstructor

// Import thư viện Hibernate hỗ trợ tự động tạo thời gian
import org.hibernate.annotations.CreationTimestamp; // Tự động ghi nhận thời gian tạo bản ghi
import org.hibernate.annotations.UpdateTimestamp; // Tự động cập nhật thời gian sửa bản ghi

// Import cấu trúc ngày giờ và số thực của Java
import java.math.BigDecimal; // Kiểu số thực chính xác cao cho tiền tệ
import java.time.LocalDateTime; // Kiểu dữ liệu ngày giờ hệ thống

/**
 * @Entity: Khai báo lớp này là một thực thể JPA đại diện cho bảng dữ liệu.
 * @Table(name = "orders"): Chỉ định tên bảng trong cơ sở dữ liệu MySQL tương ứng là "orders".
 * @Data: Lombok tự động sinh ra Getter, Setter, toString, equals và hashCode.
 * @NoArgsConstructor: Lombok tự động sinh constructor không tham số.
 * @AllArgsConstructor: Lombok tự động sinh constructor có đầy đủ tham số.
 */
@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    // Khóa chính (Primary Key), tự động tăng (Auto-Increment)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Thiết lập quan hệ Nhiều-Một (Many-to-One) liên kết khóa ngoại với bảng "customers"
    // FetchType.EAGER: Tự động tải thông tin khách hàng đi kèm khi truy vấn đơn hàng
    // nullable = true: Cho phép để trống (để hỗ trợ khách hàng vãng lai mua hàng không cần đăng ký tài khoản)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id", nullable = true)
    private Customer customer;

    // Mã hiển thị đơn hàng (Ví dụ: ORDER-17062026), là duy nhất (unique) và bắt buộc nhập
    @Column(name = "order_code", unique = true, nullable = false, length = 50)
    @NotBlank(message = "Mã hiển thị đơn hàng không được để trống")
    @Size(max = 50, message = "Mã đơn hàng tối đa 50 ký tự")
    private String orderCode;

    // Tên người nhận hàng, copy từ địa chỉ giao hàng lúc mua, bắt buộc nhập
    @Column(name = "recipient_name", nullable = false, length = 100)
    @NotBlank(message = "Tên người nhận không được để trống")
    @Size(max = 100, message = "Tên người nhận tối đa 100 ký tự")
    private String recipientName;

    // Số điện thoại nhận hàng, bắt buộc nhập, bẫy lỗi định dạng sđt Việt Nam (10 chữ số)
    @Column(name = "recipient_phone", nullable = false, length = 15)
    @NotBlank(message = "Số điện thoại nhận hàng không được để trống")
    @Pattern(regexp = "^(0|\\+84)(3|5|7|8|9)[0-9]{8}$", message = "Số điện thoại người nhận không đúng định dạng (Ví dụ: 0912345678)")
    private String recipientPhone;

    // Địa chỉ giao hàng đầy đủ lúc đặt hàng (đường, phường, quận, thành phố), bắt buộc nhập
    @Column(name = "shipping_address", nullable = false, length = 500)
    @NotBlank(message = "Địa chỉ giao hàng không được để trống")
    @Size(max = 500, message = "Địa chỉ giao hàng tối đa 500 ký tự")
    private String shippingAddress;

    // Tổng tiền của toàn bộ hàng hóa trong đơn (chưa tính phí ship), DECIMAL(12,2)
    @Column(name = "total_price", nullable = false, precision = 12, scale = 2)
    @NotNull(message = "Tổng tiền hàng không được để trống")
    @Min(value = 0, message = "Tổng tiền hàng không được là số âm")
    private BigDecimal totalPrice;

    // Phí vận chuyển của đơn hàng, mặc định là 0 nếu không nhập, DECIMAL(12,2)
    @Column(name = "shipping_fee", nullable = false, precision = 12, scale = 2)
    @Min(value = 0, message = "Phí vận chuyển không được là số âm")
    private BigDecimal shippingFee = BigDecimal.ZERO;

    // Tổng tiền khách phải thanh toán cuối cùng (total_price + shipping_fee)
    @Column(name = "grand_total", nullable = false, precision = 12, scale = 2)
    @NotNull(message = "Tổng thanh toán không được để trống")
    @Min(value = 0, message = "Tổng thanh toán không được là số âm")
    private BigDecimal grandTotal;

    // Phương thức thanh toán (e.g. COD, VNPAY, MOMO), tối đa 50 ký tự
    @Column(name = "payment_method", length = 50)
    @Size(max = 50, message = "Phương thức thanh toán tối đa 50 ký tự")
    private String paymentMethod;

    // Trạng thái thanh toán (PENDING, PAID, REFUNDED), mặc định ban đầu là PENDING
    @Column(name = "payment_status", length = 50)
    @Size(max = 50, message = "Trạng thái thanh toán tối đa 50 ký tự")
    private String paymentStatus = "PENDING";

    // Trạng thái đơn hàng (0 - Processing, 1 - Shipped, 2 - Completed, 3 - Cancelled), mặc định ban đầu là 0
    @Column(name = "order_status", length = 50)
    @Size(max = 50, message = "Trạng thái đơn hàng tối đa 50 ký tự")
    private String orderStatus = "0";

    // Ghi chú của khách hàng gửi tới cửa hàng
    @Column(columnDefinition = "TEXT")
    private String note;

    // Ngày tạo đơn hàng, tự động lưu thời điểm máy chủ lúc tạo mới, không cho phép update
    @Column(name = "created_at", updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    // Ngày cập nhật đơn hàng gần nhất, tự động lưu thời điểm máy chủ sửa đổi
    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}

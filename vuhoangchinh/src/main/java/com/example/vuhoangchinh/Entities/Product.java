package com.example.vuhoangchinh.Entities;

// Import các annotation JPA để ánh xạ thực thể Java sang bảng cơ sở dữ liệu MySQL
import jakarta.persistence.*; // Annotations như @Entity, @Table, @Id, @Column, @ManyToOne, v.v.

// Import Lombok giúp sinh mã tự động, viết mã nguồn ngắn gọn hơn
import lombok.*; // Annotations như @Data, @NoArgsConstructor, @AllArgsConstructor

// Import annotation của Hibernate hỗ trợ sinh thời gian tự động thao tác trên CSDL
import org.hibernate.annotations.CreationTimestamp; // Điền thời gian lúc tạo (Insert)
import org.hibernate.annotations.UpdateTimestamp; // Điền thời gian lúc sửa (Update)

// Import kiểu số thực chuyên tính toán tiền tệ của Java (có độ chính xác cao hơn Double/Float)
import java.math.BigDecimal;

// Import thư viện xử lý thời gian chuẩn của Java
import java.time.LocalDateTime;

/**
 * @Entity: Khai báo lớp này là một thực thể JPA được ánh xạ xuống Database.
 * @Table(name = "products"): Chỉ định tên bảng trong CSDL MySQL tương ứng là "products".
 * @Data: Lombok tự động sinh Getter, Setter, toString, equals và hashCode.
 * @NoArgsConstructor: Tự động tạo constructor không đối số (bắt buộc đối với JPA).
 * @AllArgsConstructor: Tự động tạo constructor chứa đầy đủ tất cả thuộc tính.
 */
@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    // Khóa chính tự động tăng (Auto-Increment) đại diện cho sản phẩm
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Khóa ngoại liên kết Nhiều - Một (@ManyToOne).
     * Nhiều sản phẩm có thể thuộc cùng Một danh mục sản phẩm (CategoryProduct).
     * @JoinColumn: Định nghĩa tên cột khóa ngoại là "category_id".
     */
    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private CategoryProduct category;

    // Tên sản phẩm hiển thị ra ngoài màn hình, không được null, dài tối đa 200 ký tự
    @Column(nullable = false, length = 200)
    private String name;

    // Đường dẫn tĩnh (Slug) cho SEO URL (Ví dụ: "ao-khoac-nam"), là duy nhất, không null
    @Column(unique = true, nullable = false, length = 200)
    private String slug;

    // Đoạn mô tả ngắn gọn về tính năng nổi bật của sản phẩm
    @Column(name = "short_description", length = 500)
    private String shortDescription;

    // Mô tả bài viết chi tiết sản phẩm (cho phép lưu mã HTML định dạng văn bản), dùng kiểu TEXT
    @Column(columnDefinition = "TEXT")
    private String description;

    // Đường dẫn tĩnh lưu URL của ảnh đại diện chính hiển thị trên sản phẩm, hỗ trợ Base64 dài
    @Column(columnDefinition = "LONGTEXT")
    private String thumbnail;

    // Giá niêm yết gốc của sản phẩm (sử dụng BigDecimal để tránh sai số tiền tệ), tối đa 12 chữ số, 2 số thập phân
    @Column(name = "base_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal basePrice;

    // Giá sau khi khuyến mãi hoặc giảm giá (nếu có)
    @Column(name = "discount_price", precision = 12, scale = 2)
    private BigDecimal discountPrice;

    // Trạng thái sản phẩm (1: Đang mở bán hiển thị bình thường, 0: Ngừng kinh doanh/Ẩn đi)
    @Column(nullable = false)
    private Integer status = 1;

    /**
     * @CreationTimestamp: Tự động gắn nhãn ngày giờ hiện tại của hệ thống khi dòng dữ liệu này được tạo mới.
     * updatable = false: Không cho phép cập nhật thay đổi mốc thời gian này bằng lệnh UPDATE.
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * @UpdateTimestamp: Tự động ghi nhận mốc thời gian cuối cùng mà sản phẩm này có sự điều chỉnh thông tin.
     */
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

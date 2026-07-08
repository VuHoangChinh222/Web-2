package com.example.vuhoangchinh.Entities;

// Import các annotation JPA để cấu hình ORM ánh xạ bảng dữ liệu MySQL
import jakarta.persistence.*; // Annotations như @Entity, @Table, @ManyToOne, @JoinColumn, v.v.

// Import thư viện Lombok hỗ trợ viết code ngắn gọn
import lombok.*; // Annotations như @Data, @NoArgsConstructor, @AllArgsConstructor

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * @Entity: Khai báo đây là một thực thể JPA được quản lý bởi Hibernate.
 * @Table(name = "user_addresses"): Chỉ định tên bảng trong cơ sở dữ liệu MySQL tương ứng là "user_addresses".
 * @Data: Lombok tự động sinh Getter, Setter, toString, equals, hashCode.
 * @NoArgsConstructor: Sinh Constructor không tham số.
 * @AllArgsConstructor: Sinh Constructor đầy đủ tham số.
 */
@Entity
@Table(name = "user_addresses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserAddress {

    // Khóa chính tự động tăng (Auto-Increment) đại diện cho mỗi dòng địa chỉ giao hàng
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Mối quan hệ Nhiều-Một (@ManyToOne): Nhiều địa chỉ có thể thuộc về Một khách hàng (Customer).
     * @JoinColumn(name = "customer_id", nullable = false): Định nghĩa khóa ngoại (Foreign Key)
     * liên kết cột "customer_id" tới cột khóa chính "id" của bảng "customers".
     */
    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    // Tên người nhận hàng, không được phép null, độ dài tối đa 100 ký tự
    @Column(name = "recipient_name", nullable = false, length = 100)
    private String recipientName;

    // Số điện thoại người nhận hàng, không được phép null, độ dài tối đa 15 ký tự
    @Column(name = "recipient_phone", nullable = false, length = 15)
    private String recipientPhone;

    // Địa chỉ chi tiết (Ví dụ: số 12, ngách 34, ngõ 56, đường Lê Lợi), không được null, dài tối đa 255 ký tự
    @Column(name = "address_line", nullable = false, length = 255)
    private String addressLine;

    // Phường/Xã nhận hàng, độ dài tối đa 100 ký tự
    @Column(length = 100)
    private String ward;

    // Quận/Huyện nhận hàng, độ dài tối đa 100 ký tự
    @Column(length = 100)
    private String district;

    // Tỉnh/Thành phố nhận hàng, độ dài tối đa 100 ký tự
    @Column(length = 100)
    private String city;

    // Đánh dấu địa chỉ giao hàng mặc định (true: Mặc định, false: Bình thường), mặc định là false
    @Column(name = "is_default", nullable = false)
    @JsonProperty("isDefault")
    private Boolean isDefault = false;

    public Boolean getIsDefault() {
        return isDefault;
    }

    public void setIsDefault(Boolean isDefault) {
        this.isDefault = isDefault;
    }
}

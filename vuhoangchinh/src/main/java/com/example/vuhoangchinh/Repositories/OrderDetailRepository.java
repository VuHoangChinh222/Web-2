package com.example.vuhoangchinh.Repositories;

// Import thực thể OrderDetail phục vụ kết nối dữ liệu
import com.example.vuhoangchinh.Entities.OrderDetail;

// Import các interface của Spring Data JPA
import org.springframework.data.jpa.repository.JpaRepository; // Cung cấp các hàm CRUD cơ bản
import org.springframework.data.domain.Page; // Hỗ trợ phân trang kết quả trả về
import org.springframework.data.domain.Pageable; // Cấu trúc thông tin phân trang & sắp xếp
import org.springframework.stereotype.Repository; // Đánh dấu là một Spring Repository Bean

// Import các cấu trúc dữ liệu của Java
import java.util.List;

/**
 * @Repository: Khai báo interface này là một Repository kết nối cơ sở dữ liệu.
 * Spring Data JPA sẽ tự động tạo lớp triển khai (implementation) chạy trên môi trường MySQL.
 * JpaRepository<OrderDetail, Long>: Thao tác trên bảng order_details với kiểu dữ liệu khóa chính là Long.
 */
@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {

    /**
     * Tìm kiếm danh sách tất cả các chi tiết hàng hóa đã mua thuộc một đơn hàng cụ thể (không phân trang).
     * @param orderId ID của đơn hàng cần tìm chi tiết hàng hóa
     * @return Danh sách các chi tiết đơn hàng tương ứng
     */
    List<OrderDetail> findByOrderId(Long orderId);

    /**
     * Tìm kiếm và phân trang danh sách các chi tiết hàng hóa đã mua thuộc một đơn hàng cụ thể.
     * @param orderId ID của đơn hàng cần tìm chi tiết hàng hóa
     * @param pageable Đối tượng cấu hình phân trang (trang hiện tại, kích thước trang, sắp xếp)
     * @return Một trang chứa danh sách chi tiết đơn hàng
     */
    Page<OrderDetail> findByOrderId(Long orderId, Pageable pageable);
}

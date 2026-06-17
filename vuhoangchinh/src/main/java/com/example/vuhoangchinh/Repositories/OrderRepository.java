package com.example.vuhoangchinh.Repositories;

// Import thực thể Order phục vụ kết nối dữ liệu
import com.example.vuhoangchinh.Entities.Order;

// Import các interface của Spring Data JPA
import org.springframework.data.jpa.repository.JpaRepository; // Cung cấp các hàm CRUD cơ bản
import org.springframework.data.domain.Page; // Kết quả trả về kèm phân trang
import org.springframework.data.domain.Pageable; // Cấu trúc thông tin phân trang & sắp xếp
import org.springframework.stereotype.Repository; // Đánh dấu là một Spring Repository Bean

// Import các cấu trúc dữ liệu của Java
import java.util.List;
import java.util.Optional;

/**
 * @Repository: Khai báo interface này là một Repository kết nối cơ sở dữ liệu.
 * Spring Data JPA sẽ tự động tạo lớp triển khai (implementation) chạy trên môi trường MySQL.
 * JpaRepository<Order, Long>: Thao tác trên bảng orders với kiểu dữ liệu khóa chính là Long.
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    /**
     * Tìm kiếm danh sách tất cả các đơn hàng thuộc một khách hàng cụ thể (không phân trang).
     * @param customerId ID của khách hàng cần tìm kiếm đơn hàng
     * @return Danh sách các đơn hàng tương ứng
     */
    List<Order> findByCustomerId(Long customerId);

    /**
     * Tìm kiếm và phân trang danh sách các đơn hàng thuộc một khách hàng cụ thể.
     * Thường dùng để hiển thị phần "Lịch sử mua hàng" ở trang cá nhân của khách.
     * @param customerId ID của khách hàng cần tìm kiếm đơn hàng
     * @param pageable Đối tượng cấu hình phân trang (trang hiện tại, kích thước trang, sắp xếp)
     * @return Một trang chứa danh sách đơn hàng
     */
    Page<Order> findByCustomerId(Long customerId, Pageable pageable);

    /**
     * Truy vấn tìm kiếm một đơn hàng dựa trên mã hiển thị đơn hàng (orderCode) duy nhất.
     * @param orderCode Mã đơn hàng cần tìm kiếm (e.g. ORDER-17062026)
     * @return Một Optional chứa thông tin đơn hàng nếu tồn tại, hoặc rỗng nếu không tìm thấy
     */
    Optional<Order> findByOrderCode(String orderCode);
}

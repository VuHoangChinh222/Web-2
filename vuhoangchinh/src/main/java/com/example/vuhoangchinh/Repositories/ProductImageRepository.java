package com.example.vuhoangchinh.Repositories;

// Import thực thể ProductImage phục vụ việc truy xuất dữ liệu
import com.example.vuhoangchinh.Entities.ProductImage;

// Import các interface của Spring Data JPA
import org.springframework.data.jpa.repository.JpaRepository; // Cung cấp các hàm CRUD cơ bản
import org.springframework.stereotype.Repository; // Đánh dấu đây là một Bean Repository của Spring

// Import kiểu cấu trúc dữ liệu Java
import java.util.List;

/**
 * @Repository: Khai báo interface này là một Repository kết nối cơ sở dữ liệu.
 * Spring Data JPA sẽ tự động tạo lớp triển khai (implementation) chạy trên môi trường MySQL.
 * JpaRepository<ProductImage, Long>: Thao tác trên bảng product_images với kiểu dữ liệu khóa chính là Long.
 */
@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {

    /**
     * Tìm kiếm danh sách tất cả các ảnh phụ thuộc một sản phẩm cụ thể.
     * Thường dùng để hiển thị bộ sưu tập ảnh (galley) dạng slide trên trang chi tiết sản phẩm.
     * @param productId ID của sản phẩm cần lấy ảnh
     * @return Danh sách các thực thể hình ảnh tương ứng
     */
    List<ProductImage> findByProductIdOrderBySortOrderAscIdAsc(Long productId);
}

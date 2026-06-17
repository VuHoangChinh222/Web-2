package com.example.vuhoangchinh.Repositories;

// Import thực thể Product để báo cho Spring Data biết Interface này quản lý bảng nào
import com.example.vuhoangchinh.Entities.Product;

// Import các cấu trúc lớp hỗ trợ tính năng phân trang (Pagination) của Spring Data
import org.springframework.data.domain.Page; // Định dạng kết quả trả về chứa dữ liệu kèm thông số trang
import org.springframework.data.domain.Pageable; // Định dạng đối tượng lưu trữ cấu hình số trang, giới hạn, sắp xếp

// Import thư viện chuẩn của JPA giúp tự động sinh các truy vấn cơ sở dữ liệu CRUD
import org.springframework.data.jpa.repository.JpaRepository;

// Import Annotation chuẩn của Spring
import org.springframework.stereotype.Repository; // Khai báo đây là một tầng truy cập dữ liệu (Data Access Layer)

// Import cấu trúc Option chuẩn của Java để tránh lỗi NullPointerException khi đối tượng rỗng
import java.util.Optional;

/**
 * @Repository: Đánh dấu lớp này là một Spring Bean phục vụ giao tiếp với Database.
 * JpaRepository<Product, Long>: Kế thừa thư viện giúp tự động có sẵn các hàm (save, delete, findById...)
 * cho thực thể Product (có khóa chính kiểu Long).
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    /**
     * Tìm kiếm một sản phẩm cụ thể theo đường dẫn SEO thân thiện (slug).
     * Hàm này trả về Optional, nếu không có dữ liệu sẽ an toàn không văng lỗi.
     */
    Optional<Product> findBySlug(String slug);
    
    /**
     * Lấy toàn bộ danh sách sản phẩm thuộc về một danh mục cụ thể (thông qua ID danh mục).
     * Do số lượng sản phẩm có thể rất lớn, nên trả về định dạng phân trang (Page).
     */
    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);
}

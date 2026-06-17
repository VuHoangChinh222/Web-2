package com.example.vuhoangchinh.Repositories;

// Import thực thể CategoryProduct để chỉ định kiểu thực thể quản lý
import com.example.vuhoangchinh.Entities.CategoryProduct;

// Import lớp JpaRepository từ Spring Data JPA cung cấp các hàm CRUD cơ bản
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// Import kiểu dữ liệu Optional đại diện cho giá trị có thể có hoặc không
import java.util.Optional;

/**
 * @Repository: Đánh dấu lớp này là một Repository, một Spring Bean phục vụ giao tiếp dữ liệu.
 */
@Repository
public interface CategoryProductRepository extends JpaRepository<CategoryProduct, Long> {
    
    /**
     * Tìm kiếm một danh mục sản phẩm theo đường dẫn SEO thân thiện (slug).
     * Phục vụ truy xuất danh mục nhanh chóng ở trang Frontend bán hàng.
     */
    Optional<CategoryProduct> findBySlug(String slug);
}

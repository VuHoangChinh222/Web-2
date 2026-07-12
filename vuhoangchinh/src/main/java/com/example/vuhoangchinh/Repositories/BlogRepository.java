package com.example.vuhoangchinh.Repositories;

// Import thực thể Blog phục vụ truy xuất dữ liệu
import com.example.vuhoangchinh.Entities.Blog;

// Import các interface của Spring Data JPA
import org.springframework.data.domain.Page; // Phân trang kết quả
import org.springframework.data.domain.Pageable; // Cấu hình thông tin phân trang & sắp xếp
import org.springframework.data.jpa.repository.JpaRepository; // Cung cấp các hàm CRUD cơ bản
import org.springframework.stereotype.Repository; // Đánh dấu là một Spring Repository Bean

// Import các lớp hỗ trợ Java
import java.util.List;
import java.util.Optional;

/**
 * @Repository: Khai báo interface này là một Repository kết nối cơ sở dữ liệu.
 * Spring Data JPA sẽ tự động tạo lớp triển khai (implementation) chạy trên môi trường MySQL.
 * JpaRepository<Blog, Long>: Thao tác trên bảng blogs với kiểu dữ liệu khóa chính là Long.
 */
@Repository
public interface BlogRepository extends JpaRepository<Blog, Long> {

    /**
     * Tìm kiếm danh sách tất cả các bài viết thuộc một danh mục tin tức cụ thể (không phân trang).
     * @param categoryId ID danh mục bài viết tin tức
     * @return Danh sách các bài viết tương ứng
     */
    List<Blog> findByCategoryBlogId(Long categoryId);

    /**
     * Tìm kiếm và phân trang danh sách các bài viết thuộc một danh mục tin tức cụ thể.
     * Thường dùng để hiển thị trang danh mục tin tức trên Frontend bán hàng.
     * @param categoryId ID danh mục bài viết tin tức
     * @param pageable Đối tượng cấu hình phân trang (trang hiện tại, kích thước trang, sắp xếp)
     * @return Một trang chứa danh sách bài viết
     */
    Page<Blog> findByCategoryBlogId(Long categoryId, Pageable pageable);

    /**
     * Truy vấn tìm kiếm một bài viết dựa trên đường dẫn SEO (slug) duy nhất.
     * Phục vụ trang xem chi tiết bài viết của khách hàng.
     * @param slug Chuỗi slug cần tìm kiếm (Ví dụ: "top-5-mau-giay-nike")
     * @return Một Optional chứa thực thể bài viết nếu tồn tại, hoặc rỗng nếu không tìm thấy
     */
    Optional<Blog> findBySlug(String slug);

    /**
     * Tìm kiếm danh sách tất cả bài viết của một tác giả cụ thể.
     */
    List<Blog> findByAuthorId(Long authorId);

    /**
     * Kiểm tra xem có bài viết nào thuộc danh mục này hay không.
     */
    boolean existsByCategoryBlogId(Long categoryBlogId);
}

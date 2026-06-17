package com.example.vuhoangchinh.Repositories;

// Import thực thể CategoryBlog phục vụ kết nối dữ liệu
import com.example.vuhoangchinh.Entities.CategoryBlog;

// Import các interface của Spring Data JPA
import org.springframework.data.jpa.repository.JpaRepository; // Cung cấp các hàm CRUD cơ bản
import org.springframework.stereotype.Repository; // Đánh dấu là một Spring Repository Bean

// Import lớp Optional hỗ trợ xử lý dữ liệu an toàn tránh NullPointerException
import java.util.Optional;

/**
 * @Repository: Khai báo interface này là một Repository kết nối cơ sở dữ liệu.
 * Spring Data JPA sẽ tự động tạo lớp triển khai (implementation) chạy trên môi trường MySQL.
 * JpaRepository<CategoryBlog, Long>: Thao tác trên bảng category_blogs với kiểu dữ liệu khóa chính là Long.
 */
@Repository
public interface CategoryBlogRepository extends JpaRepository<CategoryBlog, Long> {

    /**
     * Tìm kiếm một danh mục bài viết dựa trên đường dẫn SEO (slug) duy nhất.
     * Thường dùng để hiển thị danh sách bài viết thuộc danh mục đó trên giao diện người dùng.
     * @param slug Chuỗi slug cần tìm kiếm (Ví dụ: "meo-phoi-do")
     * @return Một Optional chứa thực thể nếu tồn tại, hoặc rỗng nếu không tìm thấy
     */
    Optional<CategoryBlog> findBySlug(String slug);
}

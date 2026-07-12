package com.example.vuhoangchinh.Controllers;

// Import thực thể và repository phục vụ truy xuất danh mục bài viết
import com.example.vuhoangchinh.Entities.CategoryBlog; // Thực thể danh mục bài viết
import com.example.vuhoangchinh.Repositories.CategoryBlogRepository; // Repository danh mục bài viết

// Import các annotation và lớp xử lý phản hồi HTTP của Spring Framework
import org.springframework.beans.factory.annotation.Autowired; // Tự động inject bean phụ thuộc
import org.springframework.http.ResponseEntity; // Bọc dữ liệu phản hồi kèm HTTP Status
import org.springframework.web.bind.annotation.*; // Định nghĩa router API RESTful

// Import các lớp hỗ trợ phân trang và sắp xếp dữ liệu
import org.springframework.data.domain.Page; // Phân trang kết quả
import org.springframework.data.domain.PageRequest; // Khởi tạo yêu cầu phân trang cụ thể
import org.springframework.data.domain.Pageable; // Interface phân trang chung
import org.springframework.data.domain.Sort; // Sắp xếp trường dữ liệu

// Import thư viện chuẩn của Java phục vụ chuẩn hóa văn bản sinh slug SEO
import java.text.Normalizer; // Loại bỏ các dấu tiếng Việt

// Import thư viện validation
import jakarta.validation.Valid;

/**
 * @RestController: Khai báo lớp này là một REST Controller để trả về dữ liệu JSON.
 * @RequestMapping("/api/category-blogs"): Định nghĩa đường dẫn gốc dùng chung cho mọi API danh mục bài viết.
 * @CrossOrigin(origins = "*"): Cho phép gọi API chéo miền từ các cổng Frontend khác nhau (tránh lỗi CORS).
 */
@RestController
@RequestMapping("/api/category-blogs")
@CrossOrigin(origins = "*")
public class CategoryBlogController {

    // Tiêm repository danh mục bài viết để giao tiếp CSDL
    @Autowired
    private CategoryBlogRepository categoryBlogRepository;

    // Tiêm repository bài viết để kiểm tra bài viết trực thuộc trước khi xóa
    @Autowired
    private com.example.vuhoangchinh.Repositories.BlogRepository blogRepository;

    /**
     * API Lấy danh sách danh mục bài viết hỗ trợ phân trang và sắp xếp.
     * GET /api/category-blogs?page=0&size=10&sortBy=id&sortDir=asc
     */
    @GetMapping
    public Page<CategoryBlog> getAllCategories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
                
        Pageable pageable = PageRequest.of(page, size, sort);
        return categoryBlogRepository.findAll(pageable);
    }

    /**
     * API Lấy thông tin chi tiết danh mục bài viết theo ID.
     * GET /api/category-blogs/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getCategoryById(@PathVariable Long id) {
        CategoryBlog category = categoryBlogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category blog not found with id " + id));
        return ResponseEntity.ok(category);
    }

    /**
     * API Lấy thông tin danh mục bài viết theo đường dẫn SEO (slug).
     * GET /api/category-blogs/slug/{slug}
     */
    @GetMapping("/slug/{slug}")
    public ResponseEntity<?> getCategoryBySlug(@PathVariable String slug) {
        CategoryBlog category = categoryBlogRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Category blog not found with slug " + slug));
        return ResponseEntity.ok(category);
    }

    /**
     * API Thêm mới một danh mục bài viết (POST).
     * Tự động sinh slug chuẩn SEO nếu client gửi lên để trống.
     * POST /api/category-blogs
     */
    @PostMapping
    public ResponseEntity<?> createCategory(@Valid @RequestBody CategoryBlog category) {
        // Kiểm tra bắt buộc nhập tên danh mục
        if (category.getName() == null || category.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Tên danh mục bài viết không được để trống");
        }

        // Tự động tạo slug nếu không được cung cấp hoặc để trống
        if (category.getSlug() == null || category.getSlug().trim().isEmpty()) {
            category.setSlug(generateSlug(category.getName()));
        } else {
            category.setSlug(generateSlug(category.getSlug()));
        }

        // Kiểm tra xem slug này đã tồn tại trong DB chưa để tránh lỗi trùng lặp Unique Constraint
        if (categoryBlogRepository.findBySlug(category.getSlug()).isPresent()) {
            return ResponseEntity.badRequest().body("Mã đường dẫn SEO (slug) '" + category.getSlug() + "' đã tồn tại trong hệ thống");
        }

        CategoryBlog savedCategory = categoryBlogRepository.save(category);
        return ResponseEntity.ok(savedCategory);
    }

    /**
     * API Cập nhật thông tin danh mục bài viết theo ID.
     * PUT /api/category-blogs/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @Valid @RequestBody CategoryBlog categoryDetails) {
        CategoryBlog category = categoryBlogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category blog not found with id " + id));

        // Cập nhật các trường cơ bản
        category.setName(categoryDetails.getName());
        category.setImageUrl(categoryDetails.getImageUrl());
        category.setDescription(categoryDetails.getDescription());

        // Kiểm tra và cập nhật slug
        String targetSlug = categoryDetails.getSlug();
        if (targetSlug == null || targetSlug.trim().isEmpty()) {
            targetSlug = generateSlug(categoryDetails.getName());
        } else {
            targetSlug = generateSlug(targetSlug);
        }

        // Nếu thay đổi slug, kiểm tra xem slug mới có bị trùng lặp với danh mục khác không
        if (!targetSlug.equals(category.getSlug())) {
            if (categoryBlogRepository.findBySlug(targetSlug).isPresent()) {
                return ResponseEntity.badRequest().body("Mã đường dẫn SEO (slug) '" + targetSlug + "' đã tồn tại ở danh mục khác");
            }
            category.setSlug(targetSlug);
        }

        CategoryBlog updatedCategory = categoryBlogRepository.save(category);
        return ResponseEntity.ok(updatedCategory);
    }

    /**
     * API Xóa danh mục bài viết theo ID.
     * DELETE /api/category-blogs/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        CategoryBlog category = categoryBlogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category blog not found with id " + id));
        
        // Kiểm tra ràng buộc bài viết trực thuộc
        if (blogRepository.existsByCategoryBlogId(id)) {
            return ResponseEntity.badRequest().body("Cannot delete category: There are posts in this category.");
        }

        categoryBlogRepository.delete(category);
        return ResponseEntity.ok("Xóa danh mục bài viết thành công");
    }

    /**
     * Hàm nội bộ tự động sinh SEO Slug thân thiện từ Tên danh mục (ví dụ: "Giày Thể Thao Nam" -> "giay-the-thao-nam").
     * Loại bỏ các dấu tiếng Việt, ký tự đặc biệt và thay thế các khoảng trắng bằng dấu gạch ngang.
     */
    private String generateSlug(String input) {
        if (input == null || input.trim().isEmpty()) {
            return "";
        }
        
        // 1. Chuyển sang chữ thường
        String slug = input.toLowerCase();
        
        // 2. Tách và loại bỏ các ký tự dấu tiếng Việt sử dụng Normalizer Form NFD
        slug = Normalizer.normalize(slug, Normalizer.Form.NFD);
        slug = slug.replaceAll("\\p{M}", ""); // Xóa bỏ các ký tự dấu tổ hợp (ví dụ dấu huyền, sắc, hỏi...)
        
        // 3. Thay thế thủ công các chữ cái đặc biệt của tiếng Việt
        slug = slug.replaceAll("đ", "d");
        
        // 4. Loại bỏ các ký tự đặc biệt, giữ lại chữ cái, số, khoảng trắng và dấu gạch ngang
        slug = slug.replaceAll("[^a-z0-9\\s-]", "");
        
        // 5. Thay thế nhiều khoảng trắng liên tiếp bằng duy nhất một dấu gạch ngang
        slug = slug.replaceAll("\\s+", "-");
        
        // 6. Thay thế nhiều dấu gạch ngang liên tiếp bằng một dấu gạch ngang duy nhất
        slug = slug.replaceAll("-+", "-");
        
        // 7. Cắt bỏ dấu gạch ngang thừa ở đầu hoặc cuối chuỗi
        slug = slug.trim().replaceAll("^-|-$", "");
        
        return slug;
    }
}

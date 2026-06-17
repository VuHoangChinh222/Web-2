package com.example.vuhoangchinh.Controllers;

// Import các thực thể và kho lưu trữ CSDL nội bộ
import com.example.vuhoangchinh.Entities.Blog; // Thực thể bài viết
import com.example.vuhoangchinh.Entities.CategoryBlog; // Thực thể danh mục bài viết
import com.example.vuhoangchinh.Entities.User; // Thực thể tác giả (Nhân viên viết bài)
import com.example.vuhoangchinh.Repositories.BlogRepository; // Repository bài viết
import com.example.vuhoangchinh.Repositories.CategoryBlogRepository; // Repository danh mục bài viết
import com.example.vuhoangchinh.Repositories.UserRepository; // Repository tài khoản nhân viên

// Import Lombok giúp tự sinh mã nguồn gọn gàng
import lombok.*; // Annotations @Data, @NoArgsConstructor, @AllArgsConstructor

// Import các annotation của Spring Framework phục vụ xây dựng API RESTful
import org.springframework.beans.factory.annotation.Autowired; // Inject bean tự động
import org.springframework.http.ResponseEntity; // Đối tượng bọc dữ liệu phản hồi kèm HTTP Status
import org.springframework.web.bind.annotation.*; // Các ánh xạ REST API (@RestController, @GetMapping...)

// Import các lớp hỗ trợ phân trang và sắp xếp dữ liệu từ Spring Data
import org.springframework.data.domain.Page; // Phân trang kết quả
import org.springframework.data.domain.PageRequest; // Khởi tạo yêu cầu phân trang cụ thể
import org.springframework.data.domain.Pageable; // Interface phân trang chung
import org.springframework.data.domain.Sort; // Sắp xếp trường dữ liệu

// Import thư viện chuẩn của Java phục vụ chuẩn hóa văn bản sinh slug SEO
import java.text.Normalizer; // Loại bỏ các dấu tiếng Việt

// Import thư viện validation bẫy lỗi dữ liệu
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

/**
 * @RestController: Khai báo lớp này là một REST Controller để trả về dữ liệu JSON.
 * @RequestMapping("/api/blogs"): Định nghĩa đường dẫn gốc dùng chung cho mọi API bài viết.
 * @CrossOrigin(origins = "*"): Cho phép gọi API chéo miền từ các cổng Frontend khác nhau (tránh lỗi CORS).
 */
@RestController
@RequestMapping("/api/blogs")
@CrossOrigin(origins = "*")
public class BlogController {

    // Tiêm repository bài viết
    @Autowired
    private BlogRepository blogRepository;

    // Tiêm repository danh mục bài viết để tìm và gán danh mục liên quan
    @Autowired
    private CategoryBlogRepository categoryBlogRepository;

    // Tiêm repository nhân viên để tìm và gán tác giả viết bài
    @Autowired
    private UserRepository userRepository;

    /**
     * DTO (Data Transfer Object) phẳng dùng để nhận dữ liệu từ client gửi lên khi thêm/sửa bài viết.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BlogRequest {

        @NotNull(message = "ID danh mục bài viết trực thuộc là bắt buộc")
        private Long categoryId; // Mã danh mục bài viết

        @NotNull(message = "ID nhân viên tác giả viết bài là bắt buộc")
        private Long authorId; // Mã nhân viên viết bài

        @NotBlank(message = "Tiêu đề bài viết không được để trống")
        @Size(max = 200, message = "Tiêu đề bài viết tối đa 200 ký tự")
        private String title; // Tiêu đề bài viết

        private String slug; // Đường dẫn SEO (nếu rỗng hệ thống sẽ tự sinh)

        @Size(max = 500, message = "Nội dung tóm tắt tối đa 500 ký tự")
        private String summary; // Tóm tắt nội dung bài viết

        @NotBlank(message = "Nội dung chi tiết bài viết không được để trống")
        private String content; // Nội dung chi tiết bài viết (HTML/Markdown)

        private String thumbnail; // Ảnh đại diện thu nhỏ

        @NotBlank(message = "Đường dẫn ảnh banner không được để trống")
        @Size(max = 255, message = "Đường dẫn ảnh banner tối đa 255 ký tự")
        private String imageUrl; // Ảnh banner lớn

        private Integer status = 1; // Trạng thái: 1 (Đăng tải), 0 (Bản nháp)
    }

    /**
     * API Lấy danh sách toàn bộ bài viết trong hệ thống (Hỗ trợ phân trang và sắp xếp).
     * GET /api/blogs?page=0&size=10&sortBy=id&sortDir=desc
     */
    @GetMapping
    public Page<Blog> getAllBlogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
                
        Pageable pageable = PageRequest.of(page, size, sort);
        return blogRepository.findAll(pageable);
    }

    /**
     * API Lấy danh sách bài viết thuộc về một danh mục cụ thể (Hỗ trợ phân trang và sắp xếp).
     * GET /api/blogs/category/{categoryId}?page=0&size=10
     */
    @GetMapping("/category/{categoryId}")
    public Page<Blog> getBlogsByCategoryId(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        // Rà soát xem danh mục bài viết có tồn tại không
        if (!categoryBlogRepository.existsById(categoryId)) {
            throw new RuntimeException("Category blog not found with id " + categoryId);
        }

        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
                
        Pageable pageable = PageRequest.of(page, size, sort);
        return blogRepository.findByCategoryBlogId(categoryId, pageable);
    }

    /**
     * API Xem thông tin chi tiết một bài viết theo ID.
     * GET /api/blogs/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getBlogById(@PathVariable Long id) {
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog not found with id " + id));
        return ResponseEntity.ok(blog);
    }

    /**
     * API Xem thông tin chi tiết một bài viết theo đường dẫn SEO (slug) duy nhất.
     * GET /api/blogs/slug/{slug}
     */
    @GetMapping("/slug/{slug}")
    public ResponseEntity<?> getBlogBySlug(@PathVariable String slug) {
        Blog blog = blogRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Blog not found with slug " + slug));
        return ResponseEntity.ok(blog);
    }

    /**
     * API Thêm mới một bài viết (POST).
     * Tự động sinh mã SEO slug từ tiêu đề bài viết nếu client để trống.
     * POST /api/blogs
     */
    @PostMapping
    public ResponseEntity<?> createBlog(@Valid @RequestBody BlogRequest request) {
        // Tìm danh mục bài viết trực thuộc
        CategoryBlog category = categoryBlogRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category blog not found with id " + request.getCategoryId()));

        // Tìm tác giả nhân viên viết bài
        User author = userRepository.findById(request.getAuthorId())
                .orElseThrow(() -> new RuntimeException("User author not found with id " + request.getAuthorId()));

        // Tự động tạo slug chuẩn SEO nếu không được cung cấp hoặc để trống
        String targetSlug = request.getSlug();
        if (targetSlug == null || targetSlug.trim().isEmpty()) {
            targetSlug = generateSlug(request.getTitle());
        } else {
            targetSlug = generateSlug(targetSlug);
        }

        // Kiểm tra tránh trùng lặp slug trong hệ thống
        if (blogRepository.findBySlug(targetSlug).isPresent()) {
            return ResponseEntity.badRequest().body("Mã đường dẫn SEO (slug) '" + targetSlug + "' đã tồn tại trong hệ thống");
        }

        // Tạo thực thể và gán thông tin
        Blog blog = new Blog();
        blog.setCategoryBlog(category);
        blog.setAuthor(author);
        blog.setTitle(request.getTitle().trim());
        blog.setSlug(targetSlug);
        blog.setSummary(request.getSummary());
        blog.setContent(request.getContent());
        blog.setThumbnail(request.getThumbnail());
        blog.setImageUrl(request.getImageUrl().trim());
        blog.setStatus(request.getStatus() != null ? request.getStatus() : 1);

        Blog savedBlog = blogRepository.save(blog);
        return ResponseEntity.ok(savedBlog);
    }

    /**
     * API Cập nhật nội dung bài viết theo ID.
     * PUT /api/blogs/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBlog(@PathVariable Long id, @Valid @RequestBody BlogRequest request) {
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog not found with id " + id));

        // Kiểm tra và cập nhật danh mục bài viết mới
        if (!blog.getCategoryBlog().getId().equals(request.getCategoryId())) {
            CategoryBlog category = categoryBlogRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category blog not found with id " + request.getCategoryId()));
            blog.setCategoryBlog(category);
        }

        // Kiểm tra và cập nhật tác giả mới (nếu có chuyển quyền)
        if (!blog.getAuthor().getId().equals(request.getAuthorId())) {
            User author = userRepository.findById(request.getAuthorId())
                    .orElseThrow(() -> new RuntimeException("User author not found with id " + request.getAuthorId()));
            blog.setAuthor(author);
        }

        // Cập nhật thông tin tiêu đề, tóm tắt và nội dung chính
        blog.setTitle(request.getTitle().trim());
        blog.setSummary(request.getSummary());
        blog.setContent(request.getContent());
        blog.setThumbnail(request.getThumbnail());
        blog.setImageUrl(request.getImageUrl().trim());
        if (request.getStatus() != null) {
            blog.setStatus(request.getStatus());
        }

        // Xử lý slug cập nhật
        String targetSlug = request.getSlug();
        if (targetSlug == null || targetSlug.trim().isEmpty()) {
            targetSlug = generateSlug(request.getTitle());
        } else {
            targetSlug = generateSlug(targetSlug);
        }

        // Kiểm tra tránh trùng lặp slug với bài viết khác
        if (!targetSlug.equals(blog.getSlug())) {
            if (blogRepository.findBySlug(targetSlug).isPresent()) {
                return ResponseEntity.badRequest().body("Mã đường dẫn SEO (slug) '" + targetSlug + "' đã tồn tại ở bài viết khác");
            }
            blog.setSlug(targetSlug);
        }

        Blog updatedBlog = blogRepository.save(blog);
        return ResponseEntity.ok(updatedBlog);
    }

    /**
     * API Xóa bài viết theo ID.
     * DELETE /api/blogs/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBlog(@PathVariable Long id) {
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog not found with id " + id));
        blogRepository.delete(blog);
        return ResponseEntity.ok("Xóa bài viết thành công");
    }

    /**
     * Hàm nội bộ tự động sinh SEO Slug thân thiện từ Tiêu đề bài viết.
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

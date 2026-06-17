package com.example.vuhoangchinh.Controllers;

// Import thực thể và repository phục vụ truy xuất danh mục sản phẩm
import com.example.vuhoangchinh.Entities.CategoryProduct; // Thực thể chứa thông tin danh mục sản phẩm
import com.example.vuhoangchinh.Repositories.CategoryProductRepository; // Repository tương tác CSDL bảng category_products

// Import các annotation của Spring Framework
import org.springframework.beans.factory.annotation.Autowired; // Tự động inject bean phụ thuộc
import org.springframework.http.ResponseEntity; // Đại diện cho phản hồi HTTP (status, headers, body)
import org.springframework.web.bind.annotation.*; // Các annotations định nghĩa API RESTful (@RestController, @GetMapping, v.v.)

// Import các lớp hỗ trợ phân trang và sắp xếp từ Spring Data
import org.springframework.data.domain.Page; // Đại diện cho một trang kết quả kèm thông tin phân trang
import org.springframework.data.domain.PageRequest; // Khởi tạo đối tượng yêu cầu phân trang cụ thể
import org.springframework.data.domain.Pageable; // Giao diện trừu tượng hóa tham số phân trang
import org.springframework.data.domain.Sort; // Định nghĩa tiêu chí sắp xếp (cột nào, tăng hay giảm)

// Import thư viện chuẩn của Java phục vụ chuẩn hóa văn bản
import java.text.Normalizer; // Dùng để loại bỏ dấu tiếng Việt (ví dụ: á -> a)

// Import thư viện validation
import jakarta.validation.Valid;

/**
 * @RestController: Khai báo lớp này là một REST Controller, trả về JSON tự động.
 * @RequestMapping("/api/category-products"): Đặt tiền tố chung cho các API quản lý Danh mục sản phẩm.
 * @CrossOrigin(origins = "*"): Cho phép mọi domain khác gọi API (CORS).
 */
@RestController
@RequestMapping("/api/category-products")
@CrossOrigin(origins = "*")
public class CategoryProductController {

    // Tiêm repository của Danh mục sản phẩm để thao tác với Database
    @Autowired
    private CategoryProductRepository categoryProductRepository;

    /**
     * API Lấy danh sách danh mục sản phẩm hỗ trợ phân trang và sắp xếp.
     * GET /api/category-products?page=0&size=10&sortBy=id&sortDir=asc
     */
    @GetMapping
    public Page<CategoryProduct> getAllCategories(
            @RequestParam(defaultValue = "0") int page, // Số trang muốn lấy (bắt đầu từ 0)
            @RequestParam(defaultValue = "10") int size, // Số lượng phần tử mỗi trang
            @RequestParam(defaultValue = "id") String sortBy, // Trường cần sắp xếp (ví dụ: name, slug, id)
            @RequestParam(defaultValue = "asc") String sortDir) { // Hướng sắp xếp: asc hoặc desc
        
        // Tạo đối tượng Sort dựa theo hướng và thuộc tính sắp xếp
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();

        // Tạo đối tượng phân trang Pageable
        Pageable pageable = PageRequest.of(page, size, sort);

        // Gọi repository lấy dữ liệu phân trang
        return categoryProductRepository.findAll(pageable);
    }

    /**
     * API Lấy thông tin chi tiết danh mục sản phẩm theo mã ID.
     * GET /api/category-products/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getCategoryById(@PathVariable Long id) {
        CategoryProduct category = categoryProductRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id " + id));
        return ResponseEntity.ok(category);
    }

    /**
     * API Lấy thông tin danh mục sản phẩm theo đường dẫn SEO (slug).
     * Phục vụ trang danh mục sản phẩm của khách hàng trên Website Frontend.
     * GET /api/category-products/slug/{slug}
     */
    @GetMapping("/slug/{slug}")
    public ResponseEntity<?> getCategoryBySlug(@PathVariable String slug) {
        CategoryProduct category = categoryProductRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Category not found with slug " + slug));
        return ResponseEntity.ok(category);
    }

    /**
     * API Thêm mới một danh mục sản phẩm.
     * POST /api/category-products
     * Hỗ trợ tự động tạo SEO slug từ tên danh mục nếu client để trống.
     */
    @PostMapping
    public ResponseEntity<?> createCategory(@Valid @RequestBody CategoryProduct category) {
        // Kiểm tra nếu tên danh mục trống thì báo lỗi 400
        if (category.getName() == null || category.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Category name is required");
        }

        // Tự động tạo slug nếu không được cung cấp hoặc để trống
        if (category.getSlug() == null || category.getSlug().trim().isEmpty()) {
            category.setSlug(generateSlug(category.getName()));
        } else {
            // Chuẩn hóa slug do người dùng truyền lên thành chữ thường và gạch ngang hợp lệ
            category.setSlug(generateSlug(category.getSlug()));
        }

        // Kiểm tra xem slug này đã tồn tại trong DB chưa (vì slug là trường duy nhất - Unique)
        if (categoryProductRepository.findBySlug(category.getSlug()).isPresent()) {
            return ResponseEntity.badRequest().body("Category slug '" + category.getSlug() + "' already exists");
        }

        // Lưu danh mục mới vào Database
        CategoryProduct savedCategory = categoryProductRepository.save(category);
        return ResponseEntity.ok(savedCategory);
    }

    /**
     * API Cập nhật thông tin danh mục sản phẩm theo ID.
     * PUT /api/category-products/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @Valid @RequestBody CategoryProduct categoryDetails) {
        CategoryProduct category = categoryProductRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id " + id));

        // Cập nhật các trường cơ bản
        category.setName(categoryDetails.getName());
        category.setDescription(categoryDetails.getDescription());
        category.setImageUrl(categoryDetails.getImageUrl());
        category.setStatus(categoryDetails.getStatus());

        // Kiểm tra và cập nhật slug
        String targetSlug = categoryDetails.getSlug();
        if (targetSlug == null || targetSlug.trim().isEmpty()) {
            targetSlug = generateSlug(categoryDetails.getName());
        } else {
            targetSlug = generateSlug(targetSlug);
        }

        // Nếu thay đổi slug, kiểm tra xem slug mới có bị trùng lặp với danh mục khác không
        if (!targetSlug.equals(category.getSlug())) {
            if (categoryProductRepository.findBySlug(targetSlug).isPresent()) {
                return ResponseEntity.badRequest().body("Category slug '" + targetSlug + "' already exists");
            }
            category.setSlug(targetSlug);
        }

        // Lưu cập nhật vào CSDL
        CategoryProduct updatedCategory = categoryProductRepository.save(category);
        return ResponseEntity.ok(updatedCategory);
    }

    /**
     * API Xóa danh mục sản phẩm theo mã ID.
     * DELETE /api/category-products/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        CategoryProduct category = categoryProductRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id " + id));
        
        categoryProductRepository.delete(category);
        return ResponseEntity.ok("Category with id " + id + " has been deleted successfully");
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

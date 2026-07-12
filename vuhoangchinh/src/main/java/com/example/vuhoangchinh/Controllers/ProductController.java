package com.example.vuhoangchinh.Controllers;

// Import các thực thể và kho lưu trữ liên quan đến sản phẩm và danh mục sản phẩm
import com.example.vuhoangchinh.Entities.CategoryProduct; // Thực thể danh mục
import com.example.vuhoangchinh.Entities.Product; // Thực thể sản phẩm
import com.example.vuhoangchinh.Repositories.CategoryProductRepository; // Nơi truy xuất danh mục trong CSDL
import com.example.vuhoangchinh.Repositories.ProductRepository; // Nơi truy xuất sản phẩm trong CSDL
import com.example.vuhoangchinh.Services.AiSyncService; // Service đồng bộ AI

// Import Lombok hỗ trợ tự động sinh code (Getter/Setter/Constructors)
import lombok.*;

// Import các annotation và lớp xử lý phản hồi HTTP của Spring Framework
import org.springframework.beans.factory.annotation.Autowired; // Tự động Inject Bean
import org.springframework.http.ResponseEntity; // Bọc đối tượng dữ liệu gửi qua HTTP (kèm HTTP Status)
import org.springframework.web.bind.annotation.*; // Các khai báo đường dẫn REST API

// Import các lớp hỗ trợ phân trang và sắp xếp dữ liệu từ Spring Data
import org.springframework.data.domain.Page; // Phân trang dữ liệu trả về
import org.springframework.data.domain.PageRequest; // Cấu trúc số liệu phân trang cụ thể
import org.springframework.data.domain.Pageable; // Interface thao tác phân trang chung
import org.springframework.data.domain.Sort; // Bộ công cụ hỗ trợ sắp xếp trường dữ liệu

// Import các thư viện lõi của Java
import java.math.BigDecimal; // Kiểu số thực chính xác cao
import java.text.Normalizer; // Công cụ chuẩn hóa bộ chữ cái tiếng Việt

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

/**
 * @RestController: Khai báo lớp này là một REST Controller, mọi dữ liệu tự động chuyển sang JSON.
 * @RequestMapping("/api/products"): Đường dẫn gốc định danh cho tất cả các API thao tác Sản phẩm.
 * @CrossOrigin(origins = "*"): Cho phép chia sẻ tài nguyên tới mọi website khác domain gọi đến (phục vụ FE).
 */
@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    // Inject kho truy xuất CSDL Sản phẩm
    @Autowired
    private ProductRepository productRepository;

    // Inject kho truy xuất CSDL Danh mục (để kiểm tra xem danh mục có tồn tại không khi thêm sản phẩm)
    @Autowired
    private CategoryProductRepository categoryRepository;

    // Inject service gọi đồng bộ sang Server AI
    @Autowired
    private AiSyncService aiSyncService;

    // Inject kho truy xuất CSDL Đơn hàng để kiểm tra trước khi xóa
    @Autowired
    private com.example.vuhoangchinh.Repositories.OrderRepository orderRepository;

    /**
     * DTO (Data Transfer Object) dùng để chứa thông tin người dùng gửi lên khi thêm/sửa sản phẩm.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductRequest {
        @NotNull(message = "ID danh mục là bắt buộc nhập")
        private Long categoryId; // Mã danh mục mà sản phẩm này trực thuộc
        
        @NotBlank(message = "Tên sản phẩm không được để trống")
        @Size(max = 200, message = "Tên sản phẩm tối đa 200 ký tự")
        private String name; // Tên sản phẩm
        
        private String slug; // Đường dẫn tĩnh (nếu rỗng sẽ tự sinh)
        private String shortDescription; // Đoạn mô tả ngắn gọn
        private String description; // Chi tiết mô tả
        private String thumbnail; // Ảnh bìa chính
        
        @NotNull(message = "Giá gốc (basePrice) là bắt buộc nhập")
        @Min(value = 0, message = "Giá gốc không được là số âm")
        private BigDecimal basePrice; // Giá chưa giảm
        
        @Min(value = 0, message = "Giá khuyến mãi không được là số âm")
        private BigDecimal discountPrice; // Giá đã giảm
        
        private Integer status; // Tình trạng kinh doanh
    }

    /**
     * API Lấy danh sách tất cả các sản phẩm (Hỗ trợ Phân trang và Sắp xếp).
     * GET /api/products?page=0&size=10&sortBy=id&sortDir=asc
     */
    @GetMapping
    public Page<Product> getAllProducts(
            @RequestParam(defaultValue = "0") int page, // Trang số mấy
            @RequestParam(defaultValue = "10") int size, // Tối đa bao nhiêu mục một trang
            @RequestParam(defaultValue = "id") String sortBy, // Thuộc tính sắp xếp
            @RequestParam(defaultValue = "asc") String sortDir, // Sắp xếp Tăng (asc) hay Giảm (desc)
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice) {
        
        // Thiết lập bộ quy tắc sắp xếp
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
                
        // Áp dụng bộ thông số sắp xếp và phân trang vào đối tượng Pageable
        Pageable pageable = PageRequest.of(page, size, sort);
        
        // Nếu không có bất kỳ bộ lọc nào được cung cấp, sử dụng findAll
        if (categoryId == null && (keyword == null || keyword.trim().isEmpty()) && minPrice == null && maxPrice == null) {
            return productRepository.findAll(pageable);
        }
        
        // Ngược lại, thực hiện lọc theo các tham số được cung cấp
        String searchKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;
        return productRepository.filterProducts(categoryId, searchKeyword, minPrice, maxPrice, pageable);
    }

    /**
     * API Lấy danh sách sản phẩm nằm trong một Danh mục cụ thể (Hỗ trợ phân trang).
     * GET /api/products/category/{categoryId}
     */
    @GetMapping("/category/{categoryId}")
    public Page<Product> getProductsByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        // Xây dựng hướng sắp xếp
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
                
        Pageable pageable = PageRequest.of(page, size, sort);
        
        // Tìm toàn bộ sản phẩm thuộc Danh mục này
        return productRepository.findByCategoryId(categoryId, pageable);
    }

    /**
     * API Lấy 5 sản phẩm mới nhất.
     * GET /api/products/newest
     */
    @GetMapping("/newest")
    public ResponseEntity<?> getNewestProducts() {
        Pageable pageable = PageRequest.of(0, 5, Sort.by("id").descending());
        Page<Product> newestProducts = productRepository.findAll(pageable);
        return ResponseEntity.ok(newestProducts.getContent());
    }

    /**
     * API Lấy 5 sản phẩm bán chạy nhất (fallback lấy theo ID tăng dần).
     * GET /api/products/best-sellers
     */
    @GetMapping("/best-sellers")
    public ResponseEntity<?> getBestSellers() {
        Pageable pageable = PageRequest.of(0, 5, Sort.by("id").ascending());
        Page<Product> bestSellers = productRepository.findAll(pageable);
        return ResponseEntity.ok(bestSellers.getContent());
    }

    /**
     * API Lấy thông tin chi tiết một sản phẩm thông qua ID.
     * GET /api/products/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id " + id));
        return ResponseEntity.ok(product);
    }

    /**
     * API Lấy thông tin chi tiết một sản phẩm thông qua chuỗi Slug.
     * Rất quan trọng để hiển thị chi tiết sản phẩm trên trình duyệt một cách chuẩn SEO.
     * GET /api/products/slug/{slug}
     */
    @GetMapping("/slug/{slug}")
    public ResponseEntity<?> getProductBySlug(@PathVariable String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Product not found with slug " + slug));
        return ResponseEntity.ok(product);
    }

    /**
     * API Tạo mới một Sản phẩm vào CSDL.
     * POST /api/products
     */
    @PostMapping
    public ResponseEntity<?> createProduct(@Valid @RequestBody ProductRequest request) {
        // Bắt buộc phải có ID danh mục để biết sản phẩm thuộc phân loại nào
        if (request.getCategoryId() == null) {
            return ResponseEntity.badRequest().body("Category ID is required");
        }
        
        // Tìm xem Danh mục này có tồn tại không
        CategoryProduct category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        // Kiểm tra tính hợp lệ của giá tiền
        if (request.getBasePrice() == null) {
            return ResponseEntity.badRequest().body("Base price is required");
        }
        if (request.getDiscountPrice() != null && request.getDiscountPrice().compareTo(request.getBasePrice()) > 0) {
            return ResponseEntity.badRequest().body("Discount price cannot be greater than base price");
        }

        // Tạo ra thực thể Sản phẩm mới và điền thông tin từ Request gửi lên
        Product product = new Product();
        product.setCategory(category);
        product.setName(request.getName());
        product.setShortDescription(request.getShortDescription());
        product.setDescription(request.getDescription());
        product.setThumbnail(request.getThumbnail());
        product.setBasePrice(request.getBasePrice());
        product.setDiscountPrice(request.getDiscountPrice());
        product.setStatus(request.getStatus() != null ? request.getStatus() : 1);

        // NẾU khách hàng không điền Slug (Ví dụ thêm sản phẩm qua App), hệ thống tự động sinh ra slug
        // từ tên của Sản phẩm. NẾU khách hàng tự điền, hệ thống sẽ tiến hành chuẩn hóa nó thành dạng URL.
        String slug = request.getSlug();
        if (slug == null || slug.trim().isEmpty()) {
            slug = generateSlug(request.getName());
        } else {
            slug = generateSlug(slug);
        }

        // Slug là thuộc tính không cho phép trùng lặp, phải kiểm tra tránh bị lỗi Constraint Violation
        if (productRepository.findBySlug(slug).isPresent()) {
            return ResponseEntity.badRequest().body("Product slug '" + slug + "' already exists");
        }
        product.setSlug(slug);

        // Lưu bản ghi vào CSDL
        Product savedProduct = productRepository.save(product);
        
        // KÍCH HOẠT: Đồng bộ sản phẩm vừa Thêm sang Bot AI
        aiSyncService.syncProductToAi(savedProduct);
        
        return ResponseEntity.ok(savedProduct);
    }

    /**
     * API Cập nhật toàn diện nội dung Sản phẩm thông qua ID.
     * PUT /api/products/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        // Kiểm tra xem ID sản phẩm gửi lên có tồn tại trong CSDL hay không
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id " + id));

        // NẾU có gửi lên ID Danh mục mới, thì đổi lại danh mục cho sản phẩm này
        if (request.getCategoryId() != null) {
            CategoryProduct category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            product.setCategory(category);
        }

        // Kiểm tra hợp lệ giá tiền trước khi cập nhật
        BigDecimal newBasePrice = request.getBasePrice() != null ? request.getBasePrice() : product.getBasePrice();
        BigDecimal newDiscountPrice = request.getDiscountPrice() != null ? request.getDiscountPrice() : product.getDiscountPrice();
        
        if (newDiscountPrice != null && newDiscountPrice.compareTo(newBasePrice) > 0) {
            return ResponseEntity.badRequest().body("Discount price cannot be greater than base price");
        }

        // Cập nhật tất cả các trường
        product.setName(request.getName());
        product.setShortDescription(request.getShortDescription());
        product.setDescription(request.getDescription());
        product.setThumbnail(request.getThumbnail());
        if (request.getBasePrice() != null) {
            product.setBasePrice(request.getBasePrice());
        }
        product.setDiscountPrice(request.getDiscountPrice());
        if (request.getStatus() != null) {
            product.setStatus(request.getStatus());
        }

        // Quy trình cập nhật lại chuỗi SEO Slug
        String targetSlug = request.getSlug();
        if (targetSlug == null || targetSlug.trim().isEmpty()) {
            targetSlug = generateSlug(request.getName()); // Tự sinh
        } else {
            targetSlug = generateSlug(targetSlug); // Chuẩn hóa
        }

        // Nếu chuỗi slug này bị thay đổi so với phiên bản cũ, cần rà soát xem có bị trùng với SP nào khác không
        if (!targetSlug.equals(product.getSlug())) {
            if (productRepository.findBySlug(targetSlug).isPresent()) {
                return ResponseEntity.badRequest().body("Product slug '" + targetSlug + "' already exists");
            }
            product.setSlug(targetSlug);
        }

        // Cập nhật thực thể vào CSDL
        Product updatedProduct = productRepository.save(product);
        
        // KÍCH HOẠT: Đồng bộ thông tin sản phẩm vừa Sửa sang Bot AI
        aiSyncService.syncProductToAi(updatedProduct);
        
        return ResponseEntity.ok(updatedProduct);
    }

    /**
     * API Xóa cứng Sản phẩm khỏi CSDL theo ID.
     * DELETE /api/products/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id " + id));
        
        // Kiểm tra xem sản phẩm có nằm trong đơn hàng nào không
        java.util.List<com.example.vuhoangchinh.Entities.Order> containingOrders = orderRepository.findOrdersByProductId(id);
        if (!containingOrders.isEmpty()) {
            java.util.List<java.util.Map<String, Object>> orderInfoList = new java.util.ArrayList<>();
            for (com.example.vuhoangchinh.Entities.Order o : containingOrders) {
                java.util.Map<String, Object> map = new java.util.HashMap<>();
                map.put("id", o.getId());
                map.put("orderCode", o.getOrderCode());
                map.put("recipientName", o.getRecipientName());
                map.put("createdAt", o.getCreatedAt() != null ? o.getCreatedAt().toString() : "");
                orderInfoList.add(map);
            }
            java.util.Map<String, Object> errorResponse = new java.util.HashMap<>();
            errorResponse.put("error", "REFERENCED");
            errorResponse.put("message", "Sản phẩm đang nằm trong các đơn hàng");
            errorResponse.put("orders", orderInfoList);
            return ResponseEntity.badRequest().body(errorResponse);
        }

        productRepository.delete(product);
        
        // KÍCH HOẠT: Xóa thông tin khỏi trí nhớ của Bot AI
        aiSyncService.deleteProductFromAi(id);
        
        return ResponseEntity.ok("Product deleted successfully");
    }

    /**
     * Hàm hỗ trợ tự sinh chuỗi tĩnh (Slug) tiêu chuẩn.
     * Mục đích: Lọc bỏ hết dấu tiếng Việt, thay chữ đ, xóa các ký tự đặc biệt, nối các khoảng trắng bằng dấu -
     */
    private String generateSlug(String input) {
        if (input == null || input.trim().isEmpty()) return "";
        String slug = input.toLowerCase(); // Chuyển về chữ in thường
        
        // Loại bỏ dấu bằng Normalizer NFD
        slug = Normalizer.normalize(slug, Normalizer.Form.NFD);
        slug = slug.replaceAll("\\p{M}", "").replaceAll("đ", "d");
        
        // Loại bỏ các chữ cái không thuộc hệ tiếng Anh và chữ số
        slug = slug.replaceAll("[^a-z0-9\\s-]", "");
        
        // Cắt bỏ và nối khoảng trắng
        slug = slug.replaceAll("\\s+", "-").replaceAll("-+", "-");
        
        return slug.trim().replaceAll("^-|-$", "");
    }
}

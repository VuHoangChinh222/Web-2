package com.example.vuhoangchinh.Controllers;

// Import các thực thể và kho lưu trữ CSDL liên quan
import com.example.vuhoangchinh.Entities.Product; // Thực thể sản phẩm để đối chiếu khóa ngoại
import com.example.vuhoangchinh.Entities.ProductVariant; // Thực thể biến thể sản phẩm
import com.example.vuhoangchinh.Repositories.ProductRepository; // Repository tương tác bảng products
import com.example.vuhoangchinh.Repositories.ProductVariantRepository; // Repository tương tác bảng product_variants

// Import Lombok hỗ trợ tự sinh code
import lombok.*; // Annotations như @Data, @NoArgsConstructor, @AllArgsConstructor

// Import các annotation của Spring Framework phục vụ xây dựng API RESTful
import org.springframework.beans.factory.annotation.Autowired; // Tự động inject dependency
import org.springframework.http.ResponseEntity; // Bọc phản hồi HTTP kèm status code
import org.springframework.web.bind.annotation.*; // Định nghĩa router, request mapping, v.v.

// Import các lớp hỗ trợ phân trang và sắp xếp dữ liệu
import org.springframework.data.domain.Page; // Kết quả trả về kèm metadata phân trang
import org.springframework.data.domain.PageRequest; // Yêu cầu phân trang cụ thể
import org.springframework.data.domain.Pageable; // Interface phân trang chung
import org.springframework.data.domain.Sort; // Bộ sắp xếp trường dữ liệu

// Import thư viện validation bẫy lỗi dữ liệu đầu vào
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

// Import các thư viện Java chuẩn
import java.math.BigDecimal; // Kiểu số thực độ chính xác cao cho giá tiền

/**
 * @RestController: Khai báo lớp này là một REST Controller, tự động chuyển đổi dữ liệu trả về thành JSON.
 * @RequestMapping("/api/product-variants"): Định cấu hình đường dẫn API gốc cho tài nguyên biến thể sản phẩm.
 * @CrossOrigin(origins = "*"): Cho phép Frontend gọi API chéo miền tránh lỗi CORS.
 */
@RestController
@RequestMapping("/api/product-variants")
@CrossOrigin(origins = "*")
public class ProductVariantController {

    // Tiêm repository biến thể sản phẩm
    @Autowired
    private ProductVariantRepository productVariantRepository;

    // Tiêm repository sản phẩm để tìm kiếm sản phẩm gốc khi liên kết biến thể
    @Autowired
    private ProductRepository productRepository;

    /**
     * DTO (Data Transfer Object) phẳng dùng để nhận yêu cầu thêm mới/cập nhật biến thể sản phẩm.
     * Cấu trúc phẳng giúp client truyền dữ liệu dễ dàng không cần tạo đối tượng lồng ghép phức tạp.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductVariantRequest {
        
        @NotNull(message = "Product ID is required")
        private Long productId;

        @Size(max = 255, message = "Size must be at most 255 characters")
        private String size;

        @Size(max = 50, message = "Color must be at most 50 characters")
        private String color;

        @Min(value = 0, message = "Price cannot be negative")
        private BigDecimal price;

        @Min(value = 0, message = "Sale price cannot be negative")
        private BigDecimal salePrice;

        @NotNull(message = "Stock quantity is required")
        @Min(value = 0, message = "Stock quantity cannot be negative")
        private Integer stockQuantity = 0;

        @Size(max = 50, message = "SKU must be at most 50 characters")
        private String sku; // Removed @NotBlank to allow auto-generation when empty

        private Integer status = 1;
    }

    /**
     * API Lấy danh sách tất cả các biến thể sản phẩm (Hỗ trợ phân trang và sắp xếp).
     * GET /api/product-variants?page=0&size=10&sortBy=id&sortDir=asc
     */
    @GetMapping
    public Page<ProductVariant> getAllVariants(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
                
        Pageable pageable = PageRequest.of(page, size, sort);
        return productVariantRepository.findAll(pageable);
    }

    /**
     * API Lấy danh sách biến thể của một Sản phẩm cụ thể (Hỗ trợ phân trang và sắp xếp).
     * GET /api/product-variants/product/{productId}?page=0&size=10
     */
    @GetMapping("/product/{productId}")
    public Page<ProductVariant> getVariantsByProductId(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
                
        Pageable pageable = PageRequest.of(page, size, sort);
        return productVariantRepository.findByProductId(productId, pageable);
    }

    /**
     * API Lấy chi tiết thông tin một biến thể sản phẩm theo ID.
     * GET /api/product-variants/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getVariantById(@PathVariable Long id) {
        ProductVariant variant = productVariantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product variant not found with id " + id));
        return ResponseEntity.ok(variant);
    }

    @PostMapping
    public ResponseEntity<?> createVariant(@Valid @RequestBody ProductVariantRequest request) {
        // Tìm sản phẩm gốc xem có tồn tại không
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found with id " + request.getProductId()));

        // Bẫy lỗi 1: Kiểm tra trùng lặp Size và Color
        if (productVariantRepository.findByProductIdAndSizeAndColor(product.getId(), request.getSize(), request.getColor()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Variant with Size '" + request.getSize() + "' and Color '" + request.getColor() + "' already exists for this product!");
        }

        // Tự sinh SKU nếu Admin để trống
        String sku = request.getSku();
        if (sku == null || sku.trim().isEmpty()) {
            String safeSize = request.getSize() != null ? request.getSize().replaceAll("\\s+", "").toUpperCase() : "X";
            String safeColor = request.getColor() != null ? request.getColor().replaceAll("\\s+", "").toUpperCase() : "X";
            sku = "PROD" + product.getId() + "-" + safeSize + "-" + safeColor + "-" + java.util.UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        } else {
            sku = sku.trim();
        }

        // Bẫy lỗi 2: Kiểm tra xem mã SKU này đã tồn tại trong CSDL hay chưa
        if (productVariantRepository.findBySku(sku).isPresent()) {
            return ResponseEntity.badRequest().body("SKU code '" + sku + "' already exists in the system");
        }

        // Tạo đối tượng thực thể và sao chép dữ liệu từ request DTO
        ProductVariant variant = new ProductVariant();
        variant.setProduct(product);
        variant.setSize(request.getSize());
        variant.setColor(request.getColor());
        variant.setPrice(request.getPrice());
        variant.setSalePrice(request.getSalePrice());
        variant.setStockQuantity(request.getStockQuantity());
        variant.setSku(sku);
        variant.setStatus(request.getStatus() != null ? request.getStatus() : 1);

        ProductVariant savedVariant = productVariantRepository.save(variant);
        return ResponseEntity.ok(savedVariant);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateVariant(@PathVariable Long id, @Valid @RequestBody ProductVariantRequest request) {
        // Tìm biến thể cũ trong DB
        ProductVariant variant = productVariantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product variant not found with id " + id));

        // Kiểm tra xem sản phẩm gốc mới có tồn tại không (nếu thay đổi sản phẩm gốc)
        if (!variant.getProduct().getId().equals(request.getProductId())) {
            Product product = productRepository.findById(request.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found with id " + request.getProductId()));
            variant.setProduct(product);
        }

        // Bẫy lỗi 1: Kiểm tra trùng chéo Size và Color với một biến thể khác (khác ID hiện tại)
        java.util.Optional<ProductVariant> existingClash = productVariantRepository.findByProductIdAndSizeAndColor(variant.getProduct().getId(), request.getSize(), request.getColor());
        if (existingClash.isPresent() && !existingClash.get().getId().equals(id)) {
            return ResponseEntity.badRequest().body("Error: Cannot update to Size '" + request.getSize() + "' and Color '" + request.getColor() + "' because this configuration already exists in another variant!");
        }

        // Bẫy lỗi 2: Kiểm tra trùng chéo SKU với biến thể khác khi cập nhật SKU
        String newSku = request.getSku();
        if (newSku == null || newSku.trim().isEmpty()) {
            newSku = variant.getSku(); // Giữ nguyên SKU nếu Admin bỏ trống
        } else {
            newSku = newSku.trim();
        }

        if (!variant.getSku().equalsIgnoreCase(newSku)) {
            if (productVariantRepository.findBySku(newSku).isPresent()) {
                return ResponseEntity.badRequest().body("SKU code '" + newSku + "' already exists in another variant");
            }
            variant.setSku(newSku);
        }

        // Cập nhật các thông tin khác
        variant.setSize(request.getSize());
        variant.setColor(request.getColor());
        variant.setPrice(request.getPrice());
        variant.setSalePrice(request.getSalePrice());
        variant.setStockQuantity(request.getStockQuantity());
        if (request.getStatus() != null) {
            variant.setStatus(request.getStatus());
        }

        ProductVariant updatedVariant = productVariantRepository.save(variant);
        return ResponseEntity.ok(updatedVariant);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVariant(@PathVariable Long id) {
        ProductVariant variant = productVariantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product variant not found with id " + id));
        
        try {
            // Disconnect from parent Product to prevent CascadeType.ALL from re-persisting this variant
            Product product = variant.getProduct();
            if (product != null && product.getVariants() != null) {
                product.getVariants().remove(variant);
            }
            productVariantRepository.delete(variant);
            return ResponseEntity.ok("Product variant deleted successfully");
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body("SECURITY ERROR: This variant is linked to existing transactions/orders and cannot be hard deleted. Please change its status to Hidden instead!");
        }
    }

    @PostMapping("/bulk")
    public ResponseEntity<?> createVariantsBulk(@Valid @RequestBody java.util.List<ProductVariantRequest> requests) {
        java.util.List<ProductVariant> savedVariants = new java.util.ArrayList<>();
        
        for (ProductVariantRequest request : requests) {
            Product product = productRepository.findById(request.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found with id " + request.getProductId()));

            // Skip if already exists
            if (productVariantRepository.findByProductIdAndSizeAndColor(product.getId(), request.getSize(), request.getColor()).isPresent()) {
                continue; 
            }

            String sku = request.getSku();
            if (sku == null || sku.trim().isEmpty()) {
                String safeSize = request.getSize() != null ? request.getSize().replaceAll("\\s+", "").toUpperCase() : "X";
                String safeColor = request.getColor() != null ? request.getColor().replaceAll("\\s+", "").toUpperCase() : "X";
                sku = "PROD" + product.getId() + "-" + safeSize + "-" + safeColor + "-" + java.util.UUID.randomUUID().toString().substring(0, 4).toUpperCase();
            } else {
                sku = sku.trim();
            }

            // Skip if sku exists
            if (productVariantRepository.findBySku(sku).isPresent()) {
                continue;
            }

            ProductVariant variant = new ProductVariant();
            variant.setProduct(product);
            variant.setSize(request.getSize());
            variant.setColor(request.getColor());
            variant.setPrice(request.getPrice());
            variant.setSalePrice(request.getSalePrice());
            variant.setStockQuantity(request.getStockQuantity());
            variant.setSku(sku);
            variant.setStatus(request.getStatus() != null ? request.getStatus() : 1);

            savedVariants.add(productVariantRepository.save(variant));
        }
        return ResponseEntity.ok(savedVariants);
    }

    @GetMapping("/colors")
    public ResponseEntity<?> getDistinctColors() {
        return ResponseEntity.ok(productVariantRepository.findDistinctColors());
    }

    @GetMapping("/sizes")
    public ResponseEntity<?> getDistinctSizes() {
        return ResponseEntity.ok(productVariantRepository.findDistinctSizes());
    }
}

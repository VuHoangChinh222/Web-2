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
        
        @NotNull(message = "Mã ID sản phẩm trực thuộc là bắt buộc")
        private Long productId; // ID của sản phẩm gốc sở hữu biến thể này

        @Size(max = 20, message = "Kích cỡ tối đa 20 ký tự")
        private String size; // Kích cỡ (size)

        @Size(max = 50, message = "Màu sắc tối đa 50 ký tự")
        private String color; // Màu sắc (color)

        @Min(value = 0, message = "Giá bán biến thể không được là số âm")
        private BigDecimal price; // Giá bán riêng của biến thể (nếu có)

        @NotNull(message = "Số lượng tồn kho là bắt buộc")
        @Min(value = 0, message = "Số lượng tồn kho không được là số âm")
        private Integer stockQuantity = 0; // Số lượng tồn kho của biến thể

        @NotBlank(message = "Mã SKU quản lý kho hàng không được để trống")
        @Size(max = 50, message = "Mã SKU tối đa 50 ký tự")
        private String sku; // Mã quản lý kho hàng riêng biệt (e.g. NIKE-AM40-B)
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

    /**
     * API Thêm mới một biến thể sản phẩm (Kiểm tra trùng SKU).
     * POST /api/product-variants
     */
    @PostMapping
    public ResponseEntity<?> createVariant(@Valid @RequestBody ProductVariantRequest request) {
        // Tìm sản phẩm gốc xem có tồn tại không
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found with id " + request.getProductId()));

        // Kiểm tra xem mã SKU này đã tồn tại trong CSDL hay chưa
        if (productVariantRepository.findBySku(request.getSku()).isPresent()) {
            return ResponseEntity.badRequest().body("Mã SKU '" + request.getSku() + "' đã tồn tại trong hệ thống");
        }

        // Tạo đối tượng thực thể và sao chép dữ liệu từ request DTO
        ProductVariant variant = new ProductVariant();
        variant.setProduct(product);
        variant.setSize(request.getSize());
        variant.setColor(request.getColor());
        variant.setPrice(request.getPrice());
        variant.setStockQuantity(request.getStockQuantity());
        variant.setSku(request.getSku().trim());

        ProductVariant savedVariant = productVariantRepository.save(variant);
        return ResponseEntity.ok(savedVariant);
    }

    /**
     * API Cập nhật thông tin biến thể sản phẩm theo ID (Kiểm tra trùng chéo SKU).
     * PUT /api/product-variants/{id}
     */
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

        // Kiểm tra trùng chéo SKU với biến thể khác khi cập nhật SKU
        String newSku = request.getSku().trim();
        if (!variant.getSku().equalsIgnoreCase(newSku)) {
            if (productVariantRepository.findBySku(newSku).isPresent()) {
                return ResponseEntity.badRequest().body("Mã SKU '" + newSku + "' đã tồn tại ở một biến thể khác");
            }
            variant.setSku(newSku);
        }

        // Cập nhật các thông tin khác
        variant.setSize(request.getSize());
        variant.setColor(request.getColor());
        variant.setPrice(request.getPrice());
        variant.setStockQuantity(request.getStockQuantity());

        ProductVariant updatedVariant = productVariantRepository.save(variant);
        return ResponseEntity.ok(updatedVariant);
    }

    /**
     * API Xóa biến thể sản phẩm khỏi CSDL theo ID.
     * DELETE /api/product-variants/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVariant(@PathVariable Long id) {
        ProductVariant variant = productVariantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product variant not found with id " + id));
        productVariantRepository.delete(variant);
        return ResponseEntity.ok("Xóa biến thể sản phẩm thành công");
    }
}

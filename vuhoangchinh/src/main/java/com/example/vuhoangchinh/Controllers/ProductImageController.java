package com.example.vuhoangchinh.Controllers;

// Import các thực thể và kho lưu trữ CSDL nội bộ
import com.example.vuhoangchinh.Entities.Product; // Thực thể sản phẩm
import com.example.vuhoangchinh.Entities.ProductImage; // Thực thể ảnh sản phẩm
import com.example.vuhoangchinh.Repositories.ProductRepository; // Repository tương tác bảng products
import com.example.vuhoangchinh.Repositories.ProductImageRepository; // Repository tương tác bảng product_images

// Import Lombok hỗ trợ tự sinh code
import lombok.*; // Annotations @Data, @NoArgsConstructor, @AllArgsConstructor

// Import các annotation và lớp xử lý phản hồi HTTP của Spring Framework
import org.springframework.beans.factory.annotation.Autowired; // Tự động inject bean phụ thuộc
import org.springframework.http.ResponseEntity; // Bọc dữ liệu phản hồi kèm status code HTTP
import org.springframework.web.bind.annotation.*; // Định nghĩa Router RESTful API

// Import thư viện validation bẫy lỗi đầu vào
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

// Import cấu trúc dữ liệu Java chuẩn
import java.util.List;

/**
 * @RestController: Khai báo lớp này là một REST Controller, tự động chuyển đổi dữ liệu trả về thành JSON.
 * @RequestMapping("/api/product-images"): Cấu hình tiền tố đường dẫn chung cho mọi API ảnh sản phẩm.
 * @CrossOrigin(origins = "*"): Cho phép Frontend gọi API chéo miền tránh lỗi CORS.
 */
@RestController
@RequestMapping("/api/product-images")
@CrossOrigin(origins = "*")
public class ProductImageController {

    // Tiêm repository quản lý ảnh sản phẩm
    @Autowired
    private ProductImageRepository productImageRepository;

    // Tiêm repository sản phẩm để tìm kiếm sản phẩm gốc khi liên kết ảnh
    @Autowired
    private ProductRepository productRepository;

    /**
     * DTO (Data Transfer Object) phẳng dùng để chứa dữ liệu khi client gửi yêu cầu thêm/sửa ảnh sản phẩm.
     * Cấu trúc phẳng đơn giản hóa việc truyền dữ liệu từ phía Client.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductImageRequest {

        @NotNull(message = "Mã ID sản phẩm trực thuộc là bắt buộc")
        private Long productId; // ID của sản phẩm gốc sở hữu bức ảnh này

        @NotBlank(message = "Đường dẫn hình ảnh không được để trống")
        private String imageUrl; // URL đường dẫn tới hình ảnh
    }

    /**
     * API Lấy toàn bộ danh sách ảnh sản phẩm có trong hệ thống.
     * GET /api/product-images
     */
    @GetMapping
    public List<ProductImage> getAllImages() {
        return productImageRepository.findAll();
    }

    /**
     * API Lấy danh sách tất cả các ảnh phụ thuộc một sản phẩm cụ thể.
     * GET /api/product-images/product/{productId}
     */
    @GetMapping("/product/{productId}")
    public List<ProductImage> getImagesByProductId(@PathVariable Long productId) {
        // Kiểm tra xem sản phẩm có tồn tại không trước khi trả về danh sách ảnh
        if (!productRepository.existsById(productId)) {
            throw new RuntimeException("Product not found with id " + productId);
        }
        return productImageRepository.findByProductId(productId);
    }

    /**
     * API Xem thông tin chi tiết một bức ảnh theo ID.
     * GET /api/product-images/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getImageById(@PathVariable Long id) {
        ProductImage image = productImageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product image not found with id " + id));
        return ResponseEntity.ok(image);
    }

    /**
     * API Thêm mới một hình ảnh phụ vào bộ sưu tập của sản phẩm.
     * POST /api/product-images
     */
    @PostMapping
    public ResponseEntity<?> createImage(@Valid @RequestBody ProductImageRequest request) {
        // Tìm sản phẩm gốc xem có tồn tại không
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found with id " + request.getProductId()));

        // Khởi tạo thực thể mới và sao chép dữ liệu từ request DTO
        ProductImage productImage = new ProductImage();
        productImage.setProduct(product);
        productImage.setImageUrl(request.getImageUrl().trim());

        ProductImage savedImage = productImageRepository.save(productImage);
        return ResponseEntity.ok(savedImage);
    }

    /**
     * API Cập nhật thông tin đường dẫn ảnh hoặc liên kết sản phẩm theo ID ảnh.
     * PUT /api/product-images/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateImage(@PathVariable Long id, @Valid @RequestBody ProductImageRequest request) {
        // Tìm bản ghi ảnh cũ trong CSDL
        ProductImage productImage = productImageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product image not found with id " + id));

        // Kiểm tra xem sản phẩm gốc mới có tồn tại không (nếu thay đổi sản phẩm gốc)
        if (!productImage.getProduct().getId().equals(request.getProductId())) {
            Product product = productRepository.findById(request.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found with id " + request.getProductId()));
            productImage.setProduct(product);
        }

        // Cập nhật đường dẫn ảnh mới
        productImage.setImageUrl(request.getImageUrl().trim());

        ProductImage updatedImage = productImageRepository.save(productImage);
        return ResponseEntity.ok(updatedImage);
    }

    /**
     * API Xóa ảnh khỏi bộ sưu tập của sản phẩm theo ID ảnh.
     * DELETE /api/product-images/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteImage(@PathVariable Long id) {
        ProductImage productImage = productImageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product image not found with id " + id));
        productImageRepository.delete(productImage);
        return ResponseEntity.ok("Xóa ảnh sản phẩm thành công");
    }
}

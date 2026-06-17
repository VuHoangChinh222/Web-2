package com.example.vuhoangchinh.Controllers;

// Import các thực thể và kho lưu trữ CSDL liên quan
import com.example.vuhoangchinh.Entities.Order; // Thực thể đơn hàng tổng quát
import com.example.vuhoangchinh.Entities.OrderDetail; // Thực thể chi tiết đơn hàng
import com.example.vuhoangchinh.Entities.ProductVariant; // Thực thể biến thể sản phẩm đã mua
import com.example.vuhoangchinh.Repositories.OrderRepository; // Repository đơn hàng
import com.example.vuhoangchinh.Repositories.OrderDetailRepository; // Repository chi tiết đơn hàng
import com.example.vuhoangchinh.Repositories.ProductVariantRepository; // Repository biến thể sản phẩm

// Import Lombok giúp tự động sinh mã nguồn gọn gàng
import lombok.*; // Annotations @Data, @NoArgsConstructor, @AllArgsConstructor

// Import các annotation của Spring Framework phục vụ xây dựng API RESTful
import org.springframework.beans.factory.annotation.Autowired; // Inject bean tự động
import org.springframework.http.ResponseEntity; // Đối tượng bọc phản hồi HTTP kèm status code
import org.springframework.web.bind.annotation.*; // Các ánh xạ API RESTful (@RestController, @GetMapping...)

// Import các lớp hỗ trợ phân trang và sắp xếp dữ liệu
import org.springframework.data.domain.Page; // Phân trang kết quả
import org.springframework.data.domain.PageRequest; // Khởi tạo yêu cầu phân trang cụ thể
import org.springframework.data.domain.Pageable; // Interface phân trang chung
import org.springframework.data.domain.Sort; // Sắp xếp trường dữ liệu

// Import thư viện validation bẫy lỗi dữ liệu
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

// Import cấu trúc dữ liệu Java
import java.math.BigDecimal; // Kiểu số thực độ chính xác cao cho giá tiền tại thời điểm mua
import java.util.List;

/**
 * @RestController: Khai báo lớp này là một REST Controller để trả về dữ liệu JSON.
 * @RequestMapping("/api/order-details"): Định nghĩa đường dẫn gốc dùng chung cho mọi API chi tiết đơn hàng.
 * @CrossOrigin(origins = "*"): Cho phép gọi API chéo miền từ các cổng Frontend khác nhau (tránh lỗi CORS).
 */
@RestController
@RequestMapping("/api/order-details")
@CrossOrigin(origins = "*")
public class OrderDetailController {

    // Tiêm repository chi tiết đơn hàng
    @Autowired
    private OrderDetailRepository orderDetailRepository;

    // Tiêm repository đơn hàng để đối chiếu đơn hàng cha
    @Autowired
    private OrderRepository orderRepository;

    // Tiêm repository biến thể sản phẩm để đối chiếu biến thể sản phẩm mua
    @Autowired
    private ProductVariantRepository productVariantRepository;

    /**
     * DTO (Data Transfer Object) phẳng dùng để nhận dữ liệu từ client gửi lên khi thêm/sửa chi tiết mặt hàng trong đơn.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderDetailRequest {

        @NotNull(message = "Mã ID đơn hàng trực thuộc là bắt buộc")
        private Long orderId; // ID đơn hàng cha

        @NotNull(message = "Mã ID biến thể sản phẩm mua là bắt buộc")
        private Long productVariantId; // ID biến thể sản phẩm mua

        @NotNull(message = "Giá bán tại thời điểm mua là bắt buộc")
        @Min(value = 0, message = "Giá bán không được là số âm")
        private BigDecimal price; // Giá tại thời điểm mua

        @NotNull(message = "Số lượng mua hàng là bắt buộc")
        @Min(value = 1, message = "Số lượng mua tối thiểu phải từ 1 sản phẩm trở lên")
        private Integer quantity; // Số lượng mua
    }

    /**
     * API Lấy toàn bộ danh sách các chi tiết đơn hàng (Hỗ trợ phân trang và sắp xếp).
     * GET /api/order-details?page=0&size=10&sortBy=id&sortDir=desc
     */
    @GetMapping
    public Page<OrderDetail> getAllOrderDetails(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
                
        Pageable pageable = PageRequest.of(page, size, sort);
        return orderDetailRepository.findAll(pageable);
    }

    /**
     * API Lấy danh sách tất cả các chi tiết mặt hàng đã mua thuộc một Đơn hàng cụ thể (Không phân trang).
     * GET /api/order-details/order/{orderId}
     */
    @GetMapping("/order/{orderId}")
    public List<OrderDetail> getDetailsByOrderId(@PathVariable Long orderId) {
        // Rà soát xem đơn hàng có tồn tại không trước khi trả về chi tiết đơn hàng
        if (!orderRepository.existsById(orderId)) {
            throw new RuntimeException("Order not found with id " + orderId);
        }
        return orderDetailRepository.findByOrderId(orderId);
    }

    /**
     * API Xem thông tin chi tiết một dòng mặt hàng đã mua theo ID chi tiết đơn hàng.
     * GET /api/order-details/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getDetailById(@PathVariable Long id) {
        OrderDetail detail = orderDetailRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order detail not found with id " + id));
        return ResponseEntity.ok(detail);
    }

    /**
     * API Thêm một sản phẩm mới vào đơn hàng (POST).
     * POST /api/order-details
     */
    @PostMapping
    public ResponseEntity<?> createOrderDetail(@Valid @RequestBody OrderDetailRequest request) {
        // Tìm đơn hàng cha
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found with id " + request.getOrderId()));

        // Tìm biến thể sản phẩm mua
        ProductVariant variant = productVariantRepository.findById(request.getProductVariantId())
                .orElseThrow(() -> new RuntimeException("Product variant not found with id " + request.getProductVariantId()));

        // Tạo chi tiết đơn hàng mới
        OrderDetail detail = new OrderDetail();
        detail.setOrder(order);
        detail.setProductVariant(variant);
        detail.setPrice(request.getPrice());
        detail.setQuantity(request.getQuantity());

        OrderDetail savedDetail = orderDetailRepository.save(detail);
        return ResponseEntity.ok(savedDetail);
    }

    /**
     * API Cập nhật số lượng hoặc đơn giá của một dòng sản phẩm đã mua theo ID.
     * PUT /api/order-details/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateOrderDetail(@PathVariable Long id, @Valid @RequestBody OrderDetailRequest request) {
        // Tìm chi tiết cũ trong DB
        OrderDetail detail = orderDetailRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order detail not found with id " + id));

        // Nếu thay đổi đơn hàng cha
        if (!detail.getOrder().getId().equals(request.getOrderId())) {
            Order order = orderRepository.findById(request.getOrderId())
                    .orElseThrow(() -> new RuntimeException("Order not found with id " + request.getOrderId()));
            detail.setOrder(order);
        }

        // Nếu thay đổi biến thể sản phẩm
        if (!detail.getProductVariant().getId().equals(request.getProductVariantId())) {
            ProductVariant variant = productVariantRepository.findById(request.getProductVariantId())
                    .orElseThrow(() -> new RuntimeException("Product variant not found with id " + request.getProductVariantId()));
            detail.setProductVariant(variant);
        }

        // Cập nhật giá bán và số lượng
        detail.setPrice(request.getPrice());
        detail.setQuantity(request.getQuantity());

        OrderDetail updatedDetail = orderDetailRepository.save(detail);
        return ResponseEntity.ok(updatedDetail);
    }

    /**
     * API Xóa một mặt hàng đã mua khỏi đơn hàng (DELETE).
     * DELETE /api/order-details/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOrderDetail(@PathVariable Long id) {
        OrderDetail detail = orderDetailRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order detail not found with id " + id));
        orderDetailRepository.delete(detail);
        return ResponseEntity.ok("Xóa dòng chi tiết đơn hàng thành công");
    }
}

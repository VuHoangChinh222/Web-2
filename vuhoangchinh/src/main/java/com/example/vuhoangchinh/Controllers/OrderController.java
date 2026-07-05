package com.example.vuhoangchinh.Controllers;

// Import các thực thể và kho lưu trữ CSDL liên quan
import com.example.vuhoangchinh.Entities.Customer; // Thực thể khách hàng
import com.example.vuhoangchinh.Entities.Order; // Thực thể đơn hàng
import com.example.vuhoangchinh.Entities.OrderDetail;
import com.example.vuhoangchinh.Entities.Product;
import com.example.vuhoangchinh.Entities.ProductVariant;
import com.example.vuhoangchinh.Repositories.CustomerRepository; // Repository khách hàng
import com.example.vuhoangchinh.Repositories.OrderRepository; // Repository đơn hàng
import com.example.vuhoangchinh.Repositories.OrderDetailRepository;
import com.example.vuhoangchinh.Repositories.ProductRepository;
import com.example.vuhoangchinh.Repositories.ProductVariantRepository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

// Import Lombok giúp tự sinh code gọn gàng
import lombok.*; // Annotations @Data, @NoArgsConstructor, @AllArgsConstructor

// Import các annotation của Spring Framework phục vụ xây dựng API RESTful
import org.springframework.beans.factory.annotation.Autowired; // Inject bean tự động
import org.springframework.http.ResponseEntity; // Đối tượng bọc dữ liệu phản hồi kèm HTTP Status
import org.springframework.web.bind.annotation.*; // Các ánh xạ REST API (@RestController, @GetMapping...)

// Import các lớp hỗ trợ phân trang và sắp xếp dữ liệu
import org.springframework.data.domain.Page; // Phân trang kết quả
import org.springframework.data.domain.PageRequest; // Khởi tạo yêu cầu phân trang cụ thể
import org.springframework.data.domain.Pageable; // Interface phân trang chung
import org.springframework.data.domain.Sort; // Sắp xếp trường dữ liệu

// Import thư viện validation bẫy lỗi dữ liệu
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

// Import cấu trúc dữ liệu Java
import java.math.BigDecimal; // Kiểu số thực độ chính xác cao cho giá tiền
import java.time.LocalDateTime; // Định dạng ngày giờ
import java.time.format.DateTimeFormatter; // Bộ định dạng ngày giờ để sinh mã đơn hàng
import java.util.Random; // Tạo số ngẫu nhiên

/**
 * @RestController: Khai báo lớp này là một REST Controller để trả về dữ liệu JSON.
 * @RequestMapping("/api/orders"): Định nghĩa đường dẫn gốc dùng chung cho mọi API quản lý đơn hàng.
 * @CrossOrigin(origins = "*"): Cho phép gọi API chéo miền từ các cổng Frontend khác nhau (tránh lỗi CORS).
 */
@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    // Tiêm repository đơn hàng
    @Autowired
    private OrderRepository orderRepository;

    // Tiêm repository khách hàng để đối chiếu khách hàng khi đặt đơn
    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private OrderDetailRepository orderDetailRepository;

    @Autowired
    private ProductVariantRepository productVariantRepository;

    @Autowired
    private ProductRepository productRepository;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemRequest {
        @NotNull(message = "Mã ID sản phẩm là bắt buộc")
        private Long productId;

        @NotNull(message = "Số lượng mua là bắt buộc")
        @Min(value = 1, message = "Số lượng mua tối thiểu là 1")
        private Integer quantity;

        private String size; // Kích cỡ sản phẩm
        private BigDecimal price; // Giá tại thời điểm mua
    }

    /**
     * DTO (Data Transfer Object) phẳng dùng để nhận thông tin đơn hàng được gửi từ Client lên.
     * Cấu trúc phẳng đơn giản hóa việc gửi dữ liệu từ Form mua hàng.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderRequest {

        private Long customerId; // Mã ID của khách hàng đặt đơn (có thể để null nếu mua vãng lai)

        private String orderCode; // Mã đơn hàng (nếu rỗng hệ thống sẽ tự sinh)

        @NotBlank(message = "Tên người nhận hàng không được để trống")
        @Size(max = 100, message = "Tên người nhận tối đa 100 ký tự")
        private String recipientName; // Tên người nhận

        @NotBlank(message = "Số điện thoại nhận hàng không được để trống")
        @Pattern(regexp = "^(0|\\+84)(3|5|7|8|9)[0-9]{8}$", message = "Số điện thoại người nhận không đúng định dạng (Ví dụ: 0912345678)")
        private String recipientPhone; // Số điện thoại nhận hàng

        @NotBlank(message = "Địa chỉ nhận hàng không được để trống")
        @Size(max = 500, message = "Địa chỉ nhận hàng tối đa 500 ký tự")
        private String shippingAddress; // Địa chỉ nhận hàng đầy đủ

        @NotNull(message = "Tổng tiền hàng không được để trống")
        @Min(value = 0, message = "Tổng tiền hàng không được là số âm")
        private BigDecimal totalPrice; // Tổng tiền hàng trước phí vận chuyển

        @Min(value = 0, message = "Phí vận chuyển không được là số âm")
        private BigDecimal shippingFee = BigDecimal.ZERO; // Phí vận chuyển

        @Size(max = 50, message = "Phương thức thanh toán tối đa 50 ký tự")
        private String paymentMethod; // Phương thức thanh toán (e.g. COD, VNPAY, MOMO)

        @Size(max = 50, message = "Trạng thái thanh toán tối đa 50 ký tự")
        private String paymentStatus = "PENDING"; // Trạng thái thanh toán

        @Size(max = 50, message = "Trạng thái đơn hàng tối đa 50 ký tự")
        private String orderStatus = "0"; // Trạng thái đơn hàng

        private String note; // Ghi chú đơn hàng từ khách hàng

        private List<OrderItemRequest> items; // Danh sách các mặt hàng mua
    }

    /**
     * API Lấy danh sách toàn bộ đơn hàng trong hệ thống (Hỗ trợ phân trang và sắp xếp).
     * GET /api/orders?page=0&size=10&sortBy=id&sortDir=desc
     */
    @GetMapping
    public Page<Order> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
                
        Pageable pageable = PageRequest.of(page, size, sort);
        return orderRepository.findAll(pageable);
    }

    /**
     * API Lấy danh sách các đơn hàng của riêng một khách hàng cụ thể (Phân trang & Sắp xếp).
     * GET /api/orders/customer/{customerId}?page=0&size=10
     */
    @GetMapping("/customer/{customerId}")
    public Page<Order> getOrdersByCustomerId(
            @PathVariable Long customerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
                
        Pageable pageable = PageRequest.of(page, size, sort);
        return orderRepository.findByCustomerId(customerId, pageable);
    }

    /**
     * API Xem thông tin chi tiết một đơn hàng theo ID.
     * GET /api/orders/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id " + id));
        return ResponseEntity.ok(order);
    }

    /**
     * API Xem thông tin chi tiết một đơn hàng theo mã đơn hàng hiển thị (orderCode).
     * GET /api/orders/code/{orderCode}
     */
    @GetMapping("/code/{orderCode}")
    public ResponseEntity<?> getOrderByCode(@PathVariable String orderCode) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new RuntimeException("Order not found with code " + orderCode));
        return ResponseEntity.ok(order);
    }

    /**
     * API Đặt đơn hàng mới (Tự động sinh mã hiển thị đơn hàng nếu để trống và bẫy lỗi số tiền thanh toán).
     * POST /api/orders
     */
    @PostMapping
    @Transactional
    public ResponseEntity<?> createOrder(@Valid @RequestBody OrderRequest request) {
        Customer customer = null;
        
        // Nếu có truyền ID khách hàng, rà soát xem khách hàng có tồn tại không
        if (request.getCustomerId() != null) {
            customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new RuntimeException("Customer not found with id " + request.getCustomerId()));
        }

        // Tự động phát sinh mã đơn hàng (orderCode) nếu client không cung cấp
        String code = request.getOrderCode();
        if (code == null || code.trim().isEmpty()) {
            code = generateOrderCode();
        } else {
            code = code.trim();
        }

        // Kiểm tra tránh trùng lặp mã đơn hàng trong hệ thống
        if (orderRepository.findByOrderCode(code).isPresent()) {
            return ResponseEntity.badRequest().body("Mã đơn hàng '" + code + "' đã tồn tại trong hệ thống");
        }

        // Tính toán tổng thanh toán (grandTotal = totalPrice + shippingFee) để tự động bảo vệ tính nhất quán dữ liệu
        BigDecimal shippingFee = request.getShippingFee() != null ? request.getShippingFee() : BigDecimal.ZERO;
        BigDecimal grandTotal = request.getTotalPrice().add(shippingFee);

        // Khởi tạo thực thể đơn hàng mới và sao chép dữ liệu từ request DTO
        Order order = new Order();
        order.setCustomer(customer);
        order.setOrderCode(code);
        order.setRecipientName(request.getRecipientName());
        order.setRecipientPhone(request.getRecipientPhone());
        order.setShippingAddress(request.getShippingAddress());
        order.setTotalPrice(request.getTotalPrice());
        order.setShippingFee(shippingFee);
        order.setGrandTotal(grandTotal);
        order.setPaymentMethod(request.getPaymentMethod());
        order.setPaymentStatus(request.getPaymentStatus() != null ? request.getPaymentStatus() : "PENDING");
        order.setOrderStatus(request.getOrderStatus() != null ? request.getOrderStatus() : "0");
        order.setNote(request.getNote());

        Order savedOrder = orderRepository.save(order);

        // Lưu các chi tiết đơn hàng (items) nếu có gửi lên
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (OrderItemRequest itemReq : request.getItems()) {
                OrderDetail detail = new OrderDetail();
                detail.setOrder(savedOrder);
                
                // Tìm ProductVariant phù hợp theo productId và size
                List<ProductVariant> variants = productVariantRepository.findByProductId(itemReq.getProductId());
                ProductVariant selectedVariant = null;
                if (!variants.isEmpty()) {
                    if (itemReq.getSize() != null && !itemReq.getSize().trim().isEmpty()) {
                        for (ProductVariant v : variants) {
                            if (itemReq.getSize().equalsIgnoreCase(v.getSize())) {
                                selectedVariant = v;
                                break;
                            }
                        }
                    }
                    if (selectedVariant == null) {
                        selectedVariant = variants.get(0); // Lấy biến thể đầu tiên làm mặc định
                    }
                } else {
                    // Tự động tạo một biến thể mặc định nếu sản phẩm chưa có biến thể nào trong DB
                    Product product = productRepository.findById(itemReq.getProductId())
                            .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với ID " + itemReq.getProductId()));
                    
                    ProductVariant defaultVariant = new ProductVariant();
                    defaultVariant.setProduct(product);
                    defaultVariant.setSize(itemReq.getSize() != null && !itemReq.getSize().trim().isEmpty() ? itemReq.getSize().trim() : "M");
                    defaultVariant.setColor("Mặc định");
                    defaultVariant.setPrice(product.getDiscountPrice() != null ? product.getDiscountPrice() : product.getBasePrice());
                    defaultVariant.setStockQuantity(100); // Tồn kho mặc định ảo
                    defaultVariant.setSku("AUTO-SKU-" + product.getId() + "-" + (itemReq.getSize() != null && !itemReq.getSize().trim().isEmpty() ? itemReq.getSize().toUpperCase().trim() : "M"));
                    
                    Optional<ProductVariant> existingSku = productVariantRepository.findBySku(defaultVariant.getSku());
                    if (existingSku.isPresent()) {
                        selectedVariant = existingSku.get();
                    } else {
                        selectedVariant = productVariantRepository.save(defaultVariant);
                    }
                }
                
                if (selectedVariant == null) {
                    throw new RuntimeException("Không tìm thấy biến thể sản phẩm cho productId " + itemReq.getProductId());
                }

                detail.setProductVariant(selectedVariant);
                detail.setQuantity(itemReq.getQuantity());
                
                // Sử dụng đơn giá gửi lên hoặc đơn giá của biến thể/sản phẩm
                BigDecimal itemPrice = itemReq.getPrice();
                if (itemPrice == null) {
                    itemPrice = selectedVariant.getPrice();
                    if (itemPrice == null) {
                        itemPrice = selectedVariant.getProduct().getBasePrice();
                    }
                }
                detail.setPrice(itemPrice);

                orderDetailRepository.save(detail);
            }
        }

        return ResponseEntity.ok(savedOrder);
    }

    /**
     * API Cập nhật trạng thái thanh toán hoặc trạng thái đơn hàng theo ID đơn hàng.
     * PUT /api/orders/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateOrder(@PathVariable Long id, @Valid @RequestBody OrderRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id " + id));

        // Nếu thay đổi khách hàng, kiểm tra khách hàng mới
        if (request.getCustomerId() != null) {
            Customer customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new RuntimeException("Customer not found with id " + request.getCustomerId()));
            order.setCustomer(customer);
        } else {
            order.setCustomer(null);
        }

        // Cập nhật các thông tin người nhận
        order.setRecipientName(request.getRecipientName());
        order.setRecipientPhone(request.getRecipientPhone());
        order.setShippingAddress(request.getShippingAddress());
        order.setTotalPrice(request.getTotalPrice());
        
        BigDecimal shippingFee = request.getShippingFee() != null ? request.getShippingFee() : BigDecimal.ZERO;
        order.setShippingFee(shippingFee);
        
        // Tự động cập nhật lại tổng số tiền thanh toán
        order.setGrandTotal(request.getTotalPrice().add(shippingFee));
        
        // Cập nhật phương thức và trạng thái
        order.setPaymentMethod(request.getPaymentMethod());
        if (request.getPaymentStatus() != null) {
            order.setPaymentStatus(request.getPaymentStatus());
        }
        if (request.getOrderStatus() != null) {
            order.setOrderStatus(request.getOrderStatus());
        }
        order.setNote(request.getNote());

        // Rà soát lại mã đơn hàng nếu client cập nhật mã đơn hàng
        String newCode = request.getOrderCode() != null ? request.getOrderCode().trim() : null;
        if (newCode != null && !newCode.isEmpty() && !order.getOrderCode().equalsIgnoreCase(newCode)) {
            if (orderRepository.findByOrderCode(newCode).isPresent()) {
                return ResponseEntity.badRequest().body("Mã đơn hàng '" + newCode + "' đã tồn tại ở đơn hàng khác");
            }
            order.setOrderCode(newCode);
        }

        Order updatedOrder = orderRepository.save(order);
        return ResponseEntity.ok(updatedOrder);
    }

    /**
     * API Xóa đơn hàng khỏi hệ thống (DELETE).
     * DELETE /api/orders/{id}
     */
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteOrder(@PathVariable Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id " + id));
        orderRepository.delete(order);
        return ResponseEntity.ok("Xóa đơn hàng thành công");
    }

    /**
     * Hàm sinh mã đơn hàng tự động duy nhất dựa theo ngày hiện tại và số ngẫu nhiên.
     * Định dạng: ORD-ddMMyyyy-XXXXX (e.g. ORD-17062026-98124)
     */
    private String generateOrderCode() {
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("ddMMyyyy");
        String dateStr = now.format(formatter);
        
        Random random = new Random();
        int randomNum = 10000 + random.nextInt(90000); // Sinh số có 5 chữ số từ 10000 đến 99999
        
        return "ORD-" + dateStr + "-" + randomNum;
    }
}

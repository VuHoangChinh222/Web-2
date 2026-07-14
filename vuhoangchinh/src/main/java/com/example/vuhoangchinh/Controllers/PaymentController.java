package com.example.vuhoangchinh.Controllers;

import com.example.vuhoangchinh.Entities.Order;
import com.example.vuhoangchinh.Entities.OrderDetail;
import com.example.vuhoangchinh.Repositories.OrderRepository;
import com.example.vuhoangchinh.Repositories.ProductVariantRepository;
import com.example.vuhoangchinh.Services.MomoService;
import com.example.vuhoangchinh.Services.VnPayService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductVariantRepository productVariantRepository;

    @Autowired
    private VnPayService vnPayService;

    @Autowired
    private MomoService momoService;

    @Autowired
    private com.example.vuhoangchinh.Services.EmailService emailService;

    /**
     * API Tạo link thanh toán VNPay từ ID đơn hàng
     * POST /api/payment/vnpay/create?orderId=...
     */
    @PostMapping("/vnpay/create")
    public ResponseEntity<?> createVnPayPayment(@RequestParam Long orderId, HttpServletRequest request) {
        try {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với ID " + orderId));

            String paymentUrl = vnPayService.createPaymentUrl(order, request);
            
            Map<String, String> response = new HashMap<>();
            response.put("paymentUrl", paymentUrl);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi tạo liên kết thanh toán: " + e.getMessage());
        }
    }

    /**
     * API đối soát kết quả thanh toán cho Client React (Return URL)
     * GET /api/payment/vnpay/verify-return
     */
    @GetMapping("/vnpay/verify-return")
    @Transactional
    public ResponseEntity<?> verifyVnPayReturn(@RequestParam Map<String, String> allParams) {
        try {
            boolean isValidSignature = vnPayService.verifyCallback(allParams);
            if (!isValidSignature) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Chữ ký bảo mật không hợp lệ (Invalid Checksum)");
                return ResponseEntity.ok(response);
            }

            String orderCode = allParams.get("vnp_TxnRef");
            String responseCode = allParams.get("vnp_ResponseCode"); // "00" nghĩa là giao dịch thành công

            Optional<Order> orderOpt = orderRepository.findByOrderCode(orderCode);
            if (!orderOpt.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Không tìm thấy đơn hàng tương ứng với mã " + orderCode);
                return ResponseEntity.ok(response);
            }

            Order order = orderOpt.get();
            Map<String, Object> response = new HashMap<>();
            
            if ("00".equals(responseCode)) {
                // Cập nhật trạng thái trong DB để đảm bảo đồng bộ
                if (!"PAID".equals(order.getPaymentStatus())) {
                    order.setPaymentStatus("PAID");
                    orderRepository.save(order);
                    
                    try {
                        emailService.sendOrderConfirmationEmail(order.getCustomer(), order, order.getOrderDetails());
                    } catch (Exception e) {
                        System.err.println("Không thể kích hoạt gửi mail: " + e.getMessage());
                    }
                }
                response.put("success", true);
                response.put("message", "Thanh toán đơn hàng thành công!");
                response.put("orderCode", order.getOrderCode());
                response.put("amount", order.getGrandTotal());
            } else {
                if (!"PAID".equals(order.getPaymentStatus())) {
                    order.setPaymentStatus("FAILED");
                    // Chỉ hủy và khôi phục kho nếu đơn hàng chưa ở trạng thái hủy "3"
                    if (!"3".equals(order.getOrderStatus())) {
                        order.setOrderStatus("3"); // Cập nhật trạng thái đơn hàng thành CANCELLED (3)
                        orderRepository.save(order);
                        
                        // Hoàn trả số lượng sản phẩm vào kho
                        for (OrderDetail detail : order.getOrderDetails()) {
                            productVariantRepository.incrementStockAtomic(detail.getProductVariant().getId(), detail.getQuantity());
                        }
                    }
                }
                response.put("success", false);
                response.put("message", "Giao dịch không thành công hoặc bị hủy. Mã phản hồi: " + responseCode);
                response.put("orderCode", order.getOrderCode());
            }
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi xử lý kết quả thanh toán: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    /**
     * API Webhook IPN xử lý bất đồng bộ từ Server VNPay sang Server Spring Boot (Server-to-Server)
     * GET /api/payment/vnpay/ipn
     */
    @GetMapping("/vnpay/ipn")
    @Transactional
    public ResponseEntity<?> vnPayIpn(@RequestParam Map<String, String> allParams) {
        Map<String, String> response = new HashMap<>();
        try {
            // 1. Kiểm tra chữ ký (Signature Verification)
            boolean isValidSignature = vnPayService.verifyCallback(allParams);
            if (!isValidSignature) {
                response.put("RspCode", "97");
                response.put("Message", "Invalid Signature");
                return ResponseEntity.ok(response);
            }

            // 2. Tìm kiếm đơn hàng
            String orderCode = allParams.get("vnp_TxnRef");
            Optional<Order> orderOpt = orderRepository.findByOrderCode(orderCode);
            if (!orderOpt.isPresent()) {
                response.put("RspCode", "01");
                response.put("Message", "Order not found");
                return ResponseEntity.ok(response);
            }

            Order order = orderOpt.get();

            // 3. Kiểm tra số tiền giao dịch khớp với đơn hàng (vnp_Amount được nhân với 100)
            long vnpAmount = Long.parseLong(allParams.get("vnp_Amount"));
            long orderAmount = order.getGrandTotal().multiply(new java.math.BigDecimal("100")).longValue();
            if (vnpAmount != orderAmount) {
                response.put("RspCode", "04");
                response.put("Message", "Invalid Amount");
                return ResponseEntity.ok(response);
            }

            // 4. Kiểm tra xem đơn hàng đã được cập nhật trước đó chưa
            if ("PAID".equals(order.getPaymentStatus()) || "FAILED".equals(order.getPaymentStatus()) || "3".equals(order.getOrderStatus())) {
                response.put("RspCode", "02");
                response.put("Message", "Order already confirmed");
                return ResponseEntity.ok(response);
            }

            // 5. Cập nhật trạng thái giao dịch
            String responseCode = allParams.get("vnp_ResponseCode");
            if ("00".equals(responseCode)) {
                order.setPaymentStatus("PAID");
                try {
                    emailService.sendOrderConfirmationEmail(order.getCustomer(), order, order.getOrderDetails());
                } catch (Exception e) {
                    System.err.println("Không thể kích hoạt gửi mail: " + e.getMessage());
                }
            } else {
                order.setPaymentStatus("FAILED");
                order.setOrderStatus("3"); // Cập nhật trạng thái đơn hàng thành CANCELLED (3)
                
                // Hoàn trả số lượng sản phẩm vào kho
                for (OrderDetail detail : order.getOrderDetails()) {
                    productVariantRepository.incrementStockAtomic(detail.getProductVariant().getId(), detail.getQuantity());
                }
            }
            
            orderRepository.save(order);

            response.put("RspCode", "00");
            response.put("Message", "Confirm Success");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("RspCode", "99");
            response.put("Message", "Input Required Data Invalid");
            return ResponseEntity.ok(response);
        }
    }

    /**
     * API Tạo link thanh toán MoMo từ ID đơn hàng
     * POST /api/payment/momo/create?orderId=...
     */
    @PostMapping("/momo/create")
    public ResponseEntity<?> createMomoPayment(@RequestParam Long orderId, @RequestParam(required = false, defaultValue = "captureWallet") String requestType) {
        try {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với ID " + orderId));
            
            Map<String, Object> momoResponse = momoService.createPaymentUrl(order, requestType);
            
            if (momoResponse != null && Integer.valueOf(0).equals(momoResponse.get("resultCode"))) {
                String payUrl = (String) momoResponse.get("payUrl");
                Map<String, String> result = new HashMap<>();
                result.put("paymentUrl", payUrl);
                return ResponseEntity.ok(result);
            } else {
                String errorMsg = momoResponse != null ? (String) momoResponse.get("message") : "Không nhận được phản hồi từ MoMo";
                return ResponseEntity.badRequest().body("Lỗi tạo cổng thanh toán MoMo: " + errorMsg);
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi hệ thống khi tạo thanh toán MoMo: " + e.getMessage());
        }
    }

    /**
     * API đối soát kết quả thanh toán cho Client React khi Redirect từ MoMo về (Return URL)
     * GET /api/payment/momo/verify-return
     */
    @GetMapping("/momo/verify-return")
    @Transactional
    public ResponseEntity<?> verifyMomoReturn(@RequestParam Map<String, String> allParams) {
        try {
            boolean isValidSignature = momoService.verifyCallback(allParams);
            if (!isValidSignature) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Chữ ký bảo mật MoMo không hợp lệ");
                return ResponseEntity.ok(response);
            }

            String orderCode = allParams.get("orderId");
            String resultCode = allParams.get("resultCode"); // "0" nghĩa là giao dịch thành công

            Optional<Order> orderOpt = orderRepository.findByOrderCode(orderCode);
            if (!orderOpt.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Không tìm thấy đơn hàng tương ứng với mã " + orderCode);
                return ResponseEntity.ok(response);
            }

            Order order = orderOpt.get();
            Map<String, Object> response = new HashMap<>();
            
            if ("0".equals(resultCode)) {
                if (!"PAID".equals(order.getPaymentStatus())) {
                    order.setPaymentStatus("PAID");
                    orderRepository.save(order);
                    
                    try {
                        emailService.sendOrderConfirmationEmail(order.getCustomer(), order, order.getOrderDetails());
                    } catch (Exception e) {
                        System.err.println("Không thể kích hoạt gửi mail: " + e.getMessage());
                    }
                }
                response.put("success", true);
                response.put("message", "Thanh toán đơn hàng qua MoMo thành công!");
                response.put("orderCode", order.getOrderCode());
                response.put("amount", order.getGrandTotal());
            } else {
                if (!"PAID".equals(order.getPaymentStatus())) {
                    order.setPaymentStatus("FAILED");
                    if (!"3".equals(order.getOrderStatus())) {
                        order.setOrderStatus("3"); // Cập nhật trạng thái đơn hàng thành CANCELLED (3)
                        orderRepository.save(order);
                        
                        // Hoàn trả số lượng sản phẩm vào kho
                        for (OrderDetail detail : order.getOrderDetails()) {
                            productVariantRepository.incrementStockAtomic(detail.getProductVariant().getId(), detail.getQuantity());
                        }
                      }
                }
                response.put("success", false);
                response.put("message", "Giao dịch không thành công hoặc bị hủy. Mã MoMo: " + resultCode);
                response.put("orderCode", order.getOrderCode());
            }
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi xử lý kết quả thanh toán MoMo: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    /**
     * API Webhook IPN xử lý bất đồng bộ từ Server MoMo sang Server Spring Boot (Server-to-Server)
     * POST /api/payment/momo/ipn
     */
    @PostMapping("/momo/ipn")
    @Transactional
    public ResponseEntity<?> momoIpn(@RequestBody Map<String, String> allParams) {
        try {
            // 1. Kiểm tra chữ ký
            boolean isValidSignature = momoService.verifyCallback(allParams);
            if (!isValidSignature) {
                return ResponseEntity.badRequest().build();
            }

            // 2. Tìm kiếm đơn hàng
            String orderCode = allParams.get("orderId");
            Optional<Order> orderOpt = orderRepository.findByOrderCode(orderCode);
            if (!orderOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Order order = orderOpt.get();

            // 3. Kiểm tra số tiền khớp lệnh
            String amountStr = allParams.get("amount");
            long amount = Long.parseLong(amountStr);
            if (amount != order.getGrandTotal().longValue()) {
                return ResponseEntity.badRequest().build();
            }

            // 4. Kiểm tra xem đơn hàng đã được cập nhật trước đó chưa
            if ("PAID".equals(order.getPaymentStatus()) || "FAILED".equals(order.getPaymentStatus()) || "3".equals(order.getOrderStatus())) {
                return ResponseEntity.noContent().build(); // HTTP 204
            }

            // 5. Cập nhật trạng thái giao dịch
            String resultCode = allParams.get("resultCode");
            if ("0".equals(resultCode)) {
                order.setPaymentStatus("PAID");
                try {
                    emailService.sendOrderConfirmationEmail(order.getCustomer(), order, order.getOrderDetails());
                } catch (Exception e) {
                    System.err.println("Không thể kích hoạt gửi mail: " + e.getMessage());
                }
            } else {
                order.setPaymentStatus("FAILED");
                order.setOrderStatus("3"); // Hủy đơn
                
                // Hoàn trả số lượng sản phẩm vào kho
                for (OrderDetail detail : order.getOrderDetails()) {
                    productVariantRepository.incrementStockAtomic(detail.getProductVariant().getId(), detail.getQuantity());
                }
            }
            
            orderRepository.save(order);
            return ResponseEntity.noContent().build(); // HTTP 204

        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}

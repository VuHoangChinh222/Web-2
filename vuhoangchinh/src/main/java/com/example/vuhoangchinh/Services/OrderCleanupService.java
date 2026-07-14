package com.example.vuhoangchinh.Services;

import com.example.vuhoangchinh.Entities.Order;
import com.example.vuhoangchinh.Entities.OrderDetail;
import com.example.vuhoangchinh.Repositories.OrderRepository;
import com.example.vuhoangchinh.Repositories.ProductVariantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderCleanupService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductVariantRepository productVariantRepository;

    /**
     * Tác vụ chạy ngầm định kỳ mỗi 1 phút để dọn dẹp các đơn hàng ảo, treo cổng thanh toán.
     */
    @Scheduled(fixedRate = 60000) // Chạy lặp lại mỗi 60 giây (1 phút)
    @Transactional
    public void cancelAbandonedOrders() {
        // Lấy thời điểm hiện tại và lùi về 1 phút trước
        // Bất kỳ đơn hàng nào tạo trước cutoffTime đều được coi là quá hạn
        LocalDateTime cutoffTime = LocalDateTime.now().minusMinutes(1);
        
        // Tìm các đơn hàng online (MOMO, VNPAY) có paymentStatus là PENDING
        List<Order> abandonedOrders = orderRepository.findAbandonedOnlineOrders(cutoffTime);
        
        for (Order order : abandonedOrders) {
            order.setOrderStatus("3"); // Cập nhật trạng thái thành Đã Hủy
            order.setPaymentStatus("FAILED"); // Đánh dấu thanh toán thất bại
            
            // Tự động hoàn trả lại số lượng sản phẩm vào kho để khách khác có thể mua
            for (OrderDetail detail : order.getOrderDetails()) {
                productVariantRepository.incrementStockAtomic(detail.getProductVariant().getId(), detail.getQuantity());
            }
            
            orderRepository.save(order);
            System.out.println("[CLEANUP] Đã tự động hủy đơn hàng quá hạn thanh toán: " + order.getOrderCode());
        }
    }
}

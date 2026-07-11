package com.example.vuhoangchinh.Services;

import com.example.vuhoangchinh.Entities.Product;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
public class AiSyncService {

    private final String AI_SERVER_URL = "http://localhost:8000/api/ai";
    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Đồng bộ thêm/sửa sản phẩm sang AI (Chạy nền không gây chậm web)
     */
    public void syncProductToAi(Product product) {
        CompletableFuture.runAsync(() -> {
            try {
                String url = AI_SERVER_URL + "/sync";

                // Đóng gói dữ liệu giống cấu trúc ProductData bên Python
                Map<String, Object> body = new HashMap<>();
                body.put("id", String.valueOf(product.getId()));
                body.put("name", product.getName());
                body.put("price", product.getPrice());
                
                // Tránh lỗi null mô tả
                String desc = product.getShortDescription() != null ? product.getShortDescription() : "";
                if(product.getDescription() != null && !product.getDescription().isEmpty()) {
                    desc += " - " + product.getDescription();
                }
                body.put("description", desc);
                body.put("category", product.getCategoryName());

                // Gửi Request POST
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
                
                restTemplate.postForObject(url, request, String.class);
                System.out.println("✅ [AI Sync] Đã đồng bộ sản phẩm: " + product.getName());
            } catch (Exception e) {
                System.err.println("❌ [AI Sync Error] Lỗi đồng bộ sản phẩm: " + e.getMessage());
            }
        });
    }

    /**
     * Đồng bộ xóa sản phẩm sang AI (Chạy nền)
     */
    public void deleteProductFromAi(Long productId) {
        CompletableFuture.runAsync(() -> {
            try {
                String url = AI_SERVER_URL + "/sync/delete?product_id=" + productId;
                restTemplate.postForObject(url, null, String.class);
                System.out.println("✅ [AI Sync] Đã xóa sản phẩm ID: " + productId);
            } catch (Exception e) {
                System.err.println("❌ [AI Sync Error] Lỗi xóa sản phẩm: " + e.getMessage());
            }
        });
    }
}

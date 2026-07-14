package com.example.vuhoangchinh.Services;

import com.example.vuhoangchinh.Config.MomoConfig;
import com.example.vuhoangchinh.Entities.Order;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class MomoService {

    @Autowired
    private MomoConfig momoConfig;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Tạo đường dẫn thanh toán sang MoMo Sandbox
     */
    public Map<String, Object> createPaymentUrl(Order order, String requestType) {
        String partnerCode = momoConfig.getPartnerCode();
        String accessKey = momoConfig.getAccessKey();
        String secretKey = momoConfig.getSecretKey();
        String redirectUrl = momoConfig.getRedirectUrl();
        String ipnUrl = momoConfig.getIpnUrl();
        
        String orderId = order.getOrderCode();
        String requestId = order.getOrderCode() + "_" + System.currentTimeMillis();
        long amount = order.getGrandTotal().longValue();
        String orderInfo = "Thanh toan don hang Chinh Hoops " + order.getOrderCode();
        String extraData = ""; // Có thể để trống hoặc encode Base64 của json string

        // Xây dựng chuỗi để ký (Sắp xếp Alphabetical các trường)
        String rawHashStr = "accessKey=" + accessKey +
                "&amount=" + amount +
                "&extraData=" + extraData +
                "&ipnUrl=" + ipnUrl +
                "&orderId=" + orderId +
                "&orderInfo=" + orderInfo +
                "&partnerCode=" + partnerCode +
                "&redirectUrl=" + redirectUrl +
                "&requestId=" + requestId +
                "&requestType=" + requestType;

        // Băm chữ ký bảo mật HMAC-SHA256
        String signature = MomoConfig.hmacSHA256(secretKey, rawHashStr);

        // Tạo body gửi sang MoMo API
        Map<String, Object> requestPayload = new HashMap<>();
        requestPayload.put("partnerCode", partnerCode);
        requestPayload.put("partnerName", "Chinh Hoops");
        requestPayload.put("storeId", "Chinh Hoops");
        requestPayload.put("requestId", requestId);
        requestPayload.put("amount", amount);
        requestPayload.put("orderId", orderId);
        requestPayload.put("orderInfo", orderInfo);
        requestPayload.put("redirectUrl", redirectUrl);
        requestPayload.put("ipnUrl", ipnUrl);
        requestPayload.put("lang", "vi");
        requestPayload.put("extraData", extraData);
        requestPayload.put("requestType", requestType);
        requestPayload.put("signature", signature);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestPayload, headers);

            Map<String, Object> response = restTemplate.postForObject(momoConfig.getApiUrl(), entity, Map.class);
            return response;
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("resultCode", -1);
            errorResponse.put("message", "Loi khi goi API MoMo: " + e.getMessage());
            return errorResponse;
        }
    }

    /**
     * Xác thực chữ ký số phản hồi từ MoMo gửi về (cả redirect và IPN)
     */
    public boolean verifyCallback(Map<String, String> params) {
        String secretKey = momoConfig.getSecretKey();
        String accessKey = momoConfig.getAccessKey();
        
        String receivedSignature = params.get("signature");
        if (receivedSignature == null) {
            return false;
        }

        // Trích xuất các trường để băm đối soát (Sắp xếp Alphabetical)
        String amount = getOrDefault(params, "amount");
        String extraData = getOrDefault(params, "extraData");
        String message = getOrDefault(params, "message");
        String orderId = getOrDefault(params, "orderId");
        String orderInfo = getOrDefault(params, "orderInfo");
        String orderType = getOrDefault(params, "orderType");
        String partnerCode = getOrDefault(params, "partnerCode");
        String payType = getOrDefault(params, "payType");
        String requestId = getOrDefault(params, "requestId");
        String responseTime = getOrDefault(params, "responseTime");
        String resultCode = getOrDefault(params, "resultCode");
        String transId = getOrDefault(params, "transId");

        // Xây dựng chuỗi raw signature đối chiếu
        String rawHashStr = "accessKey=" + accessKey +
                "&amount=" + amount +
                "&extraData=" + extraData +
                "&message=" + message +
                "&orderId=" + orderId +
                "&orderInfo=" + orderInfo +
                "&orderType=" + orderType +
                "&partnerCode=" + partnerCode +
                "&payType=" + payType +
                "&requestId=" + requestId +
                "&responseTime=" + responseTime +
                "&resultCode=" + resultCode +
                "&transId=" + transId;

        String calculatedSignature = MomoConfig.hmacSHA256(secretKey, rawHashStr);
        return calculatedSignature.equalsIgnoreCase(receivedSignature);
    }

    private String getOrDefault(Map<String, String> params, String key) {
        String val = params.get(key);
        return val != null ? val : "";
    }
}

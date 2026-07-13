package com.example.vuhoangchinh.Services;

import com.example.vuhoangchinh.Config.VnPayConfig;
import com.example.vuhoangchinh.Entities.Order;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class VnPayService {

    @Autowired
    private VnPayConfig vnPayConfig;

    /**
     * Tạo liên kết thanh toán VNPay cho đơn hàng
     * @param order Đối tượng đơn hàng cần thanh toán
     * @param request HttpServletRequest để lấy IP client
     * @return Chuỗi URL chuyển hướng thanh toán
     */
    public String createPaymentUrl(Order order, HttpServletRequest request) {
        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        
        // vnp_Amount tính bằng đồng (VND) nhân với 100 để chuyển thành đơn vị xu/Cent của VNPay
        long amount = order.getGrandTotal().multiply(new java.math.BigDecimal("100")).longValue();
        
        String vnp_TxnRef = order.getOrderCode();
        String vnp_OrderInfo = "Thanh toan don hang Chinh Hoops: " + order.getOrderCode();
        String vnp_OrderType = "other"; // Mã danh mục hàng hóa (Loại thanh toán khác)
        String vnp_Locale = "vn";
        
        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnPayConfig.getTmnCode());
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", vnp_OrderInfo);
        vnp_Params.put("vnp_OrderType", vnp_OrderType);
        vnp_Params.put("vnp_Locale", vnp_Locale);
        vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
        vnp_Params.put("vnp_IpAddr", VnPayConfig.getIpAddress(request));

        // Định dạng thời gian Giao dịch và thời gian hết hạn (15 phút sau)
        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
        
        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);
        
        // Sắp xếp các tham số theo bảng chữ cái (bắt buộc bởi VNPay)
        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                // Xây dựng chuỗi để băm chữ ký (Không thay thế "+")
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                
                // Xây dựng chuỗi query string (Có encode trị số, không thay thế "+")
                query.append(URLEncoder.encode(fieldName, StandardCharsets.UTF_8));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8));
                
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }
        
        String queryUrl = query.toString();
        // Băm chữ ký bảo mật HMAC SHA-512
        String vnp_SecureHash = VnPayConfig.hmacSHA512(vnPayConfig.getHashSecret(), hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        
        return vnPayConfig.getApiUrl() + "?" + queryUrl;
    }

    /**
     * Xác thực tính hợp lệ chữ ký bảo mật từ VNPay callback gửi về
     * @param requestParams Map chứa tất cả các tham số query do VNPay phản hồi
     * @return true nếu chữ ký hợp lệ, ngược lại false
     */
    public boolean verifyCallback(Map<String, String> requestParams) {
        String vnp_SecureHash = requestParams.get("vnp_SecureHash");
        if (vnp_SecureHash == null) {
            return false;
        }

        // Lọc lấy các tham số bắt đầu bằng "vnp_" ngoại trừ vnp_SecureHash và vnp_SecureHashType
        // Mục đích: loại bỏ các tham số tùy biến của client (như gateway, utm...) để tránh lệch chữ ký
        List<String> fieldNames = new ArrayList<>();
        for (String key : requestParams.keySet()) {
            if (key.startsWith("vnp_") && !key.equals("vnp_SecureHash") && !key.equals("vnp_SecureHashType")) {
                fieldNames.add(key);
            }
        }
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = requestParams.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                hashData.append(fieldName);
                hashData.append('=');
                // Mã hóa chuẩn mặc định Java
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                if (itr.hasNext()) {
                    hashData.append('&');
                }
            }
        }

        String calculatedHash = VnPayConfig.hmacSHA512(vnPayConfig.getHashSecret(), hashData.toString());
        return calculatedHash.equalsIgnoreCase(vnp_SecureHash);
    }
}

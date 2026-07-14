package com.example.vuhoangchinh.Config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

@Configuration
public class MomoConfig {

    @Value("${payment.momo.partner-code}")
    private String partnerCode;

    @Value("${payment.momo.access-key}")
    private String accessKey;

    @Value("${payment.momo.secret-key}")
    private String secretKey;

    @Value("${payment.momo.api-url}")
    private String apiUrl;

    @Value("${payment.momo.redirect-url}")
    private String redirectUrl;

    @Value("${payment.momo.ipn-url}")
    private String ipnUrl;

    public String getPartnerCode() {
        return partnerCode;
    }

    public String getAccessKey() {
        return accessKey;
    }

    public String getSecretKey() {
        return secretKey;
    }

    public String getApiUrl() {
        return apiUrl;
    }

    public String getRedirectUrl() {
        return redirectUrl;
    }

    public String getIpnUrl() {
        return ipnUrl;
    }

    /**
     * Tính toán chữ ký số bằng thuật toán HMAC-SHA256 phục vụ bảo mật MoMo
     */
    public static String hmacSHA256(String key, String data) {
        try {
            Mac sha256HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256HMAC.init(secretKeySpec);
            byte[] hashBytes = sha256HMAC.doFinal(data.getBytes(StandardCharsets.UTF_8));
            
            StringBuilder hexString = new StringBuilder();
            for (byte b : hashBytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            return "";
        }
    }
}

package com.example.vuhoangchinh.Security;

// Import các class từ thư viện io.jsonwebtoken để xử lý JWT
import io.jsonwebtoken.*; // Các lớp chính để build và parse JWT
import io.jsonwebtoken.security.Keys; // Lớp tiện ích sinh key bảo mật cho thuật toán mã hóa chữ ký
import org.springframework.stereotype.Component; // Annotation khai báo lớp này là một Spring Bean Component

// Import các lớp cơ bản của Java
import java.security.Key; // Đại diện cho khóa bảo mật dùng cho chữ ký số
import java.util.Date; // Xử lý ngày giờ tạo và hết hạn của Token

/**
 * @Component: Khai báo lớp này là một Spring Component (Bean).
 *             Spring IoC Container sẽ tự động phát hiện, quản lý vòng đời và tiêm (inject)
 *             lớp này vào các Controller/Service khác khi có nhu cầu sử dụng.
 */
@Component
public class JwtTokenProvider {

    // Chuỗi bí mật dùng để ký và xác thực Token (phải lớn hơn 256 bits cho HS256)
    private final String JWT_SECRET = "VVuHoangChinhSuperSecretKey12345678901234567890";
    
    // Thời hạn sử dụng của Token: 7 ngày (tính bằng mili-giây)
    private final long JWT_EXPIRATION = 604800000L;

    /**
     * Tạo khóa ký từ chuỗi bí mật JWT_SECRET.
     * Sử dụng thuật toán HMAC-SHA để tạo đối tượng Key hợp lệ.
     */
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(JWT_SECRET.getBytes());
    }

    /**
     * Hàm sinh chuỗi JWT Token từ username hoặc email người dùng.
     * Token được tạo chứa các thông tin (claims) như subject (username), thời gian tạo, thời gian hết hạn.
     */
    public String generateToken(String username) {
        Date now = new Date(); // Thời gian tạo Token hiện tại
        Date expiryDate = new Date(now.getTime() + JWT_EXPIRATION); // Thời gian hết hạn của Token

        // Xây dựng chuỗi JWT Token
        return Jwts.builder()
                .setSubject(username) // Đặt Subject chính là username hoặc email người dùng
                .setIssuedAt(now) // Ghi nhận thời điểm phát hành Token
                .setExpiration(expiryDate) // Thiết lập thời điểm Token hết hạn
                .signWith(getSigningKey(), SignatureAlgorithm.HS256) // Ký Token bằng khóa bí mật và thuật toán HS256
                .compact(); // Nén và chuyển đổi thành chuỗi Token dạng String
    }

    /**
     * Hàm giải mã JWT và lấy thông tin Subject (username hoặc email) đã lưu trong Token.
     */
    public String getUsernameFromJWT(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey()) // Cung cấp khóa bí mật để xác thực chữ ký của Token
                .build()
                .parseClaimsJws(token) // Tiến hành phân tích (parse) chuỗi Token
                .getBody(); // Lấy phần Body (chứa các claims thông tin)

        return claims.getSubject(); // Trả về trường Subject đã lưu
    }

    /**
     * Hàm kiểm tra tính hợp lệ của Token JWT gửi lên từ Request của Client.
     * Trả về true nếu Token hoàn toàn hợp lệ, false nếu Token bị lỗi/hết hạn.
     */
    public boolean validateToken(String authToken) {
        try {
            // Parser Token bằng khóa bí mật, nếu có lỗi sẽ văng ra ngoại lệ tương ứng
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(authToken);
            return true; // Token hợp lệ
        } catch (MalformedJwtException ex) {
            System.err.println("Invalid JWT token - Chuỗi Token không đúng cấu trúc");
        } catch (ExpiredJwtException ex) {
            System.err.println("Expired JWT token - Token đã hết hạn sử dụng");
        } catch (UnsupportedJwtException ex) {
            System.err.println("Unsupported JWT token - Token không được hỗ trợ");
        } catch (IllegalArgumentException ex) {
            System.err.println("JWT claims string is empty - Claims rỗng");
        }
        return false; // Token không hợp lệ
    }
}

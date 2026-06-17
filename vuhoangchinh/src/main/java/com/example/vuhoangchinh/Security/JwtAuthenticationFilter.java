package com.example.vuhoangchinh.Security;

// Import các servlet API để bắt yêu cầu HTTP gửi đến và đi
import jakarta.servlet.FilterChain; // Quản lý chuỗi bộ lọc tiếp theo (Filter Chain)
import jakarta.servlet.ServletException; // Ngoại lệ khi servlet gặp lỗi
import jakarta.servlet.http.HttpServletRequest; // Đối tượng chứa dữ liệu HTTP Request gửi lên
import jakarta.servlet.http.HttpServletResponse; // Đối tượng chứa dữ liệu phản hồi HTTP Response trả về

// Import các thư viện Spring Framework và Spring Security
import org.springframework.beans.factory.annotation.Autowired; // Tự động tiêm dependency bean
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken; // Đại diện cho đối tượng xác thực thành công
import org.springframework.security.core.context.SecurityContextHolder; // Nơi lưu trữ thông tin xác thực của request hiện tại
import org.springframework.security.core.userdetails.User; // Đối tượng UserDetails mặc định của Spring Security
import org.springframework.security.core.userdetails.UserDetails; // Giao diện chứa thông tin người dùng được bảo mật
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource; // Xây dựng chi tiết thông tin xác thực từ request (IP, Session...)
import org.springframework.stereotype.Component; // Khai báo đây là một Spring Component (Bean)
import org.springframework.util.StringUtils; // Tiện ích xử lý chuỗi chữ (kiểm tra rỗng, có ký tự)
import org.springframework.web.filter.OncePerRequestFilter; // Đảm bảo bộ lọc (Filter) chỉ thực hiện một lần duy nhất cho mỗi Request

// Import các thư viện Java chuẩn
import java.io.IOException; // Ngoại lệ I/O khi xử lý luồng dữ liệu
import java.util.Collections; // Hỗ trợ tạo List rỗng nhanh chóng

/**
 * @Component: Khai báo lớp này là một Spring Component (Bean) để Spring tự nạp vào chuỗi bảo mật Security.
 * OncePerRequestFilter: Lớp nền tảng của Spring đảm bảo Filter này chỉ chạy 1 lần duy nhất cho mỗi HTTP Request
 * gửi lên máy chủ, tránh lãng phí hiệu năng lọc lặp lại.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    // Tiêm JwtTokenProvider để giải mã và kiểm tra tính đúng đắn của token JWT nhận được
    @Autowired
    private JwtTokenProvider tokenProvider;

    /**
     * Hàm xử lý chính: Chặn mọi request đi qua ứng dụng, lấy Token ra giải mã,
     * thiết lập thông tin đăng nhập vào Context của Spring Security nếu Token hợp lệ.
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            // Lấy chuỗi JWT Token từ header "Authorization" của request
            String jwt = getJwtFromRequest(request);

            // Nếu tồn tại token và token đó hoàn toàn hợp lệ (chưa hết hạn, đúng chữ ký):
            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
                
                // Giải mã token lấy ra username hoặc email lưu bên trong
                String username = tokenProvider.getUsernameFromJWT(jwt);

                // Khởi tạo một đối tượng UserDetails giả lập đại diện cho tài khoản đã xác thực thành công
                // (Chúng ta không cần truy vấn lại Database tại đây để tối ưu hóa hiệu năng tốc độ xử lý API)
                UserDetails userDetails = new User(username, "", Collections.emptyList());
                
                // Tạo đối tượng chứng nhận Authentication chứa thông tin tài khoản và phân quyền
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                
                // Gắn thêm chi tiết về Request vật lý gửi lên (như địa chỉ IP máy khách)
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Lưu thông tin đăng nhập thành công vào ngữ cảnh bảo mật của Spring Security (SecurityContextHolder).
                // Kể từ dòng này, người dùng được coi là đã đăng nhập và được quyền gọi các API được bảo mật.
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception ex) {
            // Log lỗi nếu xảy ra vấn đề thiết lập đăng nhập
            logger.error("Could not set user authentication in security context", ex);
        }

        // Chuyển tiếp Request và Response sang các bộ lọc (Filter) tiếp theo trong chuỗi Filter Chain của Spring
        filterChain.doFilter(request, response);
    }

    /**
     * Hàm phụ trợ lấy chuỗi JWT Token từ Header "Authorization" của Request.
     * Cấu trúc chuẩn gửi lên: Authorization: Bearer <Token_JWT>
     */
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        
        // Kiểm tra xem header Authorization có hợp lệ và bắt đầu bằng tiền tố "Bearer " không
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            // Cắt chuỗi bỏ đi 7 ký tự đầu tiên ("Bearer ") để lấy đúng chuỗi Token thô
            return bearerToken.substring(7);
        }
        return null; // Trả về null nếu không tìm thấy token hợp lệ
    }
}

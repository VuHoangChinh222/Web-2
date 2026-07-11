package com.example.vuhoangchinh.Config;

// Import lớp filter tự định nghĩa để kiểm tra JWT Token của máy khách gửi lên
import com.example.vuhoangchinh.Security.JwtAuthenticationFilter;

// Import các annotation cấu hình của Spring Framework
import org.springframework.beans.factory.annotation.Autowired; // Tự động tiêm dependency bean
import org.springframework.context.annotation.Bean; // Khai báo phương thức sinh ra một Spring Bean
import org.springframework.context.annotation.Configuration; // Khai báo đây là một lớp cấu hình ứng dụng
import org.springframework.http.HttpMethod; // Enum các phương thức HTTP (GET, POST, PUT, DELETE...)

// Import các thư viện của Spring Security để cấu hình bảo mật web
import org.springframework.security.config.annotation.web.builders.HttpSecurity; // Đối tượng dùng để cấu hình bảo mật các API HTTP
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity; // Kích hoạt tính năng Spring Security cho Web
import org.springframework.security.config.http.SessionCreationPolicy; // Định nghĩa cơ chế quản lý Session (phiên làm việc)
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder; // Thuật toán băm mật khẩu BCrypt
import org.springframework.security.crypto.password.PasswordEncoder; // Giao diện chung để mã hóa mật khẩu
import org.springframework.security.web.SecurityFilterChain; // Chuỗi bộ lọc bảo mật để kiểm tra request đi qua
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter; // Bộ lọc mặc định kiểm tra username/password của Spring
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.List;

/**
 * @Configuration: Đánh dấu đây là class cấu hình hệ thống. Spring sẽ quét qua class này khi khởi động.
 * @EnableWebSecurity: Kích hoạt bộ lọc bảo mật Spring Security để bảo vệ các endpoint URL.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // Tiêm filter JWT để cấu hình chạy trước khi kiểm tra tài khoản mặc định
    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * Khởi tạo PasswordEncoder Bean.
     * Sử dụng thuật toán BCrypt để mã hóa (băm) mật khẩu (mặc định với độ mạnh salt là 10).
     * Mật khẩu sau khi băm có dạng chuỗi dài cố định và không thể dịch ngược, đảm bảo an toàn tối đa.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Khởi tạo CorsConfigurationSource Bean để cho phép các yêu cầu CORS từ Frontend.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * Cấu hình Chuỗi bộ lọc bảo mật (SecurityFilterChain) cho toàn bộ ứng dụng web.
     * Đây là nơi quy định API nào mở tự do, API nào yêu cầu quyền đăng nhập.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1. Vô hiệu hóa tính năng bảo vệ CSRF (Cross-Site Request Forgery).
            // Do chúng ta thiết kế REST API chạy Stateless (không lưu session), dùng JWT Token, nên không cần CSRF token.
            .csrf(csrf -> csrf.disable())
            
            // 2. Cấu hình CORS (Cross-Origin Resource Sharing).
            // Sử dụng cấu hình nguồn CORS đã định nghĩa để vượt qua các rào cản cổng FE.
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // 3. Cấu hình Stateless Session Management (Quản lý phiên không lưu trạng thái).
            // Không tạo HTTP Session trên máy chủ Spring Boot, bắt buộc mỗi Request đều phải mang theo JWT Token để nhận diện.
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // 4. Thiết lập quy tắc phân quyền (Route Permissions) cho từng URL API:
            .authorizeHttpRequests(auth -> auth
                // Cho phép mở tự do hoàn toàn các tài liệu mô tả API Swagger UI để lập trình viên tiện debug
                .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**", "/api-docs/**").permitAll()
                
                // Cho phép tải ảnh lên và truy cập thư mục ảnh tĩnh không cần đăng nhập
                .requestMatchers("/api/uploads/**", "/image/**").permitAll()
                
                // Cho phép gọi API đăng nhập của Admin/Nhân viên công khai
                .requestMatchers("/api/auth/**").permitAll()
                
                // Cho phép gọi API đăng ký và đăng nhập của khách hàng tự do
                .requestMatchers("/api/customers/login", "/api/customers/register").permitAll()
                
                // Các API GET công khai phục vụ xem sản phẩm, danh mục, tin tức, banner ở trang Frontend
                .requestMatchers(HttpMethod.GET, "/api/products/**", "/api/product-images/**", "/api/product-variants/**", "/api/category-products/**", "/api/blogs/**", "/api/category-blogs/**", "/api/banners/**").permitAll()
                
                // Cho phép khách hàng gửi đơn đặt hàng
                .requestMatchers(HttpMethod.POST, "/api/orders").permitAll()
                
                // Bắt buộc phải đăng nhập (Authenticated) đối với mọi yêu cầu thay đổi dữ liệu (POST, PUT, DELETE) hoặc quản trị viên hệ thống
                .requestMatchers("/api/users/**", "/api/roles/**").authenticated()
                .anyRequest().authenticated()
            );

        // 5. Nạp cấu hình filter JWT vào hoạt động TRƯỚC bộ lọc UsernamePasswordAuthenticationFilter của Spring.
        // Khi Request gửi lên, filter JWT sẽ giải mã Token trước để thiết lập đăng nhập, sau đó filter mặc định của Spring
        // chỉ việc xem xét người dùng đó đã đăng nhập chưa để cho qua.
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build(); // Trả về cấu hình chuỗi bảo mật đã thiết lập
    }
}

package com.example.vuhoangchinh.Controllers;

// Import thực thể User và các repository cần thiết để xác thực thông tin tài khoản
import com.example.vuhoangchinh.Entities.User; // Thực thể lưu thông tin admin/nhân viên
import com.example.vuhoangchinh.Repositories.UserRepository; // Repository truy cập CSDL bảng users
import com.example.vuhoangchinh.Security.JwtTokenProvider; // Helper class để tạo JWT token đăng nhập

// Import thư viện Lombok hỗ trợ viết mã nguồn ngắn gọn, tự động sinh code
import lombok.*; // Annotations như @Data, @NoArgsConstructor, @AllArgsConstructor

// Import thư viện của Spring Framework
import org.springframework.beans.factory.annotation.Autowired; // Tự động inject bean phụ thuộc
import org.springframework.http.ResponseEntity; // Đại diện cho phản hồi HTTP (status, headers, body)
import org.springframework.security.crypto.password.PasswordEncoder; // Lớp hỗ trợ so khớp mật khẩu mã hóa BCrypt
import org.springframework.web.bind.annotation.*; // Annotations định nghĩa REST API Controller

// Import các cấu trúc dữ liệu cơ bản của Java
import java.util.HashMap;
import java.util.Map;

/**
 * @RestController: Khai báo lớp này là một REST Controller, trả về dữ liệu thô dạng JSON.
 * @RequestMapping("/api/auth"): Định nghĩa tiền tố đường dẫn chung phục vụ xác thực người dùng.
 * @CrossOrigin(origins = "*"): Cho phép mọi domain khác gọi API vào đây (phục vụ Frontend kết nối CORS).
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    // Tiêm UserRepository để truy vấn thông tin tài khoản đăng nhập
    @Autowired
    private UserRepository userRepository;

    // Tiêm PasswordEncoder để so khớp mật khẩu đăng nhập với CSDL
    @Autowired
    private PasswordEncoder passwordEncoder;

    // Tiêm JwtTokenProvider để sinh JWT token đăng nhập
    @Autowired
    private JwtTokenProvider tokenProvider;

    /**
     * DTO (Data Transfer Object) dùng để chứa dữ liệu yêu cầu đăng nhập gửi từ client lên.
     * Sử dụng class cụ thể giúp Swagger UI hiển thị tài liệu rõ ràng, không bị hiển thị key generic.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {
        private String username; // Tên đăng nhập của admin/nhân viên
        private String password; // Mật khẩu chưa mã hóa của admin/nhân viên
    }

    /**
     * API Đăng nhập hệ thống (dành cho Admin và Nhân viên quản trị).
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        String username = loginRequest.getUsername();
        String password = loginRequest.getPassword();

        // Kiểm tra xem dữ liệu truyền lên có bị null không
        if (username == null || password == null) {
            return ResponseEntity.badRequest().body("Username and password are required");
        }

        // Truy tìm User theo tên đăng nhập trong CSDL, nếu không tìm thấy trả về lỗi
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        // So khớp mật khẩu thô client gửi lên với mật khẩu đã mã hóa lưu trong Database
        if (!passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.status(401).body("Invalid username or password");
        }

        // Tạo JWT Token dựa trên tên đăng nhập tài khoản hệ thống
        String token = tokenProvider.generateToken(username);

        // Chuẩn bị dữ liệu trả về cho Client gồm chuỗi JWT Token, username và tên đầy đủ hiển thị
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("username", user.getUsername());
        response.put("fullName", user.getFullName());

        return ResponseEntity.ok(response);
    }
}

package com.example.vuhoangchinh.Controllers;

// Import thực thể và repository phục vụ truy xuất người dùng hệ thống
import com.example.vuhoangchinh.Entities.User; // Thực thể chứa thông tin tài khoản nhân viên/admin
import com.example.vuhoangchinh.Repositories.UserRepository; // Repository tương tác CSDL bảng users
import com.example.vuhoangchinh.Repositories.RoleRepository; // Repository tương tác CSDL bảng roles để liên kết vai trò

// Import các annotation của Spring Framework
import org.springframework.beans.factory.annotation.Autowired; // Tự động inject bean phụ thuộc
import org.springframework.web.bind.annotation.*; // Định nghĩa REST API Controller và Mapping (@GetMapping, @PostMapping, v.v.)

// Import kiểu cấu trúc danh sách dữ liệu động chuẩn của Java
import java.util.List;

/**
 * @RestController: Khai báo lớp này là một REST Controller, các dữ liệu trả về sẽ tự động chuyển thành JSON.
 * @RequestMapping("/api/users"): Định nghĩa tiền tố đường dẫn dùng chung cho các API quản lý User.
 * @CrossOrigin(origins = "*"): Cho phép mọi domain khác gọi API vào đây (phục vụ kết nối Frontend tránh lỗi CORS).
 */
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    // Tiêm bean UserRepository để quản lý thao tác CSDL người dùng
    @Autowired
    private UserRepository userRepository;

    // Tiêm bean RoleRepository để tìm kiếm vai trò khi liên kết tài khoản người dùng
    @Autowired
    private RoleRepository roleRepository;

    // Tiêm bean PasswordEncoder của Spring Security để mã hóa mật khẩu
    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    /**
     * API Lấy danh sách tất cả người dùng hệ thống.
     * GET /api/users
     */
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * API Tạo mới tài khoản người dùng (Admin, Nhân viên).
     * POST /api/users
     */
    @PostMapping
    public User createUser(@RequestBody User user) {
        // Kiểm tra xem đối tượng role truyền lên có ID hợp lệ không
        if (user.getRole() == null || user.getRole().getId() == null) {
            throw new RuntimeException("Role id is required");
        }
        
        // Tìm kiếm Role tương ứng trong CSDL, nếu không tồn tại thì báo lỗi
        var role = roleRepository.findById(user.getRole().getId())
                .orElseThrow(() -> new RuntimeException("Role not found"));
        user.setRole(role); // Thiết lập mối quan hệ với Role
        
        // Mã hóa mật khẩu thô bằng thuật toán BCrypt trước khi lưu tài khoản mới
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        // Lưu thông tin người dùng vào Database
        return userRepository.save(user);
    }

    /**
     * API Lấy chi tiết tài khoản người dùng theo mã ID.
     * GET /api/users/{id}
     */
    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id " + id));
    }

    /**
     * API Cập nhật tài khoản người dùng theo mã ID.
     * PUT /api/users/{id}
     */
    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        // Tìm kiếm tài khoản người dùng cần sửa trong CSDL, báo lỗi nếu không tìm thấy
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id " + id));
        
        // Cập nhật tên đăng nhập
        user.setUsername(userDetails.getUsername());
        
        // NẾU người dùng có truyền lên mật khẩu mới và không rỗng:
        // Tiến hành mã hóa mật khẩu mới bằng PasswordEncoder và cập nhật lại trường mật khẩu
        if (userDetails.getPassword() != null && !userDetails.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }
        
        // Cập nhật các thông tin cơ bản khác của người dùng
        user.setFullName(userDetails.getFullName());
        user.setEmail(userDetails.getEmail());
        user.setPhone(userDetails.getPhone());
        user.setImageUrl(userDetails.getImageUrl());
        user.setStatus(userDetails.getStatus());
        
        // Nếu người dùng có cập nhật vai trò mới (Role) thì tiến hành truy tìm vai trò mới và liên kết lại
        if (userDetails.getRole() != null && userDetails.getRole().getId() != null) {
            var role = roleRepository.findById(userDetails.getRole().getId())
                    .orElseThrow(() -> new RuntimeException("Role not found"));
            user.setRole(role);
        }
        
        // Lưu thông tin chỉnh sửa tài khoản vào Database
        return userRepository.save(user);
    }

    /**
     * API Xóa tài khoản người dùng hệ thống theo mã ID.
     * DELETE /api/users/{id}
     */
    @DeleteMapping("/{id}")
    public String deleteUser(@PathVariable Long id) {
        // Tìm kiếm tài khoản cần xóa trong CSDL, báo lỗi nếu không tìm thấy
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id " + id));
        
        // Tiến hành xóa tài khoản người dùng
        userRepository.delete(user);
        return "User with id " + id + " has been deleted.";
    }
}

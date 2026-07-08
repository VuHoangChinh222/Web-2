package com.example.vuhoangchinh.Controllers;

// Import thực thể và repository phục vụ truy xuất người dùng hệ thống
import com.example.vuhoangchinh.Entities.User; // Thực thể chứa thông tin tài khoản nhân viên/admin
import com.example.vuhoangchinh.Entities.Blog; // Thực thể bài viết
import com.example.vuhoangchinh.Repositories.UserRepository; // Repository tương tác CSDL bảng users
import com.example.vuhoangchinh.Repositories.RoleRepository; // Repository tương tác CSDL bảng roles để liên kết vai trò
import com.example.vuhoangchinh.Repositories.BlogRepository; // Repository tương tác CSDL bảng blogs
import org.springframework.http.ResponseEntity; // Phản hồi HTTP

// Import các annotation của Spring Framework
import org.springframework.beans.factory.annotation.Autowired; // Tự động inject bean phụ thuộc
import org.springframework.web.bind.annotation.*; // Định nghĩa REST API Controller và Mapping (@GetMapping, @PostMapping, v.v.)

// Import các lớp hỗ trợ phân trang và sắp xếp dữ liệu từ Spring Data
import org.springframework.data.domain.Page; // Đại diện cho một trang dữ liệu kèm metadata phân trang
import org.springframework.data.domain.PageRequest; // Class dùng để tạo yêu cầu phân trang cụ thể
import org.springframework.data.domain.Pageable; // Interface trừu tượng hóa tham số phân trang
import org.springframework.data.domain.Sort; // Đối tượng định nghĩa tiêu chí sắp xếp trường

// Import kiểu cấu trúc danh sách dữ liệu động chuẩn của Java
import java.util.List;

// Import thư viện Validation
import jakarta.validation.Valid;

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

    // Tiêm bean BlogRepository để truy xuất bài viết
    @Autowired
    private BlogRepository blogRepository;

    /**
     * API Lấy danh sách người dùng hệ thống hỗ trợ phân trang và sắp xếp.
     * GET /api/users?page=0&size=10&sortBy=id&sortDir=asc
     */
    @GetMapping
    public Page<User> getAllUsers(
            @RequestParam(defaultValue = "0") int page, // Trang số mấy (bắt đầu từ 0)
            @RequestParam(defaultValue = "10") int size, // Số bản ghi trên mỗi trang
            @RequestParam(defaultValue = "id") String sortBy, // Trường sắp xếp (e.g. username, email, id)
            @RequestParam(defaultValue = "asc") String sortDir) { // Hướng sắp xếp: asc (tăng) hoặc desc (giảm)
        
        // Khởi tạo bộ sắp xếp Sort dựa theo hướng và thuộc tính được truyền
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? 
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
                
        // Khởi tạo đối tượng Pageable làm tham số phân trang
        Pageable pageable = PageRequest.of(page, size, sort);
        
        // Gọi repository lấy dữ liệu phân trang từ MySQL và trả về
        return userRepository.findAll(pageable);
    }

    /**
     * API Tạo mới tài khoản người dùng (Admin, Nhân viên).
     * POST /api/users
     */
    @PostMapping
    public User createUser(@Valid @RequestBody User user) {
        // Kiểm tra xem đối tượng role truyền lên có ID hợp lệ không
        if (user.getRole() == null || user.getRole().getId() == null) {
            throw new RuntimeException("Role id is required");
        }
        
        // Tìm kiếm Role tương ứng trong CSDL, nếu không tồn tại thì báo lỗi
        var role = roleRepository.findById(user.getRole().getId())
                .orElseThrow(() -> new RuntimeException("Role not found"));
        user.setRole(role); // Thiết lập mối quan hệ với Role
        
        // Đảm bảo mật khẩu không bị trống khi tạo mới
        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("Mật khẩu không được để trống khi tạo mới tài khoản");
        }

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
    public User updateUser(@PathVariable Long id, @Valid @RequestBody User userDetails) {
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
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        // Tìm kiếm tài khoản cần xóa trong CSDL, báo lỗi nếu không tìm thấy
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id " + id));
        
        // Kiểm tra xem người dùng có bài viết nào liên kết không
        List<Blog> blogs = blogRepository.findByAuthorId(id);
        if (!blogs.isEmpty()) {
            return ResponseEntity.badRequest().body("Cannot delete user because they have written blog posts. Please delete their blog posts first.");
        }

        // Tiến hành xóa tài khoản người dùng
        userRepository.delete(user);
        return ResponseEntity.ok("User with id " + id + " has been deleted.");
    }
}

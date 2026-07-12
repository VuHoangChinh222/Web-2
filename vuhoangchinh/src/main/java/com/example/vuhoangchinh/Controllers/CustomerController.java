package com.example.vuhoangchinh.Controllers;

// Import các thực thể và repository từ nội bộ dự án
import com.example.vuhoangchinh.Entities.Customer; // Thực thể lưu thông tin khách hàng trong DB
import com.example.vuhoangchinh.Entities.Order; // Thực thể đơn hàng
import com.example.vuhoangchinh.Entities.UserAddress; // Thực thể sổ địa chỉ
import com.example.vuhoangchinh.Repositories.CustomerRepository; // Repository thực hiện CRUD với bảng customers
import com.example.vuhoangchinh.Repositories.OrderRepository; // Repository tương tác bảng orders
import com.example.vuhoangchinh.Repositories.UserAddressRepository; // Repository tương tác bảng user_addresses
import com.example.vuhoangchinh.Security.JwtTokenProvider; // Helper class dùng để tạo và giải mã JWT token
import org.springframework.transaction.annotation.Transactional; // Annotation hỗ trợ giao dịch CSDL

// Import các thư viện Lombok để tự động sinh Code (Getter, Setter, Constructor, v.v.)
import lombok.*; // Lombok annotations như @Data, @NoArgsConstructor, @AllArgsConstructor

// Import thư viện của Spring Framework
import org.springframework.beans.factory.annotation.Autowired; // Tự động inject (tiêm) dependency bean vào class
import org.springframework.http.ResponseEntity; // Đại diện cho phản hồi HTTP (gồm status, header, body)
import org.springframework.security.crypto.password.PasswordEncoder; // Dùng để mã hóa (hash) và kiểm tra mật khẩu bằng BCrypt
import org.springframework.web.bind.annotation.*; // Các annotation định nghĩa API (REST Controller, Request Mapping, v.v.)

// Import các thư viện hỗ trợ phân trang và sắp xếp dữ liệu từ Spring Data
import org.springframework.data.domain.Page; // Đại diện cho một trang kết quả dữ liệu kèm thông tin phân trang
import org.springframework.data.domain.PageRequest; // Class khởi tạo đối tượng phân trang cụ thể (trang số mấy, bao nhiêu phần tử)
import org.springframework.data.domain.Pageable; // Interface trừu tượng hóa tham số phân trang
import org.springframework.data.domain.Sort; // Định nghĩa tiêu chí sắp xếp (theo cột nào, tăng hay giảm)

// Import các cấu trúc dữ liệu chuẩn của Java
import java.util.HashMap; // Map dùng bảng băm để lưu kết quả trả về dạng key-value
import java.util.List; // Danh sách động lưu trữ tập hợp phần tử
import java.util.Map; // Giao diện cấu trúc dữ liệu lưu cặp key-value

// Import thư viện validation
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

/**
 * @RestController: Khai báo đây là một Controller cung cấp API dạng RESTful.
 *                  Mọi dữ liệu trả về từ các method sẽ được tự động chuyển thành JSON.
 * @RequestMapping("/api/customers"): Định nghĩa tiền tố đường dẫn chung cho toàn bộ các API trong class này.
 * @CrossOrigin(origins = "*"): Cho phép mọi nguồn (Domain) khác gọi API đến đây (tránh lỗi bảo mật CORS khi kết nối Frontend).
 */
@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "*")
public class CustomerController {

    // Tiêm Bean CustomerRepository để thực hiện các thao tác ghi/đọc CSDL khách hàng
    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private com.example.vuhoangchinh.Services.EmailService emailService;

    @org.springframework.beans.factory.annotation.Value("${google.client.id}")
    private String googleClientId;

    // Tiêm Bean PasswordEncoder để xử lý mã hóa mật khẩu khách hàng
    @Autowired
    private PasswordEncoder passwordEncoder;

    // Tiêm Bean JwtTokenProvider để xử lý sinh token khi khách hàng đăng nhập thành công
    @Autowired
    private JwtTokenProvider tokenProvider;

    // Tiêm Bean OrderRepository để kiểm tra ràng buộc đơn hàng
    @Autowired
    private OrderRepository orderRepository;

    // Tiêm Bean UserAddressRepository để dọn dẹp địa chỉ
    @Autowired
    private UserAddressRepository userAddressRepository;

    /**
     * DTO (Data Transfer Object) dùng để hứng dữ liệu đăng nhập từ Client gửi lên.
     * Tránh việc dùng Map chung chung để Swagger UI hiển thị tài liệu chuẩn xác.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomerLoginRequest {
        @NotBlank(message = "Email đăng nhập không được để trống")
        @Email(message = "Email không đúng định dạng hợp lệ")
        private String email; // Email đăng nhập của khách hàng

        @NotBlank(message = "Mật khẩu đăng nhập không được để trống")
        private String password; // Mật khẩu chưa mã hóa của khách hàng
    }

    /**
     * API Đăng ký tài khoản khách hàng mới.
     * POST /api/customers/register
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody Customer customer) {
        // Kiểm tra xem email đăng ký đã tồn tại trong hệ thống chưa
        if (customerRepository.findByEmail(customer.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email is already registered");
        }
        
        // Đảm bảo mật khẩu đăng ký không được để trống
        if (customer.getPassword() == null || customer.getPassword().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Password is required");
        }

        // Tiến hành mã hóa mật khẩu thô trước khi lưu vào cơ sở dữ liệu để bảo mật
        customer.setPassword(passwordEncoder.encode(customer.getPassword()));
        
        // Thiết lập trạng thái hoạt động mặc định khi mới đăng ký là 1 (Active)
        customer.setStatus(1);
        
        // Lưu khách hàng mới vào database
        Customer savedCustomer = customerRepository.save(customer);
        
        // Trả về kết quả 200 OK kèm thông tin khách hàng vừa lưu
        return ResponseEntity.ok(savedCustomer);
    }

    /**
     * API Đăng nhập của khách hàng.
     * POST /api/customers/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody CustomerLoginRequest loginRequest) {
        String email = loginRequest.getEmail();
        String password = loginRequest.getPassword();

        // Kiểm tra xem dữ liệu truyền lên có bị trống không
        if (email == null || password == null) {
            return ResponseEntity.badRequest().body("Email and password are required");
        }

        // Truy tìm khách hàng theo email trong database, nếu không thấy thì báo lỗi
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        // So khớp mật khẩu thô người dùng nhập với mật khẩu đã mã hóa lưu trong DB
        if (!passwordEncoder.matches(password, customer.getPassword())) {
            return ResponseEntity.status(401).body("Invalid email or password");
        }

        // Tạo chuỗi Bearer JWT Token đại diện cho phiên làm việc dựa trên Email khách hàng
        String token = tokenProvider.generateToken(email);

        // Tạo một đối tượng sao chép của customer để gửi về frontend mà không chứa password
        Customer responseCustomer = new Customer();
        responseCustomer.setId(customer.getId());
        responseCustomer.setEmail(customer.getEmail());
        responseCustomer.setFullName(customer.getFullName());
        responseCustomer.setPhone(customer.getPhone());
        responseCustomer.setImageUrl(customer.getImageUrl());
        responseCustomer.setStatus(customer.getStatus());
        responseCustomer.setCreatedAt(customer.getCreatedAt());
        responseCustomer.setUpdatedAt(customer.getUpdatedAt());

        // Chuẩn bị dữ liệu trả về Frontend gồm token và đối tượng customer
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("customer", responseCustomer);

        return ResponseEntity.ok(response);
    }

    /**
     * API Lấy danh sách khách hàng hỗ trợ phân trang và sắp xếp.
     * GET /api/customers?page=0&size=10&sortBy=id&sortDir=asc
     */
    @GetMapping
    public Page<Customer> getAllCustomers(
            @RequestParam(defaultValue = "0") int page, // Trang số mấy (bắt đầu từ 0)
            @RequestParam(defaultValue = "10") int size, // Số lượng phần tử mỗi trang
            @RequestParam(defaultValue = "id") String sortBy, // Trường cần sắp xếp (ví dụ: email, fullName, id)
            @RequestParam(defaultValue = "asc") String sortDir) { // Hướng sắp xếp: asc (tăng dần) hoặc desc (giảm dần)
        
        // Khởi tạo đối tượng Sort dựa vào cột và hướng sắp xếp người dùng truyền lên
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? 
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
                
        // Khởi tạo đối tượng phân trang Pageable
        Pageable pageable = PageRequest.of(page, size, sort);
        
        // Gọi repository để tìm kiếm và trả về dữ liệu phân trang từ Database
        return customerRepository.findAll(pageable);
    }

    /**
     * API Thêm mới khách hàng thủ công (dành cho Admin quản lý).
     * POST /api/customers
     */
    @PostMapping
    public Customer createCustomer(@Valid @RequestBody Customer customer) {
        // Đảm bảo mật khẩu không được để trống khi tạo mới
        if (customer.getPassword() == null || customer.getPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("Mật khẩu không được để trống khi tạo mới khách hàng");
        }

        // Mã hóa mật khẩu khi admin tạo tài khoản cho khách hàng
        customer.setPassword(passwordEncoder.encode(customer.getPassword()));
        return customerRepository.save(customer);
    }

    /**
     * API Lấy chi tiết thông tin của 1 khách hàng theo mã ID.
     * GET /api/customers/{id}
     */
    @GetMapping("/{id}")
    public Customer getCustomerById(@PathVariable Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id " + id));
    }

    /**
     * API Cập nhật thông tin khách hàng.
     * PUT /api/customers/{id}
     */
    @PutMapping("/{id}")
    public Customer updateCustomer(@PathVariable Long id, @Valid @RequestBody Customer customerDetails) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id " + id));

        // Cập nhật các trường thông tin cơ bản
        customer.setEmail(customerDetails.getEmail());
        customer.setFullName(customerDetails.getFullName());
        customer.setPhone(customerDetails.getPhone());
        customer.setImageUrl(customerDetails.getImageUrl());
        customer.setStatus(customerDetails.getStatus());

        // Nếu người dùng có gửi mật khẩu mới lên thì tiến hành mã hóa và cập nhật mật khẩu mới
        if (customerDetails.getPassword() != null && !customerDetails.getPassword().trim().isEmpty()) {
            customer.setPassword(passwordEncoder.encode(customerDetails.getPassword()));
        }

        // Lưu thông tin cập nhật vào Database
        return customerRepository.save(customer);
    }

    /**
     * API Xóa khách hàng khỏi hệ thống theo ID.
     * DELETE /api/customers/{id}
     */
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteCustomer(@PathVariable Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id " + id));
        
        // Kiểm tra xem khách hàng có đơn hàng nào hay không
        List<Order> orders = orderRepository.findByCustomerId(id);
        if (!orders.isEmpty()) {
            return ResponseEntity.badRequest().body("Cannot delete customer because they have existing orders. Please delete their orders first.");
        }

        // Thực hiện xóa toàn bộ địa chỉ liên quan trước để tránh lỗi khóa ngoại
        List<UserAddress> addresses = userAddressRepository.findByCustomerId(id);
        userAddressRepository.deleteAll(addresses);

        // Thực hiện xóa khách hàng
        customerRepository.delete(customer);
        return ResponseEntity.ok("Customer with id " + id + " has been deleted.");
    }

    /**
     * DTO hứng yêu cầu Quên mật khẩu
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ForgotPasswordRequest {
        @NotBlank(message = "Email không được để trống")
        @Email(message = "Email không đúng định dạng")
        private String email;
    }

    /**
     * DTO hứng yêu cầu Khôi phục mật khẩu
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResetPasswordRequest {
        @NotBlank(message = "Token không được để trống")
        private String token;

        @NotBlank(message = "Mật khẩu mới không được để trống")
        private String password;
    }

    /**
     * DTO hứng yêu cầu Đăng nhập bằng Google
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GoogleLoginRequest {
        @NotBlank(message = "IdToken không được để trống")
        private String idToken;
    }

    /**
     * API Yêu cầu khôi phục mật khẩu qua Email.
     * POST /api/customers/forgot-password
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        Customer customer = customerRepository.findByEmail(request.getEmail()).orElse(null);
        if (customer == null) {
            return ResponseEntity.badRequest().body("Email address is not registered");
        }

        // Tạo token ngẫu nhiên và lưu thời hạn 15 phút
        String token = java.util.UUID.randomUUID().toString();
        customer.setResetToken(token);
        customer.setResetTokenExpiry(java.time.LocalDateTime.now().plusMinutes(15));
        customerRepository.save(customer);

        // Tạo link reset gửi về cho khách hàng
        String resetLink = "http://localhost:5173/reset-password?token=" + token;
        emailService.sendPasswordResetEmail(customer, resetLink);

        return ResponseEntity.ok("Chúng tôi đã gửi link đặt lại mật khẩu vào email của bạn. Vui lòng kiểm tra hộp thư!");
    }

    /**
     * API Khôi phục mật khẩu từ resetToken.
     * POST /api/customers/reset-password
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        Customer customer = customerRepository.findByResetToken(request.getToken()).orElse(null);
        if (customer == null) {
            return ResponseEntity.badRequest().body("Mã token khôi phục mật khẩu không hợp lệ");
        }

        if (customer.getResetTokenExpiry() == null || customer.getResetTokenExpiry().isBefore(java.time.LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("Mã token khôi phục mật khẩu đã hết hạn");
        }

        // Đổi mật khẩu mới và xóa token
        customer.setPassword(passwordEncoder.encode(request.getPassword()));
        customer.setResetToken(null);
        customer.setResetTokenExpiry(null);
        customerRepository.save(customer);

        return ResponseEntity.ok("Đặt lại mật khẩu thành công! Bạn có thể dùng mật khẩu mới để đăng nhập.");
    }

    /**
     * API Đăng nhập bằng Google ID Token.
     * POST /api/customers/google-login
     */
    @PostMapping("/google-login")
    public ResponseEntity<?> googleLogin(@Valid @RequestBody GoogleLoginRequest request) {
        try {
            com.google.api.client.http.javanet.NetHttpTransport transport = new com.google.api.client.http.javanet.NetHttpTransport();
            com.google.api.client.json.gson.GsonFactory jsonFactory = com.google.api.client.json.gson.GsonFactory.getDefaultInstance();

            com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier verifier = 
                    new com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier.Builder(transport, jsonFactory)
                            .setAudience(java.util.Collections.singletonList(googleClientId))
                            .build();

            com.google.api.client.googleapis.auth.oauth2.GoogleIdToken idToken = verifier.verify(request.getIdToken());
            if (idToken == null) {
                return ResponseEntity.status(401).body("Xác thực Google ID Token thất bại");
            }

            com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String pictureUrl = (String) payload.get("picture");

            if (email == null) {
                return ResponseEntity.badRequest().body("Không tìm thấy email từ tài khoản Google");
            }

            // Tìm hoặc tự động đăng ký khách hàng mới
            Customer customer = customerRepository.findByEmail(email).orElse(null);
            if (customer == null) {
                customer = new Customer();
                customer.setEmail(email);
                customer.setFullName(name != null ? name : "Google User");
                customer.setImageUrl(pictureUrl);
                customer.setPhone("0900000000"); // SĐT mặc định thỏa mãn regex số điện thoại
                customer.setPassword(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));
                customer.setStatus(1); // Hoạt động
                customer = customerRepository.save(customer);
            }

            // Tạo token JWT
            String token = tokenProvider.generateToken(email);

            // Copy sang DTO an toàn không trả về password
            Customer responseCustomer = new Customer();
            responseCustomer.setId(customer.getId());
            responseCustomer.setEmail(customer.getEmail());
            responseCustomer.setFullName(customer.getFullName());
            responseCustomer.setPhone(customer.getPhone());
            responseCustomer.setImageUrl(customer.getImageUrl());
            responseCustomer.setStatus(customer.getStatus());
            responseCustomer.setCreatedAt(customer.getCreatedAt());
            responseCustomer.setUpdatedAt(customer.getUpdatedAt());

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("customer", responseCustomer);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Lỗi xác thực Google: " + e.getMessage());
        }
    }
}

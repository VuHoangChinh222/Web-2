package com.example.vuhoangchinh.Controllers;

// Import thực thể và repository phục vụ thao tác cơ sở dữ liệu
import com.example.vuhoangchinh.Entities.UserAddress; // Thực thể địa chỉ khách hàng
import com.example.vuhoangchinh.Repositories.UserAddressRepository; // Repository tương tác CSDL bảng user_addresses
import com.example.vuhoangchinh.Repositories.CustomerRepository; // Repository tương tác CSDL bảng customers

// Import Lombok hỗ trợ tự sinh code
import lombok.*; // Lombok annotations như @Data, @NoArgsConstructor, @AllArgsConstructor

// Import thư viện của Spring Framework
import org.springframework.beans.factory.annotation.Autowired; // Tự động tiêm dependency bean
import org.springframework.http.ResponseEntity; // Đối tượng bọc kết quả phản hồi HTTP (status, body)
import org.springframework.web.bind.annotation.*; // Các annotations REST API (@RestController, @RequestMapping, @PostMapping, v.v.)

// Import cấu trúc dữ liệu chuẩn của Java
import java.util.List; // Kiểu danh sách dữ liệu động

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

/**
 * @RestController: Khai báo lớp này là một REST Controller cung cấp các endpoint API trả về JSON.
 * @RequestMapping("/api/user-addresses"): Định nghĩa đường dẫn tiền tố chung cho tất cả API trong lớp này.
 * @CrossOrigin(origins = "*"): Cho phép gọi API từ mọi domain khác nhau (CORS).
 */
@RestController
@RequestMapping("/api/user-addresses")
@CrossOrigin(origins = "*")
public class UserAddressController {

    // Tiêm repository quản lý địa chỉ giao hàng
    @Autowired
    private UserAddressRepository userAddressRepository;

    // Tiêm repository quản lý khách hàng để đối chiếu ID
    @Autowired
    private CustomerRepository customerRepository;

    /**
     * DTO (Data Transfer Object) dùng để chứa dữ liệu yêu cầu thêm mới/cập nhật địa chỉ.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserAddressRequest {
        @NotNull(message = "ID khách hàng là bắt buộc")
        private Long customerId; // ID của khách hàng sở hữu địa chỉ này
        
        @NotBlank(message = "Tên người nhận không được để trống")
        private String recipientName; // Tên người nhận hàng tại địa chỉ này
        
        @NotBlank(message = "Số điện thoại người nhận không được để trống")
        @Pattern(regexp = "^(0|\\+84)[0-9]{9}$", message = "Số điện thoại người nhận không đúng định dạng (Ví dụ: 0912345678)")
        private String recipientPhone; // Số điện thoại liên hệ của người nhận
        
        @NotBlank(message = "Địa chỉ chi tiết không được để trống")
        private String addressLine; // Địa chỉ chi tiết (số nhà, ngõ, tên đường)
        
        @NotBlank(message = "Phường/Xã không được để trống")
        private String ward; // Phường/Xã
        
        @NotBlank(message = "Quận/Huyện không được để trống")
        private String district; // Quận/Huyện
        
        @NotBlank(message = "Tỉnh/Thành phố không được để trống")
        private String city; // Tỉnh/Thành phố
        
        @com.fasterxml.jackson.annotation.JsonProperty("isDefault")
        private Boolean isDefault; // Đánh dấu đây có phải địa chỉ giao hàng mặc định hay không
    }

    /**
     * API Lấy toàn bộ danh sách địa chỉ giao hàng trong hệ thống (dành cho quản trị).
     * GET /api/user-addresses
     */
    @GetMapping
    public List<UserAddress> getAllAddresses() {
        return userAddressRepository.findAll();
    }

    /**
     * API Lấy toàn bộ địa chỉ giao hàng của một khách hàng cụ thể theo ID của khách hàng.
     * GET /api/user-addresses/customer/{customerId}
     */
    @GetMapping("/customer/{customerId}")
    public List<UserAddress> getAddressesByCustomerId(@PathVariable Long customerId) {
        return userAddressRepository.findByCustomerId(customerId);
    }

    /**
     * API Thêm mới địa chỉ giao hàng cho khách hàng.
     * POST /api/user-addresses
     */
    @PostMapping
    public ResponseEntity<?> createAddress(@Valid @RequestBody UserAddressRequest request) {
        // Kiểm tra xem ID của khách hàng có được gửi lên hay không
        if (request.getCustomerId() == null) {
            return ResponseEntity.badRequest().body("Customer id is required");
        }
        
        // Tìm kiếm khách hàng sở hữu trong CSDL, nếu không tồn tại thì báo lỗi
        var customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found with id " + request.getCustomerId()));

        // Khởi tạo thực thể UserAddress mới để chuẩn bị lưu vào CSDL
        UserAddress userAddress = new UserAddress();
        userAddress.setCustomer(customer); // Thiết lập mối quan hệ với Customer
        userAddress.setRecipientName(request.getRecipientName());
        userAddress.setRecipientPhone(request.getRecipientPhone());
        userAddress.setAddressLine(request.getAddressLine());
        userAddress.setWard(request.getWard());
        userAddress.setDistrict(request.getDistrict());
        userAddress.setCity(request.getCity());
        // Thiết lập trạng thái mặc định, nếu không truyền mặc định sẽ là false
        userAddress.setIsDefault(request.getIsDefault() != null ? request.getIsDefault() : false);

        // NẾU địa chỉ mới được đặt là Mặc định (isDefault = true):
        // Cần cập nhật lại tất cả địa chỉ cũ của khách hàng này về trạng thái không mặc định (false)
        if (Boolean.TRUE.equals(userAddress.getIsDefault())) {
            resetDefaultAddresses(customer.getId());
        }

        // Lưu thông tin địa chỉ mới vào Database
        UserAddress savedAddress = userAddressRepository.save(userAddress);
        return ResponseEntity.ok(savedAddress);
    }

    /**
     * API Lấy thông tin chi tiết một địa chỉ giao hàng theo ID.
     * GET /api/user-addresses/{id}
     */
    @GetMapping("/{id}")
    public UserAddress getAddressById(@PathVariable Long id) {
        return userAddressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Address not found with id " + id));
    }

    /**
     * API Cập nhật thông tin địa chỉ giao hàng theo ID địa chỉ.
     * PUT /api/user-addresses/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAddress(@PathVariable Long id, @Valid @RequestBody UserAddressRequest request) {
        // Tìm địa chỉ cần sửa trong Database, nếu không có thì báo lỗi
        UserAddress userAddress = userAddressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Address not found with id " + id));

        // Cập nhật các trường thông tin nhận hàng
        userAddress.setRecipientName(request.getRecipientName());
        userAddress.setRecipientPhone(request.getRecipientPhone());
        userAddress.setAddressLine(request.getAddressLine());
        userAddress.setWard(request.getWard());
        userAddress.setDistrict(request.getDistrict());
        userAddress.setCity(request.getCity());
        userAddress.setIsDefault(request.getIsDefault() != null ? request.getIsDefault() : false);

        // NẾU cập nhật địa chỉ này thành địa chỉ Mặc định:
        // Cần reset lại toàn bộ địa chỉ khác của khách hàng đó về false
        if (Boolean.TRUE.equals(userAddress.getIsDefault())) {
            resetDefaultAddresses(userAddress.getCustomer().getId());
        }

        // Lưu địa chỉ đã cập nhật vào Database
        UserAddress updatedAddress = userAddressRepository.save(userAddress);
        return ResponseEntity.ok(updatedAddress);
    }

    /**
     * API Xóa địa chỉ giao hàng theo ID địa chỉ.
     * DELETE /api/user-addresses/{id}
     */
    @DeleteMapping("/{id}")
    public String deleteAddress(@PathVariable Long id) {
        UserAddress userAddress = userAddressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Address not found with id " + id));
        
        // Thực hiện xóa địa chỉ khỏi Database
        userAddressRepository.delete(userAddress);
        return "Address with id " + id + " has been deleted.";
    }

    /**
     * Hàm nội bộ hỗ trợ: Chuyển toàn bộ các địa chỉ giao hàng của một khách hàng về trạng thái false (không mặc định).
     * Được gọi mỗi khi có một địa chỉ mới được đặt làm mặc định (isDefault = true).
     */
    private void resetDefaultAddresses(Long customerId) {
        // Lấy toàn bộ danh sách địa chỉ của khách hàng này
        List<UserAddress> addresses = userAddressRepository.findByCustomerId(customerId);
        for (UserAddress addr : addresses) {
            // Nếu phát hiện địa chỉ nào đang là mặc định thì cập nhật về false
            if (Boolean.TRUE.equals(addr.getIsDefault())) {
                addr.setIsDefault(false);
                userAddressRepository.save(addr); // Lưu thay đổi vào DB
            }
        }
    }
}

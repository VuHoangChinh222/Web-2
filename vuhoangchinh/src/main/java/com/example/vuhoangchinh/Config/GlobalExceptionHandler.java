package com.example.vuhoangchinh.Config;

// Import thư viện chuẩn của Spring hỗ trợ bắt lỗi HTTP
import org.springframework.http.ResponseEntity; // Trả về HTTP status
import org.springframework.validation.FieldError; // Đại diện cho một trường bị lỗi
import org.springframework.web.bind.MethodArgumentNotValidException; // Loại lỗi văng ra khi Validation thất bại
import org.springframework.web.bind.annotation.ControllerAdvice; // Khai báo đây là lớp tư vấn/bắt lỗi toàn cục
import org.springframework.web.bind.annotation.ExceptionHandler; // Đánh dấu hàm này dùng để bắt lỗi cụ thể nào

// Import cấu trúc dữ liệu Map của Java
import java.util.HashMap;
import java.util.Map;

/**
 * @ControllerAdvice: Lớp này đóng vai trò "người bảo vệ" đứng ở ngoài cùng.
 * Bất cứ khi nào có lỗi nhập liệu (Validation) xảy ra ở bất kỳ API nào,
 * lớp này sẽ chặn lỗi đó lại, không cho văng log lỗi 500 đỏ rực trên console,
 * mà gom lại thành 1 cục JSON gọn gàng trả về mã 400 Bad Request cho Frontend.
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Hàm bẫy lỗi MethodArgumentNotValidException (Lỗi do dùng @Valid mà dữ liệu sai).
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        
        // Duyệt qua tất cả các lỗi mà Spring Boot Validation bắt được
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            // Lấy tên của trường bị nhập sai (ví dụ: "phone", "basePrice")
            String fieldName = ((FieldError) error).getField();
            
            // Lấy thông báo lỗi tương ứng mà chúng ta đã cấu hình (ví dụ: "Số điện thoại không hợp lệ")
            String errorMessage = error.getDefaultMessage();
            
            errors.put(fieldName, errorMessage);
        });
        
        // Trả về cho Frontend cục JSON chứa danh sách lỗi kèm theo mã HTTP 400
        return ResponseEntity.badRequest().body(errors);
    }

    /**
     * Bắt lỗi các đối số truyền vào không hợp lệ (IllegalArgumentException).
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        Map<String, String> errors = new HashMap<>();
        errors.put("error", ex.getMessage());
        return ResponseEntity.badRequest().body(errors);
    }

    /**
     * Bắt các lỗi RuntimeException khác xảy ra trong quá trình xử lý nghiệp vụ (ví dụ: không tìm thấy ID).
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        Map<String, String> errors = new HashMap<>();
        errors.put("error", ex.getMessage());
        return ResponseEntity.badRequest().body(errors);
    }
}

package com.example.vuhoangchinh.Controllers;

// Import các thư viện của Spring Framework phục vụ API và quản lý file upload
import org.springframework.http.ResponseEntity; // Đại diện cho phản hồi HTTP (gồm status, header, body)
import org.springframework.web.bind.annotation.*; // Các annotations định nghĩa API RESTful (@RestController, @PostMapping, v.v.)
import org.springframework.web.multipart.MultipartFile; // Đối tượng của Spring đại diện cho tệp tin được tải lên từ HTTP request

// Import các thư viện Java chuẩn xử lý tệp tin (I/O) và định danh
import java.io.IOException; // Ngoại lệ xảy ra khi có lỗi đọc/ghi tệp tin
import java.nio.file.Files; // Lớp hỗ trợ các thao tác với tệp tin và thư mục (tạo, copy, xóa)
import java.nio.file.Path; // Giao diện biểu diễn đường dẫn tệp tin trong hệ thống
import java.nio.file.Paths; // Lớp tiện ích để chuyển đổi chuỗi thành đối tượng Path
import java.nio.file.StandardCopyOption; // Định nghĩa các tùy chọn khi ghi/copy tệp tin (ví dụ: ghi đè nếu tồn tại)
import java.util.UUID; // Dùng để sinh chuỗi định danh ngẫu nhiên duy nhất (Universally Unique Identifier)

/**
 * @RestController: Khai báo lớp này là một REST Controller, trả về dữ liệu thô dạng JSON.
 * @RequestMapping("/api/uploads"): Định nghĩa đường dẫn tiền tố chung phục vụ cho việc tải lên tệp tin.
 * @CrossOrigin(origins = "*"): Cho phép mọi domain khác gọi API vào đây (phục vụ Frontend kết nối CORS).
 */
@RestController
@RequestMapping("/api/uploads")
@CrossOrigin(origins = "*")
public class FileUploadController {

    // Thư mục đích trong mã nguồn để lưu trữ các hình ảnh tĩnh được tải lên
    private static final String UPLOAD_DIR = "src/main/resources/static/image";

    /**
     * API Tải lên hình ảnh.
     * POST /api/uploads/image
     * Nhận vào một file qua Request Parameter tên là "file".
     */
    @PostMapping("/image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        // Kiểm tra xem file tải lên có bị trống không
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty");
        }

        try {
            // Xác định thư mục upload dựa trên thư mục đang chạy ứng dụng (workspace root hoặc project root)
            String userDir = System.getProperty("user.dir");
            Path uploadPath = Paths.get(userDir, "src", "main", "resources", "static", "image");
            
            // Nếu đang chạy từ thư mục gốc của workspace (chứa dự án con vuhoangchinh)
            if (Files.exists(Paths.get(userDir, "vuhoangchinh"))) {
                uploadPath = Paths.get(userDir, "vuhoangchinh", "src", "main", "resources", "static", "image");
            }
            
            // Nếu thư mục lưu trữ static/image chưa tồn tại, tiến hành tạo mới
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Trích xuất đuôi mở rộng của tệp tin tải lên (ví dụ: .png, .jpg, .webp)
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            
            // Sinh tên tệp tin ngẫu nhiên duy nhất bằng UUID ghép với đuôi tệp tin
            // Điều này nhằm tránh việc các file trùng tên nhau ghi đè mất dữ liệu của nhau
            String newFilename = UUID.randomUUID().toString() + extension;

            // Xác định đường dẫn đầy đủ nơi file mới sẽ được lưu trữ
            Path targetLocation = uploadPath.resolve(newFilename);
            
            // Sao chép luồng dữ liệu (Input Stream) của file được tải lên vào vị trí đích trong thư mục
            // StandardCopyOption.REPLACE_EXISTING: Nếu file đích đã tồn tại thì ghi đè lên
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Tạo đường dẫn tĩnh tương đối để lưu vào cơ sở dữ liệu
            // Spring Boot cấu hình mặc định thư mục "static" tương ứng với đường dẫn gốc "/"
            // Nên ảnh lưu ở "static/image/file.png" truy cập qua URL "/image/file.png"
            String imageUrl = "/image/" + newFilename;
            
            // Trả về kết quả thành công kèm đường dẫn tương đối của ảnh để lưu vào DB
            return ResponseEntity.ok(imageUrl);

        } catch (IOException e) {
            // Trả về lỗi 500 nếu xảy ra lỗi trong quá trình lưu file vật lý
            return ResponseEntity.status(500).body("Could not upload file: " + e.getMessage());
        }
    }
}

package com.example.vuhoangchinh.Controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@RestController
@RequestMapping("/api/uploads")
@CrossOrigin(origins = "*")
public class FileUploadController {

    private static final String UPLOAD_DIR = "src/main/resources/static/image";

    @PostMapping("/image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty");
        }

        try {
            // Đảm bảo thư mục upload tồn tại
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Tạo tên file ngẫu nhiên để tránh trùng lặp
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String newFilename = UUID.randomUUID().toString() + extension;

            // Copy file vào thư mục static/image
            Path targetLocation = uploadPath.resolve(newFilename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Trả về đường dẫn tĩnh của ảnh để lưu vào Database
            String imageUrl = "/image/" + newFilename;
            return ResponseEntity.ok(imageUrl);

        } catch (IOException e) {
            return ResponseEntity.status(500).body("Could not upload file: " + e.getMessage());
        }
    }
}

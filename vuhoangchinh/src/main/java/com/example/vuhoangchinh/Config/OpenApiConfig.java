package com.example.vuhoangchinh.Config;

// Import các class từ thư viện Swagger OpenAPI để thiết kế cấu trúc tài liệu API
import io.swagger.v3.oas.models.Components; // Đối tượng quản lý các thành phần tái sử dụng trong tài liệu (như Security Schemes)
import io.swagger.v3.oas.models.OpenAPI; // Thực thể gốc cấu tạo nên toàn bộ tài liệu OpenAPI
import io.swagger.v3.oas.models.info.Info; // Đối tượng chứa thông tin chung của dự án (tên, phiên bản, mô tả)
import io.swagger.v3.oas.models.info.Contact; // Đối tượng chứa thông tin liên hệ của lập trình viên
import io.swagger.v3.oas.models.security.SecurityRequirement; // Đối tượng quy định API nào áp dụng cơ chế bảo mật
import io.swagger.v3.oas.models.security.SecurityScheme; // Đối tượng định nghĩa loại bảo mật sử dụng (như Bearer JWT)

// Import các annotation của Spring
import org.springframework.context.annotation.Bean; // Khai báo phương thức khởi tạo một Spring Bean
import org.springframework.context.annotation.Configuration; // Đánh dấu lớp cấu hình hệ thống

/**
 * @Configuration: Khai báo lớp này là một lớp cấu hình Spring, được chạy ngay khi khởi động ứng dụng.
 */
@Configuration
public class OpenApiConfig {

    /**
     * Cấu hình OpenAPI Bean để tùy biến giao diện Swagger UI và tích hợp cơ chế nhập Token xác thực (Authorize).
     */
    @Bean
    public OpenAPI customOpenAPI() {
        // Tên định danh cho cơ chế bảo mật JWT
        final String securitySchemeName = "bearerAuth";

        return new OpenAPI()
                // 1. Cấu hình thông tin giới thiệu chung về bộ tài liệu API của dự án
                .info(new Info()
                        .title("VuHoangChinh API Documentation") // Tiêu đề tài liệu API hiển thị trên giao diện Swagger
                        .version("1.0.0") // Phiên bản phát hành của API
                        .description("Tài liệu hướng dẫn sử dụng và kiểm thử API cho dự án VuHoangChinh Backend.") // Mô tả dự án
                        .contact(new Contact()
                                .name("Vũ Hoàng Chinh") // Tên lập trình viên
                                .email("chinh.vu@example.com"))) // Email liên hệ
                                
                // 2. Cấu hình áp dụng bảo mật bảo vệ toàn bộ API mặc định trên Swagger UI
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                
                // 3. Khai báo định nghĩa cơ chế bảo mật cụ thể trong Components
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName) // Gắn tên định danh
                                        .type(SecurityScheme.Type.HTTP) // Định nghĩa kiểu bảo mật là qua giao thức HTTP
                                        .scheme("bearer") // Sử dụng lược đồ Bearer xác thực
                                        .bearerFormat("JWT") // Chuẩn định dạng token gửi lên là JWT
                                        .description("Nhập token JWT của bạn để xác thực quyền truy cập API. (Không cần gõ chữ Bearer phía trước)")));
    }
}

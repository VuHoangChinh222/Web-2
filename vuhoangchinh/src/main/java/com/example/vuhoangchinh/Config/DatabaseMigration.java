package com.example.vuhoangchinh.Config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * DatabaseMigration: Lớp chạy tự động khi ứng dụng khởi động.
 * Mục đích: Buộc MySQL ALTER các cột hình ảnh từ VARCHAR(255) sang LONGTEXT
 * vì Hibernate ddl-auto=update KHÔNG TỰ ĐỘNG thay đổi kiểu cột đã tồn tại.
 *
 * @Order(-1): Đảm bảo chạy TRƯỚC DataSeeder (mặc định Order = 0).
 */
@Component
@Order(-1)
public class DatabaseMigration implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseMigration(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("=== [DatabaseMigration] Đang kiểm tra và cập nhật kiểu cột hình ảnh sang LONGTEXT... ===");

        // Danh sách các cột cần migrate sang LONGTEXT
        String[][] columnsToMigrate = {
            {"products",         "thumbnail"},
            {"users",            "image_url"},
            {"customers",        "image_url"},
            {"blogs",            "thumbnail"},
            {"blogs",            "image_url"},
            {"banners",          "image_url"},
            {"category_products","image_url"},
            {"category_blogs",   "image_url"},
            {"product_images",   "image_url"},
        };

        for (String[] pair : columnsToMigrate) {
            String tableName = pair[0];
            String columnName = pair[1];
            try {
                // Kiểm tra kiểu dữ liệu hiện tại của cột
                String currentType = jdbcTemplate.queryForObject(
                    "SELECT DATA_TYPE FROM information_schema.COLUMNS " +
                    "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?",
                    String.class, tableName, columnName
                );

                if (currentType != null && !currentType.equalsIgnoreCase("longtext")) {
                    // Thực thi ALTER TABLE để chuyển sang LONGTEXT
                    String alterSql = String.format(
                        "ALTER TABLE `%s` MODIFY COLUMN `%s` LONGTEXT", tableName, columnName
                    );
                    jdbcTemplate.execute(alterSql);
                    System.out.println("  ✓ ALTER TABLE " + tableName + "." + columnName + 
                                       " : " + currentType.toUpperCase() + " -> LONGTEXT");
                } else {
                    System.out.println("  ✓ " + tableName + "." + columnName + " đã là LONGTEXT (bỏ qua)");
                }
            } catch (Exception e) {
                // Bỏ qua nếu bảng/cột chưa tồn tại (sẽ được Hibernate tạo mới)
                System.out.println("  ⚠ Bỏ qua " + tableName + "." + columnName + 
                                   " (chưa tồn tại hoặc lỗi: " + e.getMessage() + ")");
            }
        }

        System.out.println("=== [DatabaseMigration] Hoàn tất kiểm tra cột hình ảnh. ===");
    }
}

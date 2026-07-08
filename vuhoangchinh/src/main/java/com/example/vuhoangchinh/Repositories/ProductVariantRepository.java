package com.example.vuhoangchinh.Repositories;

// Import thực thể ProductVariant phục vụ việc truy xuất dữ liệu
import com.example.vuhoangchinh.Entities.ProductVariant;

// Import các interface của Spring Data JPA
import org.springframework.data.jpa.repository.JpaRepository; // Cung cấp các hàm CRUD cơ bản
import org.springframework.data.domain.Page; // Hỗ trợ phân trang dữ liệu trả về
import org.springframework.data.domain.Pageable; // Tham số chứa thông tin phân trang và sắp xếp
import org.springframework.stereotype.Repository; // Đánh dấu đây là một Bean Repository của Spring

// Import các thư viện tiện ích của Java
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * @Repository: Khai báo interface này là một Repository kết nối cơ sở dữ liệu.
 * Spring Data JPA sẽ tự động tạo lớp triển khai (implementation) chạy trên môi trường MySQL.
 * JpaRepository<ProductVariant, Long>: Thao tác trên bảng product_variants với kiểu dữ liệu khóa chính là Long.
 */
@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    /**
     * Tìm kiếm danh sách tất cả các biến thể thuộc một sản phẩm cụ thể (không phân trang).
     * @param productId ID của sản phẩm cần tìm biến thể
     * @return Danh sách các biến thể tương ứng
     */
    List<ProductVariant> findByProductId(Long productId);

    /**
     * Tìm kiếm và phân trang danh sách các biến thể thuộc một sản phẩm cụ thể.
     * Hỗ trợ đắc lực khi một sản phẩm có quá nhiều biến thể cần chia trang ở giao diện quản trị.
     * @param productId ID của sản phẩm cần tìm
     * @param pageable Đối tượng cấu hình phân trang (trang hiện tại, kích thước trang, sắp xếp)
     * @return Một trang chứa danh sách các biến thể
     */
    Page<ProductVariant> findByProductId(Long productId, Pageable pageable);

    /**
     * Truy vấn tìm kiếm một biến thể sản phẩm thông qua mã SKU duy nhất.
     * @param sku Mã SKU cần tìm kiếm
     * @return Một Optional chứa biến thể nếu tồn tại, hoặc rỗng nếu không tìm thấy
     */
    Optional<ProductVariant> findBySku(String sku);

    /**
     * Truy vấn kiểm tra trùng lặp cấu hình Size và Color của một sản phẩm.
     */
    Optional<ProductVariant> findByProductIdAndSizeAndColor(Long productId, String size, String color);

    /**
     * Truy vấn trừ tồn kho ở cấp độ cơ sở dữ liệu (Atomic Update).
     * Ngăn chặn hoàn toàn Race Condition khi nhiều khách hàng cùng tranh mua một mặt hàng cuối cùng.
     * @param variantId ID của biến thể
     * @param quantity Số lượng cần trừ
     * @return Số bản ghi được cập nhật thành công (sẽ là 0 nếu tồn kho hiện tại không đủ)
     */
    @Modifying
    @Query("UPDATE ProductVariant v SET v.stockQuantity = v.stockQuantity - :quantity WHERE v.id = :variantId AND v.stockQuantity >= :quantity")
    int decrementStockAtomic(@Param("variantId") Long variantId, @Param("quantity") Integer quantity);
}

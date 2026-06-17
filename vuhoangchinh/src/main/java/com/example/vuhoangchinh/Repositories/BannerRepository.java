package com.example.vuhoangchinh.Repositories;

// Import thực thể Banner phục vụ kết nối cơ sở dữ liệu
import com.example.vuhoangchinh.Entities.Banner;

// Import các interface của Spring Data JPA
import org.springframework.data.jpa.repository.JpaRepository; // Cung cấp các hàm CRUD cơ bản
import org.springframework.stereotype.Repository; // Đánh dấu là một Spring Repository Bean

// Import kiểu dữ liệu danh sách Java
import java.util.List;

/**
 * @Repository: Khai báo interface này là một Repository kết nối cơ sở dữ liệu.
 * Spring Data JPA sẽ tự động tạo lớp triển khai (implementation) chạy trên môi trường MySQL.
 * JpaRepository<Banner, Long>: Thao tác trên bảng banners với kiểu dữ liệu khóa chính là Long.
 */
@Repository
public interface BannerRepository extends JpaRepository<Banner, Long> {

    /**
     * Tìm danh sách các banner quảng cáo theo trạng thái và sắp xếp theo thứ tự hiển thị tăng dần.
     * Thường sử dụng để hiển thị Slide Banner ở trang chủ Website bán hàng.
     * @param status Trạng thái của banner (Ví dụ: 1 là đang hiện, 0 là ẩn)
     * @return Danh sách các banner tương ứng sắp xếp theo vị trí hiển thị tăng dần
     */
    List<Banner> findByStatusOrderByPositionAsc(Integer status);
}

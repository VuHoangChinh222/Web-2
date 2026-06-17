package com.example.vuhoangchinh.Controllers;

// Import thực thể và repository của Banner phục vụ kết nối dữ liệu
import com.example.vuhoangchinh.Entities.Banner; // Thực thể Banner
import com.example.vuhoangchinh.Repositories.BannerRepository; // Repository tương tác bảng banners

// Import các annotation của Spring Framework phục vụ xây dựng API RESTful
import org.springframework.beans.factory.annotation.Autowired; // Tự động inject bean phụ thuộc
import org.springframework.http.ResponseEntity; // Đại diện cho phản hồi HTTP kèm status code
import org.springframework.web.bind.annotation.*; // Các annotations định tuyến API RESTful

// Import thư viện validation bẫy lỗi đầu vào
import jakarta.validation.Valid;

// Import các kiểu cấu trúc dữ liệu Java
import java.util.List;

/**
 * @RestController: Khai báo lớp này là một REST Controller, trả về dữ liệu JSON tự động.
 * @RequestMapping("/api/banners"): Định nghĩa tiền tố chung cho các API quản lý Banner quảng cáo.
 * @CrossOrigin(origins = "*"): Cho phép mọi domain gọi API (CORS).
 */
@RestController
@RequestMapping("/api/banners")
@CrossOrigin(origins = "*")
public class BannerController {

    // Tiêm repository của Banner để kết nối CSDL
    @Autowired
    private BannerRepository bannerRepository;

    /**
     * API Lấy toàn bộ danh sách banner quảng cáo hiện có trong hệ thống (không phân trang, trả về list đơn giản).
     * GET /api/banners
     */
    @GetMapping
    public List<Banner> getAllBanners() {
        return bannerRepository.findAll();
    }

    /**
     * API Lấy danh sách banner đang hoạt động (status = 1) và được sắp xếp theo thứ tự hiển thị position tăng dần.
     * Thường dùng để gọi trực tiếp hiển thị lên Slide trên trang chủ bán hàng Frontend.
     * GET /api/banners/active
     */
    @GetMapping("/active")
    public List<Banner> getActiveBanners() {
        return bannerRepository.findByStatusOrderByPositionAsc(1);
    }

    /**
     * API Lấy chi tiết một banner quảng cáo theo ID.
     * GET /api/banners/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getBannerById(@PathVariable Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner not found with id " + id));
        return ResponseEntity.ok(banner);
    }

    /**
     * API Thêm mới một banner quảng cáo (POST).
     * POST /api/banners
     */
    @PostMapping
    public ResponseEntity<?> createBanner(@Valid @RequestBody Banner banner) {
        // Tự động gán vị trí hiển thị cuối cùng nếu người dùng không điền vị trí
        if (banner.getPosition() == null || banner.getPosition() < 1) {
            banner.setPosition(1);
        }
        
        // Lưu banner mới vào Database
        Banner savedBanner = bannerRepository.save(banner);
        return ResponseEntity.ok(savedBanner);
    }

    /**
     * API Cập nhật thông tin chi tiết một banner quảng cáo theo ID.
     * PUT /api/banners/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBanner(@PathVariable Long id, @Valid @RequestBody Banner bannerDetails) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner not found with id " + id));

        // Cập nhật các trường thông tin mới
        banner.setTitle(bannerDetails.getTitle());
        banner.setImageUrl(bannerDetails.getImageUrl().trim());
        
        if (bannerDetails.getPosition() != null && bannerDetails.getPosition() >= 1) {
            banner.setPosition(bannerDetails.getPosition());
        }
        
        if (bannerDetails.getStatus() != null) {
            banner.setStatus(bannerDetails.getStatus());
        }

        // Lưu bản cập nhật vào CSDL
        Banner updatedBanner = bannerRepository.save(banner);
        return ResponseEntity.ok(updatedBanner);
    }

    /**
     * API Xóa banner quảng cáo khỏi hệ thống theo ID (DELETE).
     * DELETE /api/banners/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBanner(@PathVariable Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner not found with id " + id));
        
        bannerRepository.delete(banner);
        return ResponseEntity.ok("Xóa banner quảng cáo thành công");
    }
}

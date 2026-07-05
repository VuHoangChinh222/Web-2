package com.example.vuhoangchinh.Config;

import com.example.vuhoangchinh.Entities.*;
import com.example.vuhoangchinh.Repositories.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final CategoryProductRepository categoryProductRepository;
    private final ProductRepository productRepository;
    private final CategoryBlogRepository categoryBlogRepository;
    private final BlogRepository blogRepository;
    private final BannerRepository bannerRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(RoleRepository roleRepository,
                      UserRepository userRepository,
                      CategoryProductRepository categoryProductRepository,
                      ProductRepository productRepository,
                      CategoryBlogRepository categoryBlogRepository,
                      BlogRepository blogRepository,
                      BannerRepository bannerRepository,
                      PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.categoryProductRepository = categoryProductRepository;
        this.productRepository = productRepository;
        this.categoryBlogRepository = categoryBlogRepository;
        this.blogRepository = blogRepository;
        this.bannerRepository = bannerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Roles
        Role adminRole = roleRepository.findByName("ROLE_ADMIN").orElse(null);
        if (adminRole == null) {
            Role r = new Role();
            r.setName("ROLE_ADMIN");
            r.setDescription("Administrator Role");
            r.setPermissions(new java.util.ArrayList<>(List.of(
                "dashboard_view",
                "manage_product",
                "manage_categoryproduct",
                "manage_productvariant",
                "manage_productimage",
                "manage_order",
                "manage_orderdetail",
                "manage_customer",
                "manage_categoryblog",
                "manage_blog",
                "manage_banner",
                "manage_user",
                "manage_role"
            )));
            adminRole = roleRepository.save(r);
        } else if (adminRole.getPermissions() == null || adminRole.getPermissions().isEmpty()) {
            adminRole.setPermissions(new java.util.ArrayList<>(List.of(
                "dashboard_view",
                "manage_product",
                "manage_categoryproduct",
                "manage_productvariant",
                "manage_productimage",
                "manage_order",
                "manage_orderdetail",
                "manage_customer",
                "manage_categoryblog",
                "manage_blog",
                "manage_banner",
                "manage_user",
                "manage_role"
            )));
            adminRole = roleRepository.save(adminRole);
        }

        Role editorRole = roleRepository.findByName("ROLE_EDITOR").orElse(null);
        if (editorRole == null) {
            Role r = new Role();
            r.setName("ROLE_EDITOR");
            r.setDescription("Editor Role");
            r.setPermissions(new java.util.ArrayList<>(List.of(
                "dashboard_view",
                "manage_product",
                "manage_categoryproduct",
                "manage_blog",
                "manage_categoryblog",
                "manage_banner"
            )));
            editorRole = roleRepository.save(r);
        } else if (editorRole.getPermissions() == null || editorRole.getPermissions().isEmpty()) {
            editorRole.setPermissions(new java.util.ArrayList<>(List.of(
                "dashboard_view",
                "manage_product",
                "manage_categoryproduct",
                "manage_blog",
                "manage_categoryblog",
                "manage_banner"
            )));
            editorRole = roleRepository.save(editorRole);
        }

        Role employeeRole = roleRepository.findByName("ROLE_EMPLOYEE").orElse(null);
        if (employeeRole == null) {
            Role r = new Role();
            r.setName("ROLE_EMPLOYEE");
            r.setDescription("Employee Role");
            r.setPermissions(new java.util.ArrayList<>(List.of(
                "dashboard_view",
                "manage_order",
                "manage_orderdetail",
                "manage_customer"
            )));
            employeeRole = roleRepository.save(r);
        } else if (employeeRole.getPermissions() == null || employeeRole.getPermissions().isEmpty()) {
            employeeRole.setPermissions(new java.util.ArrayList<>(List.of(
                "dashboard_view",
                "manage_order",
                "manage_orderdetail",
                "manage_customer"
            )));
            employeeRole = roleRepository.save(employeeRole);
        }

/// Các tài khoản test nếu muốn dùng thì chạy
        // // 2. Seed Users
        // if (userRepository.findByUsername("admin_duong").isEmpty()) {
        //     User user = new User();
        //     user.setUsername("admin_duong");
        //     user.setPassword(passwordEncoder.encode("chinh123"));
        //     user.setFullName("Trịnh Tùng Dương");
        //     user.setEmail("duong@example.com");
        //     user.setPhone("0912345678");
        //     user.setImageUrl("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80");
        //     user.setStatus(1);
        //     user.setRole(adminRole);
        //     userRepository.save(user);
        // }

        // if (userRepository.findByUsername("editor_minh").isEmpty()) {
        //     User user = new User();
        //     user.setUsername("editor_minh");
        //     user.setPassword(passwordEncoder.encode("chinh123"));
        //     user.setFullName("Nguyễn Hoàng Minh");
        //     user.setEmail("minh@example.com");
        //     user.setPhone("0987654321");
        //     user.setImageUrl("https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=150&q=80");
        //     user.setStatus(1);
        //     user.setRole(editorRole);
        //     userRepository.save(user);
        // }

        // if (userRepository.findByUsername("sales_lan").isEmpty()) {
        //     User user = new User();
        //     user.setUsername("sales_lan");
        //     user.setPassword(passwordEncoder.encode("chinh123"));
        //     user.setFullName("Lê Thị Lan");
        //     user.setEmail("lan@example.com");
        //     user.setPhone("0901234567");
        //     user.setImageUrl("https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80");
        //     user.setStatus(1);
        //     user.setRole(employeeRole);
        //     userRepository.save(user);
        // }

        // if (userRepository.findByUsername("admin").isEmpty()) {
        //     User user = new User();
        //     user.setUsername("admin");
        //     user.setPassword(passwordEncoder.encode("chinh123"));
        //     user.setFullName("Vũ Hoàng Chính");
        //     user.setEmail("chinh@example.com");
        //     user.setPhone("0922334455");
        //     user.setImageUrl("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80");
        //     user.setStatus(1);
        //     user.setRole(adminRole);
        //     userRepository.save(user);
        // }

        // 3. Seed Category Products
        CategoryProduct giay = null;
        CategoryProduct ao = null;
        CategoryProduct quan = null;
        CategoryProduct vo = null;

        if (categoryProductRepository.count() == 0) {
            giay = categoryProductRepository.save(new CategoryProduct(null, "Giày bóng rổ", "giay-bong-ro", "Các dòng giày bóng rổ cao cấp chính hãng hỗ trợ bật nảy giảm chấn thương", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80", 1));
            ao = categoryProductRepository.save(new CategoryProduct(null, "Áo", "ao-bong-ro", "Áo thi đấu thoáng khí siêu nhẹ co giãn", "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=400&q=80", 1));
            quan = categoryProductRepository.save(new CategoryProduct(null, "Quần", "quan-bong-ro", "Quần short bóng rổ thể thao rộng rãi thoải mái di chuyển", "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=400&q=80", 1));
            vo = categoryProductRepository.save(new CategoryProduct(null, "Vớ", "vo-bong-ro", "Vớ bóng rổ dày dặn êm chân bảo vệ cổ chân", "https://images.unsplash.com/photo-1582966772680-860e372bb558?auto=format&fit=crop&w=400&q=80", 1));
        } else {
            List<CategoryProduct> cats = categoryProductRepository.findAll();
            for (CategoryProduct cat : cats) {
                if (cat.getSlug().equals("giay-bong-ro")) giay = cat;
                else if (cat.getSlug().equals("ao-bong-ro")) ao = cat;
                else if (cat.getSlug().equals("quan-bong-ro")) quan = cat;
                else if (cat.getSlug().equals("vo-bong-ro")) vo = cat;
            }
        }

        // 4. Seed Products
        if (productRepository.count() == 0 && giay != null) {
            Product p1 = new Product();
            p1.setCategory(giay);
            p1.setName("Ignite Red X");
            p1.setSlug("ignite-red-x");
            p1.setShortDescription("Đôi giày bứt phá mọi giới hạn tốc độ.");
            p1.setDescription("Đế đệm bật nảy cực cao, chất liệu lưới siêu nhẹ ôm sát cổ chân hỗ trợ bứt tốc và xoay chuyển hướng nhanh chóng.");
            p1.setThumbnail("https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80");
            p1.setBasePrice(new BigDecimal("3500000.00"));
            p1.setDiscountPrice(new BigDecimal("3200000.00"));
            p1.setStatus(1);
            productRepository.save(p1);

            Product p2 = new Product();
            p2.setCategory(giay);
            p2.setName("Velocity HX-1 Neo");
            p2.setSlug("velocity-hx-1-neo");
            p2.setShortDescription("Trang bị công nghệ viền Neon ẩn phản quang.");
            p2.setDescription("Chất liệu carbon siêu nhẹ giúp hấp thụ tối đa phản lực từ sàn đấu, giảm nguy cơ chấn thương gót chân.");
            p2.setThumbnail("https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=400&q=80");
            p2.setBasePrice(new BigDecimal("4200000.00"));
            p2.setDiscountPrice(new BigDecimal("3900000.00"));
            p2.setStatus(1);
            productRepository.save(p2);

            Product p3 = new Product();
            p3.setCategory(ao);
            p3.setName("Nights Owl Jersey");
            p3.setSlug("nights-owl-jersey");
            p3.setShortDescription("Áo đấu bóng rổ phiên bản giới hạn.");
            p3.setDescription("Công nghệ dệt 3D thoáng khí đa điểm giúp thấm hút mồ hôi cực tốt. Họa tiết cú đêm cá tính.");
            p3.setThumbnail("https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=400&q=80");
            p3.setBasePrice(new BigDecimal("1200000.00"));
            p3.setDiscountPrice(new BigDecimal("1100000.00"));
            p3.setStatus(1);
            productRepository.save(p3);

            Product p4 = new Product();
            p4.setCategory(quan);
            p4.setName("Elite Performance Shorts");
            p4.setSlug("elite-performance-shorts");
            p4.setShortDescription("Quần short siêu nhẹ co giãn tối đa.");
            p4.setDescription("Hệ thống thoát mồ hôi hai bên sườn quần kết hợp thắt lưng co giãn giữ chặt form khi di chuyển nhanh.");
            p4.setThumbnail("https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=400&q=80");
            p4.setBasePrice(new BigDecimal("850000.00"));
            p4.setDiscountPrice(new BigDecimal("850000.00"));
            p4.setStatus(1);
            productRepository.save(p4);

            Product p5 = new Product();
            p5.setCategory(vo);
            p5.setName("Nike Classic Elite Socks");
            p5.setSlug("nike-classic-elite-socks");
            p5.setShortDescription("Vớ bóng rổ dày dặn ôm chân.");
            p5.setDescription("Thiết kế phân bổ đệm ở gót và đầu ngón chân giúp giảm xẹp và chống trượt chân trong giày.");
            p5.setThumbnail("https://images.unsplash.com/photo-1582966772680-860e372bb558?auto=format&fit=crop&w=400&q=80");
            p5.setBasePrice(new BigDecimal("350000.00"));
            p5.setDiscountPrice(new BigDecimal("350000.00"));
            p5.setStatus(1);
            productRepository.save(p5);
        }

        // 5. Seed Category Blogs
        CategoryBlog cb = null;
        if (categoryBlogRepository.count() == 0) {
            cb = categoryBlogRepository.save(new CategoryBlog(null, "Xu hướng bóng rổ", "xu-huong-bong-ro", "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=400&q=80"));
            categoryBlogRepository.save(new CategoryBlog(null, "Kinh nghiệm tập luyện", "kinh-nghiem-tap-luyen", "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80"));
        } else {
            List<CategoryBlog> cbs = categoryBlogRepository.findAll();
            if (!cbs.isEmpty()) {
                cb = cbs.get(0);
            }
        }

        // 6. Seed Blogs
        if (blogRepository.count() == 0 && cb != null) {
            User adminUser = userRepository.findByUsername("admin").orElse(null);
            if (adminUser != null) {
                Blog b1 = new Blog();
                b1.setCategoryBlog(cb);
                b1.setAuthor(adminUser);
                b1.setTitle("Top 5 đôi giày bóng rổ đáng mua nhất năm 2026");
                b1.setSlug("top-5-doi-giay-bong-ro-dang-mua-nhat-nam-2026");
                b1.setSummary("Tổng hợp những mẫu giày bóng rổ có hiệu năng và thiết kế đỉnh cao được yêu thích nhất.");
                b1.setContent("<p>Bóng rổ là bộ môn đòi hỏi tốc độ và khả năng thăng bằng cao. Dưới đây là 5 mẫu giày hỗ trợ tốt nhất cho bàn chân của bạn...</p>");
                b1.setThumbnail("https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80");
                b1.setImageUrl("https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80");
                b1.setStatus(1);
                blogRepository.save(b1);

                Blog b2 = new Blog();
                b2.setCategoryBlog(cb);
                b2.setAuthor(adminUser);
                b2.setTitle("Cách chọn size giày bóng rổ vừa vặn và an toàn");
                b2.setSlug("cach-chon-size-giay-bong-ro-vua-van-va-an-toan");
                b2.setSummary("Chọn giày bóng rổ đúng kích cỡ giúp bảo vệ mắt cá chân và tối ưu hóa lực nhảy.");
                b2.setContent("<p>Nếu mang giày quá chật hoặc quá rộng, bạn sẽ rất dễ gặp chấn thương lật sơ mi. Hãy tham khảo bảng đo size chuẩn sau...</p>");
                b2.setThumbnail("https://images.unsplash.com/photo-1519766304817-4f37bda74a27?auto=format&fit=crop&w=800&q=80");
                b2.setImageUrl("https://images.unsplash.com/photo-1519766304817-4f37bda74a27?auto=format&fit=crop&w=800&q=80");
                b2.setStatus(1);
                blogRepository.save(b2);
            }
        }

        // 7. Seed Banners
        if (bannerRepository.count() == 0) {
            bannerRepository.save(new Banner(null, "Khuyến mãi chào hè 2026", "https://images.unsplash.com/photo-1519766304817-4f37bda74a27?auto=format&fit=crop&w=1200&q=80", 1, 1));
            bannerRepository.save(new Banner(null, "Bộ sưu tập giày mới nhất", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80", 2, 1));
        }
    }
}

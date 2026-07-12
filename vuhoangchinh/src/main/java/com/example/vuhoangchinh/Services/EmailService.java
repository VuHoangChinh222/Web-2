package com.example.vuhoangchinh.Services;

import com.example.vuhoangchinh.Entities.Customer;
import com.example.vuhoangchinh.Entities.Order;
import com.example.vuhoangchinh.Entities.OrderDetail;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.List;
import java.util.Locale;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    private static final String SENDER_NAME = "Chinh Hoops Support";

    /**
     * Gửi email xác nhận đơn hàng đẹp mắt với định dạng HTML.
     */
    @Async
    public void sendOrderConfirmationEmail(Customer customer, Order order, List<OrderDetail> details) {
        String recipientEmail = (customer != null) ? customer.getEmail() : null;
        if (recipientEmail == null && order.getCustomer() != null) {
            recipientEmail = order.getCustomer().getEmail();
        }
        
        // Nếu không có địa chỉ email hợp lệ thì không gửi
        if (recipientEmail == null || !recipientEmail.contains("@")) {
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(senderEmail, SENDER_NAME);
            helper.setTo(recipientEmail);
            helper.setSubject("[Chinh Hoops] Xác nhận đơn hàng thành công - Mã đơn: " + order.getOrderCode());

            // Định dạng tiền tệ VND
            NumberFormat vndFormat = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));

            // Tạo danh sách sản phẩm dưới dạng bảng HTML
            StringBuilder itemsTable = new StringBuilder();
            itemsTable.append("<table style='width: 100%; border-collapse: collapse; margin-top: 15px;'>");
            itemsTable.append("<thead style='background-color: #f97316; color: white;'>");
            itemsTable.append("<tr>");
            itemsTable.append("<th style='padding: 10px; border: 1px solid #ddd; text-align: center;'>Hình ảnh</th>");
            itemsTable.append("<th style='padding: 10px; border: 1px solid #ddd; text-align: left;'>Sản phẩm</th>");
            itemsTable.append("<th style='padding: 10px; border: 1px solid #ddd; text-align: center;'>Kích cỡ</th>");
            itemsTable.append("<th style='padding: 10px; border: 1px solid #ddd; text-align: center;'>Màu sắc</th>");
            itemsTable.append("<th style='padding: 10px; border: 1px solid #ddd; text-align: right;'>Đơn giá</th>");
            itemsTable.append("<th style='padding: 10px; border: 1px solid #ddd; text-align: center;'>Số lượng</th>");
            itemsTable.append("<th style='padding: 10px; border: 1px solid #ddd; text-align: right;'>Thành tiền</th>");
            itemsTable.append("</tr>");
            itemsTable.append("</thead>");
            itemsTable.append("<tbody>");

            int imgCounter = 1;
            for (OrderDetail detail : details) {
                String productName = detail.getProductVariant().getProduct().getName();
                String size = detail.getProductVariant().getSize();
                String color = detail.getProductVariant().getColor();
                String rawImgUrl = detail.getProductVariant().getImageUrl();
                
                String imgTagSrc;
                // Nếu là ảnh nội bộ (base64 hoặc đường dẫn cục bộ /image/...) thì dùng CID
                if (rawImgUrl != null && (rawImgUrl.startsWith("data:image/") || rawImgUrl.startsWith("/image/") || rawImgUrl.startsWith("image/"))) {
                    imgTagSrc = "cid:img_" + imgCounter;
                } else {
                    imgTagSrc = resolveAbsoluteImageUrl(rawImgUrl);
                }
                
                BigDecimal price = detail.getPrice();
                int qty = detail.getQuantity();
                BigDecimal subTotal = price.multiply(BigDecimal.valueOf(qty));

                itemsTable.append("<tr>");
                itemsTable.append("<td style='padding: 10px; border: 1px solid #ddd; text-align: center;'>")
                          .append("<img src='").append(imgTagSrc).append("' alt='").append(productName)
                          .append("' style='width: 50px; height: 50px; object-fit: cover; border-radius: 4px;' /></td>");
                itemsTable.append("<td style='padding: 10px; border: 1px solid #ddd;'>").append(productName).append("</td>");
                itemsTable.append("<td style='padding: 10px; border: 1px solid #ddd; text-align: center;'>").append(size).append("</td>");
                itemsTable.append("<td style='padding: 10px; border: 1px solid #ddd; text-align: center;'>").append(color).append("</td>");
                itemsTable.append("<td style='padding: 10px; border: 1px solid #ddd; text-align: right;'>").append(vndFormat.format(price)).append("</td>");
                itemsTable.append("<td style='padding: 10px; border: 1px solid #ddd; text-align: center;'>").append(qty).append("</td>");
                itemsTable.append("<td style='padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: bold;'>").append(vndFormat.format(subTotal)).append("</td>");
                itemsTable.append("</tr>");
                
                imgCounter++;
            }

            itemsTable.append("</tbody>");
            itemsTable.append("</table>");

            // Tạo nội dung HTML cho toàn bộ email
            String htmlContent = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f97316; border-radius: 8px;'>"
                    + "  <div style='text-align: center; margin-bottom: 20px;'>"
                    + "    <h2 style='color: #f97316; margin: 0;'>CẢM ƠN BẠN ĐÃ MUA HÀNG!</h2>"
                    + "    <p style='color: #666; margin-top: 5px;'>Đơn hàng của bạn đã được tiếp nhận và đang xử lý.</p>"
                    + "  </div>"
                    + "  <hr style='border: 0; border-top: 1px solid #eee; margin: 20px 0;'>"
                    + "  <h3 style='color: #333;'>Mã đơn hàng: <span style='color: #f97316;'>" + order.getOrderCode() + "</span></h3>"
                    + "  <p style='margin: 5px 0;'><strong>Ngày đặt hàng:</strong> " + order.getCreatedAt() + "</p>"
                    + "  <p style='margin: 5px 0;'><strong>Phương thức thanh toán:</strong> " + order.getPaymentMethod() + "</p>"
                    + "  <p style='margin: 5px 0;'><strong>Trạng thái thanh toán:</strong> " + order.getPaymentStatus() + "</p>"
                    + "  <hr style='border: 0; border-top: 1px solid #eee; margin: 20px 0;'>"
                    + "  <h3 style='color: #333;'>Thông tin giao hàng:</h3>"
                    + "  <p style='margin: 5px 0;'><strong>Người nhận:</strong> " + order.getRecipientName() + "</p>"
                    + "  <p style='margin: 5px 0;'><strong>Số điện thoại:</strong> " + order.getRecipientPhone() + "</p>"
                    + "  <p style='margin: 5px 0;'><strong>Địa chỉ:</strong> " + order.getShippingAddress() + "</p>"
                    + "  " + (order.getNote() != null && !order.getNote().isEmpty() ? "<p style='margin: 5px 0;'><strong>Ghi chú:</strong> " + order.getNote() + "</p>" : "")
                    + "  <hr style='border: 0; border-top: 1px solid #eee; margin: 20px 0;'>"
                    + "  <h3 style='color: #333;'>Chi tiết sản phẩm:</h3>"
                    + "  " + itemsTable.toString()
                    + "  <div style='margin-top: 20px; text-align: right; font-size: 1.1em;'>"
                    + "    <p style='margin: 5px 0;'><strong>Tiền hàng:</strong> " + vndFormat.format(order.getTotalPrice()) + "</p>"
                    + "    <p style='margin: 5px 0;'><strong>Phí vận chuyển:</strong> " + vndFormat.format(order.getShippingFee()) + "</p>"
                    + "    <p style='margin: 5px 0; font-size: 1.2em; color: #f97316;'><strong>Tổng thanh toán:</strong> " + vndFormat.format(order.getGrandTotal()) + "</p>"
                    + "  </div>"
                    + "  <hr style='border: 0; border-top: 1px solid #eee; margin: 20px 0;'>"
                    + "  <div style='text-align: center; color: #888; font-size: 0.9em;'>"
                    + "    <p style='margin: 5px 0;'>Mọi thắc mắc xin vui lòng liên hệ hotline: <strong>0797407502</strong> hoặc reply email này.</p>"
                    + "    <p style='margin: 5px 0;'><strong>Chinh Hoops - Nâng tầm bước chân của bạn.</strong></p>"
                    + "  </div>"
                    + "</div>";

            helper.setText(htmlContent, true);

            // Đính kèm các ảnh inline CID tương ứng
            int attachCounter = 1;
            for (OrderDetail detail : details) {
                String rawImgUrl = detail.getProductVariant().getImageUrl();
                if (rawImgUrl != null) {
                    String cidName = "img_" + attachCounter;
                    if (rawImgUrl.startsWith("data:image/")) {
                        try {
                            String[] parts = rawImgUrl.split(",");
                            if (parts.length == 2) {
                                String header = parts[0];
                                String base64Data = parts[1];
                                String contentType = header.substring(header.indexOf(":") + 1, header.indexOf(";"));
                                byte[] imageBytes = java.util.Base64.getDecoder().decode(base64Data.trim());
                                helper.addInline(cidName, new org.springframework.core.io.ByteArrayResource(imageBytes), contentType);
                            }
                        } catch (Exception ex) {
                            System.err.println("Lỗi khi đính kèm ảnh base64 CID: " + ex.getMessage());
                        }
                    } else if (rawImgUrl.startsWith("/image/") || rawImgUrl.startsWith("image/")) {
                        try {
                            String cleanPath = rawImgUrl.startsWith("/") ? rawImgUrl.substring(1) : rawImgUrl;
                            String userDir = System.getProperty("user.dir");
                            java.nio.file.Path imagePath = java.nio.file.Paths.get(userDir, "src", "main", "resources", "static", cleanPath);
                            
                            // Hỗ trợ nếu chạy từ thư mục gốc của workspace
                            if (java.nio.file.Files.exists(java.nio.file.Paths.get(userDir, "vuhoangchinh"))) {
                                imagePath = java.nio.file.Paths.get(userDir, "vuhoangchinh", "src", "main", "resources", "static", cleanPath);
                            }
                            
                            if (java.nio.file.Files.exists(imagePath)) {
                                byte[] imageBytes = java.nio.file.Files.readAllBytes(imagePath);
                                String contentType = java.nio.file.Files.probeContentType(imagePath);
                                if (contentType == null) {
                                    contentType = "image/png"; // default fallback
                                }
                                helper.addInline(cidName, new org.springframework.core.io.ByteArrayResource(imageBytes), contentType);
                            } else {
                                System.err.println("Không tìm thấy file ảnh vật lý tại: " + imagePath.toAbsolutePath());
                            }
                        } catch (Exception ex) {
                            System.err.println("Lỗi khi đính kèm ảnh vật lý CID: " + ex.getMessage());
                        }
                    }
                }
                attachCounter++;
            }
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Lỗi khi gửi email xác nhận đơn hàng: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Gửi email khôi phục mật khẩu chứa link reset mật khẩu.
     */
    @Async
    public void sendPasswordResetEmail(Customer customer, String resetLink) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(senderEmail, SENDER_NAME);
            helper.setTo(customer.getEmail());
            helper.setSubject("[Chinh Hoops] Yêu cầu khôi phục mật khẩu");

            String htmlContent = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f97316; border-radius: 8px;'>"
                    + "  <div style='text-align: center; margin-bottom: 20px;'>"
                    + "    <h2 style='color: #f97316; margin: 0;'>KHÔI PHỤC MẬT KHẨU</h2>"
                    + "    <p style='color: #666; margin-top: 5px;'>Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản của bạn.</p>"
                    + "  </div>"
                    + "  <hr style='border: 0; border-top: 1px solid #eee; margin: 20px 0;'>"
                    + "  <p>Xin chào <strong>" + customer.getFullName() + "</strong>,</p>"
                    + "  <p>Để tạo lại mật khẩu mới cho tài khoản của bạn tại Chinh Hoops, vui lòng bấm vào nút bấm bên dưới:</p>"
                    + "  <div style='text-align: center; margin: 30px 0;'>"
                    + "    <a href='" + resetLink + "' style='background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;'>Đặt lại mật khẩu</a>"
                    + "  </div>"
                    + "  <p style='color: #ff0000; font-size: 0.9em;'>* Link khôi phục mật khẩu này sẽ hết hạn sau 15 phút.</p>"
                    + "  <p>If you did not request this, please ignore this email.</p>"
                    + "  <hr style='border: 0; border-top: 1px solid #eee; margin: 20px 0;'>"
                    + "  <div style='text-align: center; color: #888; font-size: 0.9em;'>"
                    + "    <p style='margin: 5px 0;'><strong>Chinh Hoops - Nâng tầm bước chân của bạn.</strong></p>"
                    + "  </div>"
                    + "</div>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Lỗi khi gửi email khôi phục mật khẩu: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Chuyển đổi đường dẫn ảnh tương đối thành URL tuyệt đối để hiển thị chính xác trên trình duyệt email.
     */
    private String resolveAbsoluteImageUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            return "https://via.placeholder.com/150";
        }
        if (url.startsWith("data:") || url.startsWith("http://") || url.startsWith("https://")) {
            return url;
        }
        // Base URL của Backend lưu trữ ảnh
        String baseUrl = "http://localhost:8080";
        if (url.startsWith("/")) {
            return baseUrl + url;
        } else {
            return baseUrl + "/" + url;
        }
    }
}

# TÀI LIỆU BỐI CẢNH DỰ ÁN (CONTEXT_PROJECT)

**Mục đích:** Tài liệu này đóng vai trò là "bộ nhớ ngữ cảnh" (Context) cho các Model AI (như ChatGPT, Gemini, Claude). Khi bắt đầu một phiên chat mới, chỉ cần upload hoặc copy nội dung file này vào lời nhắc đầu tiên, AI sẽ ngay lập tức hiểu toàn bộ kiến trúc, công nghệ và luồng hoạt động của dự án mà không cần phải giải thích lại từ đầu.

---

## 1. TỔNG QUAN HỆ THỐNG (SYSTEM OVERVIEW)
Đây là một hệ thống Website Thương Mại Điện Tử (E-commerce) hoàn chỉnh có tích hợp Trợ lý AI Tư vấn Bán hàng (AI Chatbot) sử dụng công nghệ RAG (Retrieval-Augmented Generation).

Dự án gốc nằm tại thư mục `E:\web2` và được chia thành **4 Microservices / Repository riêng biệt**:
1. **`vuhoangchinh` (Java Spring Boot)**: Server Backend API chính xử lý nghiệp vụ bán hàng, quản lý CSDL (MySQL).
2. **`ai_chatbot` (Python FastAPI)**: Server AI xử lý Ngôn ngữ tự nhiên, tìm kiếm Vector cục bộ (ChromaDB) và giao tiếp với Google Gemini.
3. **`backendUI` (Node.js / Vite + TailwindCSS)**: Trang giao diện quản trị (Admin Panel) dành cho chủ cửa hàng thêm/sửa/xóa sản phẩm.
4. **`frontendUI` (Node.js / Vite)**: Trang giao diện mua sắm dành cho Khách hàng và là nơi gắn khung Chatbot AI.

---

## 2. KIẾN TRÚC VÀ LUỒNG DỮ LIỆU (DATA FLOW & ARCHITECTURE)

### A. Luồng đồng bộ dữ liệu (Real-time Sync)
Hệ thống sở hữu tính năng **Đồng bộ thời gian thực** từ Backend sang AI:
- Khi Admin thao tác (Thêm/Sửa/Xóa sản phẩm) trên `backendUI`, yêu cầu được gửi tới `ProductController` của `vuhoangchinh` (Java).
- Sau khi Java lưu xuống MySQL thành công, nó sẽ âm thầm gọi `AiSyncService` (Bất đồng bộ - Async) bắn HTTP Request sang `ai_chatbot` (Python).
- Server Python nhận Request, lập tức cập nhật hoặc xóa thông tin sản phẩm đó bên trong lõi Vector Database (ChromaDB).
- Nhờ vậy, kiến thức của Chatbot luôn song hành với thực tế kho hàng mà web không bị chậm.

### B. Luồng hoạt động của Chatbot AI (RAG)
- Khách hàng nhắn tin vào Chat widget trên `frontendUI`.
- `frontendUI` gọi trực tiếp API `POST /api/ai/chat` của Server `ai_chatbot` (Python).
- Server Python lấy câu hỏi, tự động biến thành Vector và rà soát trong `ChromaDB` (Vector DB cục bộ lấy tốc độ 0.02s).
- Nó nhặt ra 3 sản phẩm phù hợp nhất, ghép vào System Prompt và ném cho mô hình `gemini-3.5-flash` của Google qua SDK `google-genai` (Sử dụng Async/Await kết hợp với `asyncio.to_thread` cho ChromaDB để xử lý hoàn toàn phi chặn và tăng tốc độ I/O).
- AI Google trả về chữ, Python dùng `StreamingResponse` nhả từng chữ cái một (Streaming) về lại cho `frontendUI` để hiển thị mượt mà như ChatGPT.

---

## 3. PHÂN TÍCH CHI TIẾT TỪNG REPOSITORY

### 3.1. Repository: `E:\web2\vuhoangchinh` (Java Backend)
- **Công nghệ**: Java 17, Spring Boot 3.5.15, Spring Data JPA, Spring Security, MySQL, JJWT, Springdoc OpenAPI (Swagger).
- **Cấu trúc Thư mục Chính**:
  - `src/main/java/com/example/vuhoangchinh/Entities/`: Chứa các thực thể Database. Trọng tâm là `Product.java` (Sản phẩm), `CategoryProduct.java` (Danh mục), `ProductVariant.java` (Biến thể tồn kho), `ProductImage.java` (Hình ảnh mô tả sản phẩm tích hợp liên kết màu sắc và sắp xếp thứ tự).
  - `.../Controllers/ProductController.java`: Nơi nhận request CRUD sản phẩm. Tích hợp phân trang (Pagination), SEO Slug generator. Gọi `AiSyncService` tại các method POST, PUT, DELETE.
  - `.../Services/AiSyncService.java`: Service sử dụng `CompletableFuture.runAsync` và `RestTemplate` để bắn HTTP (POST) gọi API đồng bộ sang Server Python (`/api/ai/sync` và `/api/ai/sync/delete`) mà không làm block luồng chính.
  - `.../Config/` & `.../Security/`: Xử lý bảo mật, xác thực Token JWT.
  - `application.properties` (hoặc `.env`): Chứa cấu hình kết nối MySQL và Server port (Thường là 8080).

### 3.2. Repository: `E:\web2\ai_chatbot` (Python AI RAG Server)
- **Công nghệ**: Python 3, FastAPI, ChromaDB (Local Vector Store), thư viện `google-genai` mới nhất (Gemini 3.5 Flash), Pydantic.
- **Cấu trúc Thư mục Chính**:
  - `main.py`: Trái tim của hệ thống AI. Khởi tạo `chromadb.PersistentClient` lưu dữ liệu ra ổ cứng tại thư mục `./chroma_data`.
    - API `POST /api/ai/sync-all-from-source`: Kéo toàn bộ danh sách sản phẩm từ Java Backend (`http://localhost:8080/api/products?size=10000`) về để học.
    - API `POST /api/ai/sync`: Lắng nghe yêu cầu cập nhật (Upsert) một sản phẩm đơn lẻ từ Java.
    - API `POST /api/ai/sync/delete`: Lắng nghe yêu cầu xóa sản phẩm khỏi bộ nhớ từ Java.
    - API `POST /api/ai/chat`: Nhận tin nhắn từ Frontend, thực hiện RAG query lấy 3 sản phẩm liên quan (tối ưu hóa phi chặn qua `asyncio.to_thread` giải phóng Event Loop) và trả về câu trả lời dưới dạng **StreamingResponse**.
  - `test.py`: File script độc lập dùng để test độ trễ (TTFT) và test kết nối API Gemini trực tiếp trên CMD/PowerShell.
  - `.env`: Chứa biến môi trường `GEMINI_API_KEY`.
  - `requirements.txt`: Danh sách thư viện Python.
  - `chroma_data/`: Thư mục hệ thống của ChromaDB tự sinh ra để lưu Vector.

### 3.3. Repository: `E:\web2\backendUI` (Admin Panel)
- **Công nghệ**: Node.js, Vite, React (hoặc Vue tùy thiết lập thực tế), TailwindCSS.
- **Chức năng chính**: 
  - Giao diện đăng nhập cho Quản trị viên (Admin).
  - Quản lý kho hàng: Lấy dữ liệu sản phẩm, thêm/sửa/xóa sản phẩm (Tất cả đều gọi HTTP sang cổng 8080 của Java).
- **Cấu trúc**:
  - `src/`: Mã nguồn giao diện Admin.
  - `tailwind.config.js` & `postcss.config.js`: Cấu hình style.

### 3.4. Repository: `E:\web2\frontendUI` (Customer Web)
- **Công nghệ**: Node.js, Vite.
- **Chức năng chính**:
  - Hiển thị danh sách sản phẩm, danh mục cho khách hàng mua sắm (Gọi sang Java cổng 8080).
  - Tích hợp một **Chatbot UI** ở góc màn hình (`ChatWidget.jsx`). Widget này gọi trực tiếp sang Server Python cổng 8000 (`/api/ai/chat`) để giao tiếp với AI. Khung chat thiết kế dạng Glassmorphic màu cam thương hiệu Chinh Hoops, định vị sát góc dưới bên phải (`bottom: 24px` khi mở rộng) và có hiệu ứng ba dấu chấm nhảy lên xuống nhịp nhàng (bouncing dots animation).

---

## 4. HƯỚNG DẪN DEV / DEPLOY & STARTUP

1. **Khởi động MySQL**: Đảm bảo DB MySQL đang chạy.
2. **Khởi động Java Backend (`vuhoangchinh`)**: Mở bằng IntelliJ/Eclipse hoặc chạy `mvnw spring-boot:run`. (Mặc định chạy ở port 8080).
3. **Khởi động AI Chatbot (`ai_chatbot`)**: 
   - Mở terminal: `cd E:\web2\ai_chatbot`
   - Kích hoạt môi trường (nếu có) và chạy: `uvicorn main:app --reload`. (Mặc định chạy ở port 8000).
4. **Cấp dữ liệu ban đầu cho AI**: Gọi API `POST http://localhost:8000/api/ai/sync-all-from-source` thông qua Postman/Swagger để Python học toàn bộ sản phẩm đang có trong Java.
5. **Khởi động Admin UI (`backendUI`)**: `npm run dev`
6. **Khởi động Frontend (`frontendUI`)**: `npm run dev`

---
*GHI CHÚ DÀNH CHO AI TRONG PHIÊN CHAT MỚI:*
- *Luôn ưu tiên sửa đổi API Logic RAG ở file `ai_chatbot/main.py`.*
- *Bất kỳ nghiệp vụ kinh doanh, thanh toán, hay CSDL (MySQL) nào phải được xử lý bên `vuhoangchinh`.*
- *Luôn đọc kỹ nội dung file này trước khi tư vấn code cho User.*

---

## 5. QUY TẮC LƯU TRỮ SCRIPT VÀ TÀI LIỆU "Đặc biệt quan trọng cấm làm sai"
1. **Thư mục lưu trữ Script**: Khi cần tạo bất kỳ script bổ trợ nào phục vụ cho việc tạo tài liệu, kiểm thử hoặc các tiến trình phụ, tất cả phải được lưu trữ trực tiếp tại thư mục `E:\asp\test\web2`.
2. **Quy trình viết Tài liệu**: Bất kỳ script nào được sử dụng để cập nhật hay sinh tài liệu `.docx` phải được lưu trữ tại `E:\asp\test\web2` để phục vụ chạy lại khi cần thiết.
3. **Khi chạy các script khởi động dự án java hoặc node**: Khi chạy xong hoặc kiểm tra xong mà không có lỗi thì hãy "kill" bỏ các port đi giùm tôi.
---

## 6. CÁC TÍNH NĂNG VÀ CẢI TIẾN MỚI HOÀN THÀNH (UPDATED & COMPLETED FEATURES)

### A. Quản lý hình ảnh và sắp xếp gallery theo màu sắc (Color-Aware Image Gallery & Sorting)
- **Backend (Spring Boot)**: 
  - Cập nhật thực thể `ProductImage` bổ sung 2 trường: `color` (`VARCHAR(50)`) để liên kết ảnh với màu biến thể, và `sortOrder` (`Integer`) để xác định thứ tự ảnh.
  - Cập nhật repository `ProductImageRepository` sử dụng phương thức truy vấn `findByProductIdOrderBySortOrderAscIdAsc` đảm bảo ảnh luôn trả về theo thứ tự đã định trước.
- **Frontend Quản trị (backendUI)**:
  - Tích hợp đồng bộ hóa trường `sortOrder` theo chỉ mục (index) của mảng ảnh khi tải lên hoặc cập nhật sản phẩm.
- **Frontend Trang chủ (frontendUI)**:
  - Trang chi tiết sản phẩm (`Detail.jsx`): Tích hợp hàm helper `getOrderedThumbnails()` để tự động lọc và đẩy các hình ảnh có màu trùng với màu biến thể đang chọn lên đầu danh sách gallery, giữ lại các hình ảnh chung hoặc màu khác ở phía sau.
  - Giao diện gallery ảnh phụ được căn giữa hoàn toàn bên dưới ảnh chính thay vì lệch trái.

### B. Đồng bộ hóa hiển thị ảnh ở Giỏ hàng và Thanh toán
- **Giỏ hàng (`Cart/Index.jsx`)** và **Trang Thanh toán (`Checkout/OrderSummary.jsx`)**:
  - Tích hợp chuẩn hóa hàm `resolveImageUrl` (từ `config.js`) để xử lý toàn bộ đường dẫn ảnh thumbnail của biến thể được chọn.
  - Đảm bảo hiển thị chính xác ảnh của biến thể màu đã chọn trong giỏ hàng và tóm tắt thanh toán, tránh gây hoang mang cho khách hàng.

### C. Đồng bộ hóa Tài liệu & Báo cáo (`.docx`)
- Đã chạy script `E:\asp\test\web2\update_docx_product_images.py` để chèn thông tin cấu trúc cột `color` và `sort_order` vào **Bảng 2.6 (Thực thể ProductImage)** trong tài liệu `VuHoangChinh-2122110380.docx`.
- Đồng thời cập nhật mô tả thực thể tại **Mục 2.2 (Sơ đồ ERD)** trong file báo cáo Word để phản ánh chính xác cấu trúc thực thể `ProductImage` hiện tại.
- Đồng bộ hóa toàn bộ nội dung báo cáo từ Chương 3 đến Chương 6 bằng cách cập nhật và chạy thành công script `update_report_v3.py`.

### D. Tích hợp AI Sales Assistant & Tối ưu hóa UI/UX Chatbot
- **Backend AI (FastAPI) & Truy xuất RAG nâng cao**:
  - Thiết lập thành công AI Sales Assistant sử dụng kiến trúc RAG kết nối ChromaDB (Vector DB cục bộ) và Google Gemini API (model `gemini-3.5-flash`).
  - Hỗ trợ CORS cho phép frontend ReactJS giao tiếp ổn định từ các origin khác nhau.
  - Tối ưu hóa tốc độ phản hồi bằng cách bọc truy vấn ChromaDB trong `asyncio.to_thread`, giúp chạy song song phi chặn (non-blocking) trên Event Loop của FastAPI.
  - **Nâng cấp RAG đa chiều (Multi-Dimensional RAG)**: Tích hợp đồng bộ chi tiết thuộc tính sản phẩm gồm giá gốc (`basePrice`), giá khuyến mãi (`discountPrice`), trạng thái sale (tính toán số tiền giảm giá kích cầu) và danh sách biến thể cụ thể (kích cỡ, màu sắc, số lượng tồn kho riêng biệt của từng size/màu).
  - **Tự động gắn nhãn Bán chạy**: Tự động truy xuất danh sách từ API `/best-sellers` của Java Backend để đánh dấu các sản phẩm bán chạy nhất (Best Seller) trong cơ sở dữ liệu tri thức của AI, giúp AI đưa ra đề xuất chính xác các mẫu hot nhất của shop.
- **Frontend Storefront (frontendUI)**:
  - Tích hợp thành công `ChatWidget.jsx` ở mức Router toàn cục trong `App.jsx`, khắc phục hoàn toàn lỗi bị che khuất hoặc đè bởi layout transform của các trang con.
  - Tinh chỉnh vị trí hiển thị: Đặt sát góc dưới bên phải (`bottom: 24px`) khi mở rộng giúp giao diện không bị lệch hay tạo khoảng trống lớn.
  - Thiết kế đồng bộ màu sắc cam thương hiệu Chinh Hoops (`#f97316`, `#ea580c`) từ bong bóng tin nhắn, nút bấm, avatar bot cho đến viền khung chat (đã tách rời hoàn toàn mã CSS sang tệp [ChatWidget.css](file:///e:/web2/frontendUI/src/assets/css/ChatWidget.css) kèm chú thích tiếng Việt).
  - Tạo hiệu ứng ba dấu chấm nhảy lên xuống (bouncing animation) sinh động khi chờ phản hồi, mang lại trải nghiệm chuyên nghiệp giống như Facebook Messenger hay iMessage.
  - **Tối ưu trải nghiệm cuộn (Auto-scroll UX)**: Khắc phục triệt để lỗi cuộn trang khi thu nhỏ và mở lại chatbot bằng cách đưa trạng thái `isOpen` vào danh sách phụ thuộc của React Effect và trì hoãn 60ms để DOM render xong trước khi cuộn, bảo đảm tự động cuộn mượt mà xuống tin nhắn gần nhất mỗi khi mở lại khung chat.

### E. Tối ưu hóa Quy trình Quản lý Sản phẩm, Phân trang và Đồng bộ Sắp xếp Storefront
- **Chuẩn hóa thông báo lỗi API sang Tiếng Anh (English-translated Error Handling)**:
  - Tích hợp bộ định dạng lỗi `formatApiError` tại tệp `Index.jsx` của `backendUI` chuyển các Exception thô của CSDL (như Data Truncation, Duplicate Slug, Price Mismatch) thành thông báo tiếng Anh rõ ràng, thân thiện với người quản trị thay vì hiển thị raw stack trace của hệ thống.
- **Mở rộng kích thước trường mô tả ngắn (Database Schema Expansion)**:
  - Chuyển đổi kiểu dữ liệu cột `short_description` trong Java Entity `Product` sang `TEXT` trên CSDL để tránh lỗi SQL Data Truncation khi lưu nội dung dài, đồng thời Hibernate tự động cập nhật cấu trúc cột tương ứng trên MySQL.
- **Phân trang trang quản trị sản phẩm CMS (CMS Product Pagination)**:
  - Bổ sung bộ điều khiển phân trang tại trang danh sách quản lý sản phẩm với kích thước 6 sản phẩm/trang ở Grid view và 10 sản phẩm/trang ở List view. Tự động reset về trang đầu khi thay đổi tìm kiếm, danh mục hoặc viewMode.
- **Đồng bộ hóa sắp xếp storefront hiển thị sản phẩm mới (Newest Products First)**:
  - Sửa đổi `productService.js` của `frontendUI` để tự động đính kèm tham số sắp xếp `sortDir=desc` trong API lấy tất cả sản phẩm (`getAllProducts`) và lấy sản phẩm theo danh mục (`getProductsByCategory`), giúp hiển thị các sản phẩm mới nhất lên hàng đầu của trang bán hàng storefront.
- **Dọn dẹp trường hình ảnh thừa của biến thể (Cleanup Deprecated Variant Image Field)**:
  - Loại bỏ hoàn toàn trường `image_url` thừa trong thực thể `ProductVariant` ở Backend (Java) và giao diện quản trị `ProductVariantModal` ở Frontend (React) do hệ thống đã áp dụng giải pháp lưu trữ hình ảnh theo màu sắc (Color-Aware Gallery) tại `ProductImage`. Việc này giúp tối ưu kích thước dữ liệu truyền tải API và đồng bộ hoàn toàn với sơ đồ thiết kế cơ sở dữ liệu (ERD).
- **Dọn dẹp cổng mạng phát triển (Process & Port Stability)**:
  - Thiết lập quy trình kiểm tra cổng `8080` trước khi chạy Server Java Backend, giải phóng các tiến trình Java/Spring Boot cũ bị treo ngầm giúp tránh lỗi xung đột cổng kết nối khi redeploy nhanh.

### F. Cải tiến Trải nghiệm mua sắm (UX), Email thông báo nâng cao và Bảo mật phiên đăng nhập
- **Nâng cấp Luồng mua hàng Storefront (Forced Variant Selection Flow)**:
  - Gỡ bỏ hoàn toàn các nút hành động nhanh "Thêm vào giỏ" và "Mua ngay" tại trang danh sách sản phẩm (`ProductCard.jsx`) do sản phẩm giày thể thao có nhiều tổ hợp thuộc tính biến thể phức tạp (Size x Màu sắc) và số lượng tồn kho khác nhau.
  - Thay thế bằng nút bấm duy nhất **"Xem chi tiết"** để định hướng người dùng vào trang chi tiết sản phẩm (`ProductDetail.jsx`), buộc khách hàng phải chủ động lựa chọn kích cỡ và màu sắc chính xác trước khi thanh toán, loại bỏ lỗi đặt nhầm sản phẩm với "Màu: Mặc định" hoặc size không phù hợp.
- **Tối ưu hóa Email xác nhận đơn hàng (Enhanced HTML Email Notifications)**:
  - Nâng cấp dịch vụ `EmailService.java` ở Backend Spring Boot để gửi thư xác nhận đặt hàng HTML có cấu trúc rõ ràng, chuyên nghiệp.
  - Tích hợp thêm các cột hiển thị: hình ảnh thu nhỏ của đôi giày, kích cỡ (Size) và màu sắc (Color) của biến thể được chọn.
  - Triển khai cơ chế đính kèm ảnh inline bằng Content-ID (CID): Đối với ảnh nội bộ dưới dạng chuỗi Base64 hoặc đường dẫn file cục bộ (như `/image/...`), hệ thống tự động giải mã và nạp byte dữ liệu vào luồng email dưới dạng tài nguyên inline `helper.addInline(...)` thay vì dùng đường dẫn URL tương đối hoặc localhost. Giải pháp này giúp hiển thị hình ảnh sản phẩm trực quan hoàn hảo trên mọi ứng dụng đọc thư (Gmail, Outlook) mà không bị trình duyệt chặn bảo mật.
- **Khắc phục lỗi xác thực và làm sạch session (Auth Failure & Token Cleanup)**:
  - Fix lỗi liên tục gửi API request gây lỗi `403 Forbidden` liên hoàn tại component `Header.jsx` when người dùng sở hữu token JWT đã hết hạn hoặc không hợp lệ.
  - Xây dựng cơ chế bắt lỗi xác thực trong Catch block của API `getCustomerById(customerId)`. Khi xảy ra lỗi 403 Forbidden hoặc 401 Unauthorized, hệ thống lập tức gọi hàm `eraseCookie('customer')` và `eraseCookie('token')` để dọn dẹp sạch sẽ các cookie phiên lỗi, đồng thời reset trạng thái Header trở về chế độ khách vãng lai, chấm dứt hoàn toàn tình trạng spam request lặp lại vô hạn gây nghẽn trình duyệt.- **Xử lý ràng buộc khi xóa sản phẩm (Referenced Product Deletion Protection)**:
  - Nâng cấp API xóa sản phẩm (`deleteProduct`) trong `ProductController.java` để kiểm tra sự tồn tại của sản phẩm trong các đơn hàng trước khi thực hiện xóa cứng. Nếu phát hiện sản phẩm đang nằm trong bất kỳ đơn hàng nào, API sẽ trả về mã `400 Bad Request` kèm theo danh sách chi tiết các đơn hàng chứa sản phẩm đó (mã đơn hàng, tên người nhận, ngày đặt).
  - Tích hợp giao diện hiển thị danh sách đơn hàng liên quan dưới dạng `GlassModal` trong trang quản lý sản phẩm (`Products/Index.jsx`) ở Admin Dashboard. Khi người quản trị click xóa sản phẩm bị lỗi ràng buộc khóa ngoại, thay vì báo lỗi hệ thống thô kệch, ứng dụng sẽ hiển thị hộp thoại cảnh báo trực quan liệt kê tất cả các đơn hàng liên quan kèm nút **"Xem chi tiết"** để chuyển hướng nhanh đến hóa đơn đó, nâng cao trải nghiệm quản trị.
- **Khắc phục lỗi hiển thị thông tin Danh mục bài viết (Blog Category Description & Assigned Items Count)**:
  - Thêm trường `description` (kiểu `TEXT` trên CSDL MySQL) vào thực thể Java `CategoryBlog` và cập nhật API `updateCategory` trong `CategoryBlogController.java` để hỗ trợ lưu trữ và hiển thị nội dung mô tả của danh mục bài viết.
  - Cải tiến logic đếm bài viết thuộc danh mục trong `Categories/Index.jsx` bằng cách so sánh chính xác thuộc tính `categoryBlog.id` trong phản hồi JSON của bài viết thô (được cấu hình bằng mối quan hệ `@ManyToOne` của JPA trên Backend). Khắc phục triệt để lỗi cột Assigned Items luôn hiển thị "0 items" dù có bài viết trực thuộc.
  - Đồng thời tích hợp cơ chế bảo vệ xóa danh mục bài viết (và danh mục sản phẩm) ở cả Frontend (Index.jsx) và Backend (CategoryBlogController/CategoryProductController). Nếu danh mục chứa bài viết hoặc sản phẩm liên quan, hệ thống sẽ chặn và trả về cảnh báo an toàn "Không thể xóa danh mục: Có bài viết/sản phẩm đang thuộc danh mục này", ngăn ngừa triệt để lỗi khóa ngoại database.
- **Khắc phục lỗi logic khi xóa đơn hàng trong CMS (CMS Order Deletion & State Sync Fix)**:
  - Fix lỗi khi thực hiện xóa đơn hàng trên giao diện `/orders` của Admin Dashboard làm mất toàn bộ danh sách đơn hàng đang hiển thị (phải tải lại trang).
  - Nguyên nhân: Việc cập nhật trạng thái `orders` không đồng bộ với danh sách `orderDetails` còn sót lại và `selectedOrderId` không được reset, dẫn đến việc modal chi tiết cố gắng render dữ liệu của đơn hàng đã xóa hoặc so sánh kiểu dữ liệu strict (string vs number) bị sai lệch.
  - Giải pháp: Cập nhật hàm `handleDeleteOrder` để đồng thời dọn dẹp các chi tiết đơn hàng tương ứng (`orderDetails`) khỏi state React, reset `selectedOrderId` về `null` và đóng modal. Thêm so sánh an toàn bằng cách chuyển đổi kiểu dữ liệu ID sang chuỗi (`String(...)`) trong logic lọc tìm kiếm (`filteredOrders`) và xác định đơn hàng đang mở (`activeOrder`), ngăn chặn triệt để tình trạng render bị crash.
- **Bổ sung trường Mật khẩu và Địa chỉ khi thêm mới Khách hàng (Customer Creation Password & Address Fields)**:
  - Fix lỗi thiếu trường nhập mật khẩu trong biểu mẫu thêm mới khách hàng ("Add New Customer Profile") tại trang quản lý khách hàng (`/customers`) của Admin Dashboard, làm cho các yêu cầu tạo mới khách hàng gửi lên Backend bị chặn bởi ràng buộc `nullable = false` (không được để trống mật khẩu) của CSDL.
  - Tích hợp thêm trường nhập Mật khẩu (chỉ bắt buộc nhập khi thêm mới khách hàng, để trống khi chỉnh sửa để giữ nguyên mật khẩu cũ) và trường nhập Địa chỉ vật lý chi tiết vào modal biểu mẫu `CustomerFormModal.jsx`, đảm bảo tài khoản khách hàng được khởi tạo thành công với mật khẩu mã hóa an toàn trên hệ thống.
- **Khắc phục lỗi lọc danh mục bài viết và lỗi hiển thị Dropdown menu (Blog Category Filtering & Dropdown UI Fix)**:
  - Fix lỗi so khớp kiểu dữ liệu strict (`===` giữa số nguyên ID của danh mục bài viết và chuỗi string lấy từ thẻ `<select>`) làm cho tính năng lọc danh mục bài viết tại giao diện `/blogs` không hiển thị bất kỳ bài viết nào khi chọn danh mục cụ thể (ví dụ: "Cách vệ sinh giày"). Khắc phục bằng cách chuyển đổi cả hai ID về dạng chuỗi (`String(...)`) trước khi so sánh.
  - Đồng thời dọn dẹp các thuộc tính CSS inline (`style={{ backgroundImage: ... }}`) và class (`appearance-none bg-no-repeat`) trên thẻ select của dropdown lọc danh mục. Sự xung đột này khiến trình duyệt render song song cả icon mũi tên tùy chỉnh lẫn icon mặc định tạo thành một chuỗi nhiều mũi tên xếp chồng chéo gây lỗi giao diện. Sau khi làm sạch, menu dropdown hoạt động mượt mà và hiển thị chính xác.
- **Tích hợp tính năng Tự động sinh Slug cho bài viết (Automatic Blog Slug Generation)**:
  - Khắc phục sự bất tiện khi viết bài mới khi người dùng bắt buộc phải nhập Slug thủ công.
  - Xây dựng tiện ích tự động chuyển đổi từ Tiêu đề bài viết (`Post Title`) thành chuỗi liên kết Slug thân thiện (loại bỏ tiếng Việt có dấu, ký tự đặc biệt, chuẩn hóa khoảng trắng thành gạch ngang và viết thường). Slug tự động điền vào ô nhập khi người dùng nhập Tiêu đề, đồng thời vẫn cho phép người dùng tùy ý ghi đè hoặc chỉnh sửa thủ công. Nếu người dùng xóa sạch trường Slug, hệ thống sẽ tự động tạo lại dựa trên Tiêu đề khi gửi biểu mẫu.
- **Tăng giới hạn Kích thước Tải lên Tập tin của Server (Multipart Upload Size Limit Increase)**:
  - Khắc phục triệt để lỗi khi người dùng tải hình ảnh sản phẩm hoặc hình nền bài viết có dung lượng lớn lên hệ thống bị server trả về lỗi `"Maximum upload size exceeded"` (do giới hạn upload mặc định của Spring Boot rất nhỏ, khoảng 1MB).
  - Cấu hình mở rộng giới hạn tải lên tối đa trong `application.properties` của server Spring Boot lên mức `50MB` bằng cách cấu hình hai thuộc tính `spring.servlet.multipart.max-file-size=50MB` và `spring.servlet.multipart.max-request-size=50MB`. Đảm bảo hệ thống tiếp nhận hình ảnh chất lượng cao một cách mượt mà và ổn định mà không bị crash hay từ chối tải lên.
- **Loại bỏ trường Liên kết Điều hướng Banner (Remove Banner Redirect Link URL)**:
  - Tiến hành rà soát thực thể Java `Banner.java` trong gói Entities và xác nhận CSDL MySQL không chứa cột redirect link (và cũng không cần thiết theo yêu cầu thiết kế mới).
  - Để đồng bộ dữ liệu chuẩn xác và dọn dẹp giao diện quản trị, đã loại bỏ hoàn toàn trường dữ liệu `link` / `linkUrl`, ô nhập liệu "Redirect Link (URL)" tại `BannerFormModal.jsx`, và các phần hiển thị cột liên kết điều hướng tại `BannerGridCard.jsx` và `BannerListItem.jsx` trên giao diện quản trị Admin Dashboard.
- **Nâng cấp Bộ lọc Sản phẩm theo Màu sắc và Kích cỡ (Color and Size Storefront Filters)**:
  - Nâng cấp API danh sách sản phẩm `/api/products` (trong `ProductController.java` và `ProductRepository.java`) để tiếp nhận thêm các tham số truy vấn tùy chọn `color` và `variantSize`.
  - Tối ưu hóa câu lệnh truy vấn JPQL bằng cách sử dụng biểu thức `EXISTS` liên kết với bảng biến thể `ProductVariant` thay vì sử dụng phép `JOIN` trực tiếp, giúp tránh được việc lặp trùng các bản ghi sản phẩm khi một sản phẩm có nhiều biến thể phù hợp.
  - Bổ sung 2 endpoint API mới tại `ProductVariantController.java` (`/api/product-variants/colors` và `/api/product-variants/sizes`) để trả về toàn bộ danh sách các màu sắc và kích cỡ hiện có trong hệ thống CSDL (được lọc chỉ lấy các biến thể đang kích hoạt `status = 1`).
  - Thiết kế và tích hợp 2 bảng lọc trực quan (Color filter badges và Size grid layout) vào thanh Sidebar bên trái của trang danh mục sản phẩm (`Index.jsx`), kèm theo hiệu ứng hover, active theo tông màu tối neon đặc trưng của Chinh Hoops.
  - Đồng bộ hóa mượt mà trạng thái lọc mới với phân trang API, tự động chuyển trang hiện tại về trang 1 khi người dùng thay đổi lựa chọn màu sắc hoặc kích cỡ. Nút "Xóa lọc" được mở rộng để tự động reset toàn bộ các bộ lọc mới này về trạng thái mặc định.
- **Lưu trữ giỏ hàng bền vững qua Refresh trang (Shopping Cart Persistence)**:
  - Khắc phục hiện tượng giỏ hàng bị xóa sạch khi người dùng tải lại trang web do giỏ hàng trước đó chỉ lưu trữ trên bộ nhớ State tạm thời của React.
  - Tích hợp lưu trữ giỏ hàng thông qua cơ chế `localStorage` của trình duyệt. Khởi tạo trạng thái `cart` ban đầu bằng cách nạp dữ liệu từ `localStorage.getItem('shopping_cart')` và tự động cập nhật bản sao đồng bộ xuống bộ nhớ qua Hook `useEffect` mỗi khi giỏ hàng thay đổi (thêm mới, thay đổi số lượng hoặc xóa sản phẩm).
- **Tự động đăng xuất khi phiên làm việc bị hết hạn hoặc Database bị reset (Session Reset and Stale Cookie Handling)**:
  - Khắc phục các lỗi hệ thống nghiêm trọng xảy ra trên trang Checkout và Header khi dữ liệu khách hàng lưu trong cookie bị lỗi thời hoặc không còn tồn tại trên cơ sở dữ liệu backend.
  - Bổ sung cơ chế tự động giải phóng session trên client (`Header.jsx`) bằng cách bắt mã trạng thái lỗi 400 Bad Request cùng với 401/403 để xóa sạch cookie của trình duyệt và tự động đưa khách hàng về trang đăng nhập.
- **Đồng bộ hình ảnh biến thể theo màu sắc trong Email và Quản lý Đơn hàng (Variant Color-Specific Order Images)**:
  - Sửa lỗi hình ảnh sản phẩm đính kèm trong email xác nhận đơn hàng và trang chi tiết đơn hàng trong quản trị (Admin Dashboard) hiển thị không đúng với ảnh màu của biến thể được chọn.
  - Thiết lập quan hệ `@OneToMany` giữa thực thể `Product` và `ProductImage` ở backend, bổ sung phương thức `getImageUrl()` trong `ProductVariant` để tự động lấy ảnh khớp màu sắc biến thể.
  - Cập nhật dịch vụ `EmailService.java` cùng với các modal chi tiết đơn hàng ở frontend (`OrderDetailModal.jsx` ở cả Admin UI và Storefront UI) để hiển thị chính xác hình ảnh màu của sản phẩm.
- **Quản lý Tồn kho & Hoàn trả Kho khi Hủy hoặc Xóa Đơn hàng (Order Restocking Logic)**:
  - Khắc phục lỗi thất thoát tồn kho khi đơn hàng bị Hủy (Cancelled) hoặc bị Xóa khỏi hệ thống.
  - Khi khách hàng đặt đơn (trạng thái Processing - 0), hệ thống sẽ trừ trực tiếp tồn kho của biến thể sản phẩm đó ngay lập tức (Atomic update) để tránh bán quá số lượng (Overselling). Tuy nhiên, nếu admin chuyển trạng thái đơn hàng sang Hủy (Cancelled - 3) hoặc Xóa hoàn toàn đơn hàng khỏi hệ thống, cơ chế Restocking sẽ tự động được kích hoạt để hoàn trả lại số lượng tồn kho tương ứng của các biến thể trong đơn hàng. Đồng thời hỗ trợ tính toán lại và trừ kho nếu khôi phục đơn hàng từ trạng thái Hủy về trạng thái hoạt động.
- **Sửa lỗi đè lớp giao diện (Stacking Context Overlap) tại trang quản lý địa chỉ**:
  - Khắc phục lỗi UI nghiêm trọng khi mở modal nhập/sửa địa chỉ giao hàng (`/addresses`), nơi modal bị thanh Menu Header (navbar) che mất một phần phía trên và phần dưới modal che mất/bị che bởi Footer do ảnh hưởng bởi stacking context tạo ra từ hiệu ứng animation của trang.
  - Thiết lập thuộc tính lớp động `modal-open` trên `.page-container` và điều chỉnh `position: relative; z-index: 99999;` trong `AddressManagement.css` khi modal mở, nâng tổng thể trang chứa modal lên trên cả thanh header và footer, đồng thời tự động khôi phục cấu trúc xếp chồng thông thường khi đóng modal để duy trì hoạt động mượt mà của thanh sticky header.
- **Đồng bộ hóa Font chữ toàn diện & Đóng modal khi bấm ra ngoài ở trang quản lý địa chỉ**:
  - Đồng bộ phông chữ hệ thống cho toàn bộ các thẻ nhập liệu (`input`, `select`, `textarea`) trong `main.css` để đảm bảo sử dụng đồng nhất font chữ `'Inter'` cao cấp của thương hiệu.
  - Cải thiện trải nghiệm UX tại trang `/addresses`, hỗ trợ tự động đóng modal khi người dùng bấm ra vùng ngoài (overlay) của cửa sổ pop-up "Thêm địa chỉ mới" / "Cập nhật địa chỉ", đồng thời duy trì và ngăn chặn ảnh hưởng lan truyền khi click vào bên trong modal card.
- **Loại bỏ trường Địa chỉ nhận hàng khi đăng ký (Remove Address Field from Customer Registration)**:
  - Loại bỏ trường nhập liệu "Địa chỉ nhận hàng" cùng trạng thái `address` khỏi giao diện đăng ký (`Register/Index.jsx`) trên Storefront (`frontendUI`) giúp đơn giản hóa luồng đăng ký tài khoản cho khách hàng mới, do khách hàng có thể cập nhật địa chỉ giao hàng chi tiết sau đó trong trang quản lý tài khoản hoặc khi đặt hàng.
- **Khắc phục lỗi tìm kiếm bài viết ở thanh tìm kiếm (Blog Navbar Search Fix)**:
  - Khắc phục lỗi thanh tìm kiếm ở Header/Navbar luôn hiển thị toàn bộ 2 bài viết mặc định khi gõ bất kỳ từ khóa nào.
  - Nguyên nhân: Phương thức `getAllBlogs` trong `BlogController.java` ở Backend không nhận tham số truy vấn `keyword`, dẫn đến việc bỏ qua từ khóa tìm kiếm gửi từ Frontend và trả về toàn bộ danh sách bài viết hiện có.
  - Giải pháp: Bổ sung tham số `@RequestParam(required = false) String keyword` cho phương thức `getAllBlogs` và xây dựng câu truy vấn JPQL tùy chỉnh `searchBlogs` trong `BlogRepository.java` để lọc các bài viết có tiêu đề (title), tóm tắt (summary) hoặc nội dung (content) khớp với từ khóa tìm kiếm.
- **Bảo mật Định tuyến Quản trị, Phân trang toàn diện & Đồng bộ Dropdown Địa chỉ Khách hàng**:
  - **Bảo mật định tuyến**: Cài đặt routing guard động tại `App.jsx` trong `backendUI` kiểm tra quyền của tài khoản nhân viên. Tránh việc truy cập sai quyền và tự động chuyển hướng về trang được phép truy cập đầu tiên thay vì tự động chuyển đến Dashboard.
  - **Phân trang toàn diện**: Thiết lập phân trang phía Client (Client-Side Pagination) cho tất cả các mô-đun quản trị lớn bao gồm: Danh mục (Categories), Khách hàng (Customers), Đơn hàng (Orders), Bài viết (Blogs), và Nhân viên (Staff Users). Tự động đưa trang về 1 khi có thao tác lọc/tìm kiếm dữ liệu.
  - **Đồng bộ Dropdown Địa chỉ trong Form Khách hàng**: Chuyển đổi trường nhập địa chỉ thô ở modal thêm mới/chỉnh sửa khách hàng (`CustomerFormModal.jsx`) thành dải dropdown chọn Tỉnh/Thành phố, Quận/Huyện, Phường/Xã chuẩn địa lý hành chính Việt Nam và nhập chi tiết địa chỉ.
- **Tích hợp thành công Cổng Thanh toán Trực tuyến VNPay (VNPay Payment Integration)**:
  - Cấu hình credentials môi trường Sandbox của VNPay (`S32UGW9B`, `0SL8E4HWY75AI6BQ1VS5FXYR3WKNQCCE`) vào `application.properties`.
  - Thiết lập Spring Security cho phép truy cập công khai endpoint thanh toán `/api/payment/**`.
  - Tạo `VnPayConfig` và `VnPayService` để tạo liên kết thanh toán (`createPaymentUrl`) bằng thuật toán mã hóa HMAC SHA-512 và xác thực chữ ký số callback (`verifyCallback`).
  - Xây dựng `PaymentController` cung cấp các REST API cho Frontend tạo URL thanh toán, đối soát trạng thái giao dịch (`/vnpay/verify-return`) và nhận tin nhắn webhook IPN tự động từ server VNPay (`/vnpay/ipn`) để cập nhật trạng thái đơn hàng trong DB (`PAID` hoặc `FAILED`).
  - Cập nhật trang `/payment` trên Storefront React để chuyển hướng khách hàng sang VNPay và xây dựng trang `/payment-result` hiển thị giao diện kính mờ (Glassmorphism) cao cấp hiển thị thông tin hóa đơn.











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

## 5. QUY TẮC LƯU TRỮ SCRIPT VÀ TÀI LIỆU
1. **Thư mục lưu trữ Script**: Khi cần tạo bất kỳ script bổ trợ nào phục vụ cho việc tạo tài liệu, kiểm thử hoặc các tiến trình phụ, tất cả phải được lưu trữ trực tiếp tại thư mục `E:\asp\test\web2`.
2. **Quy trình viết Tài liệu**: Bất kỳ script nào được sử dụng để cập nhật hay sinh tài liệu `.docx` phải được lưu trữ tại `E:\asp\test\web2` để phục vụ chạy lại khi cần thiết.

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
  - Xây dựng cơ chế bắt lỗi xác thực trong Catch block của API `getCustomerById(customerId)`. Khi xảy ra lỗi 403 Forbidden hoặc 401 Unauthorized, hệ thống lập tức gọi hàm `eraseCookie('customer')` và `eraseCookie('token')` để dọn dẹp sạch sẽ các cookie phiên lỗi, đồng thời reset trạng thái Header trở về chế độ khách vãng lai, chấm dứt hoàn toàn tình trạng spam request lặp lại vô hạn gây nghẽn trình duyệt.
- **Xử lý ràng buộc khi xóa sản phẩm (Referenced Product Deletion Protection)**:
  - Nâng cấp API xóa sản phẩm (`deleteProduct`) trong `ProductController.java` để kiểm tra sự tồn tại của sản phẩm trong các đơn hàng trước khi thực hiện xóa cứng. Nếu phát hiện sản phẩm đang nằm trong bất kỳ đơn hàng nào, API sẽ trả về mã `400 Bad Request` kèm theo danh sách chi tiết các đơn hàng chứa sản phẩm đó (mã đơn hàng, tên người nhận, ngày đặt).
  - Tích hợp giao diện hiển thị danh sách đơn hàng liên quan dưới dạng `GlassModal` trong trang quản lý sản phẩm (`Products/Index.jsx`) ở Admin Dashboard. Khi người quản trị click xóa sản phẩm bị lỗi ràng buộc khóa ngoại, thay vì báo lỗi hệ thống thô kệch, ứng dụng sẽ hiển thị hộp thoại cảnh báo trực quan liệt kê tất cả các đơn hàng liên quan kèm nút **"Xem chi tiết"** để chuyển hướng nhanh đến hóa đơn đó, nâng cao trải nghiệm quản trị.





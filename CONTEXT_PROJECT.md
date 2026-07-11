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
- Nó nhặt ra 3 sản phẩm phù hợp nhất, ghép vào System Prompt và ném cho mô hình `gemini-3.5-flash` của Google qua SDK `google-genai` (Sử dụng Async/Await để tăng tốc độ I/O).
- AI Google trả về chữ, Python dùng `StreamingResponse` nhả từng chữ cái một (Streaming) về lại cho `frontendUI` để hiển thị mượt mà như ChatGPT.

---

## 3. PHÂN TÍCH CHI TIẾT TỪNG REPOSITORY

### 3.1. Repository: `E:\web2\vuhoangchinh` (Java Backend)
- **Công nghệ**: Java 17, Spring Boot 3.5.15, Spring Data JPA, Spring Security, MySQL, JJWT, Springdoc OpenAPI (Swagger).
- **Cấu trúc Thư mục Chính**:
  - `src/main/java/com/example/vuhoangchinh/Entities/`: Chứa các thực thể Database. Trọng tâm là `Product.java` (Sản phẩm), `CategoryProduct.java` (Danh mục), `ProductVariant.java` (Biến thể tồn kho).
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
    - API `POST /api/ai/chat`: Nhận tin nhắn từ Frontend, thực hiện RAG query lấy 3 sản phẩm liên quan và trả về câu trả lời dưới dạng **StreamingResponse**.
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
  - Tích hợp một **Chatbot UI** ở góc màn hình. Widget này gọi trực tiếp sang Server Python cổng 8000 (`/api/ai/chat`) để giao tiếp với AI.

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

# Hệ Thống Quản Trị & API Bán Hàng (Sales Admin Dashboard & Spring Boot REST API)

Dự án này là một hệ thống quản lý bán hàng hoàn chỉnh được chia làm hai phân hệ chính:
1. **Backend (`vuhoangchinh`)**: Xây dựng bằng Java Spring Boot, cung cấp các RESTful API kết nối với cơ sở dữ liệu MySQL, được bảo mật bằng Spring Security & JWT và tài liệu hóa qua Swagger/OpenAPI.
2. **Frontend (`backendUI`)**: Ứng dụng Single Page Application (SPA) xây dựng trên nền tảng React, Vite và Tailwind CSS, mang thiết kế giao diện tối (Dark Mode) hiện đại với hiệu ứng Glassmorphism sống động.

---

## 🏗️ Kiến Trúc Hệ Thống

Hệ thống hoạt động theo mô hình Client-Server rời rạc:
* **Frontend** gửi các yêu cầu HTTP (hoặc giả lập luồng qua Context State lưu trữ nội bộ nâng cao) để tương tác dữ liệu.
* **Backend** tiếp nhận yêu cầu, xử lý nghiệp vụ, kiểm tra phân quyền JWT Token, kết nối MySQL thông qua JPA Hibernate và phản hồi dữ liệu dạng JSON.

```
┌─────────────────────────────────┐          HTTP Requests & JWT           ┌─────────────────────────────────┐
│            Frontend             ├───────────────────────────────────────>│             Backend             │
│          (backendUI)            │<───────────────────────────────────────┤         (vuhoangchinh)          │
│    React, Vite, Tailwind CSS    │             JSON Response             │    Spring Boot, JPA, Security   │
└─────────────────────────────────┘                                        └────────────────┬────────────────┘
                                                                                            │
                                                                                            │ JPA / Hibernate
                                                                                            ▼
                                                                                   ┌─────────────────┐
                                                                                   │    Database     │
                                                                                   │      MySQL      │
                                                                                   └─────────────────┘
```

---

## 🌟 Phân Hệ Backend: `vuhoangchinh`

Phần backend đảm nhận nhiệm vụ cung cấp tài nguyên, quản lý dữ liệu người dùng, vai trò hệ thống, thông tin khách hàng và dịch vụ upload tệp tin.

### 🛠️ Công nghệ sử dụng
* **Java 17** & **Spring Boot 3.5.15**
* **Spring Security & JWT**: Xác thực trạng thái phi trạng thái (Stateless Authentication) qua Bearer Token.
* **Spring Data JPA**: Tương tác cơ sở dữ liệu qua các thực thể (Entities).
* **MySQL Connector**: Trình điều khiển kết nối cơ sở dữ liệu MySQL.
* **Lombok**: Giảm thiểu mã nguồn thừa (Getter, Setter, Constructor, Builder).
* **Springdoc OpenAPI**: Tự động tạo tài liệu kiểm thử API trực quan (Swagger UI).

### 🔑 Các API Endpoint chính
* **Xác thực Hệ thống (`/api/auth`)**:
  * `POST /api/auth/login`: Đăng nhập tài khoản Admin/Staff, trả về JWT Token và thông tin người dùng.
* **Khách hàng (`/api/customers`)**:
  * `POST /api/customers/register`: Đăng ký tài khoản khách hàng mới (mật khẩu được mã hóa BCrypt).
  * `POST /api/customers/login`: Đăng nhập khách hàng, trả về Token xác thực.
  * `GET /api/customers`: Lấy danh sách khách hàng.
  * `GET /api/customers/{id}`: Xem chi tiết khách hàng.
  * `PUT /api/customers/{id}`: Cập nhật thông tin chi tiết khách hàng.
  * `DELETE /api/customers/{id}`: Xóa tài khoản khách hàng.
* **Nhân viên / Admin (`/api/users`)** *(Yêu cầu xác thực JWT)*:
  * `GET /api/users`: Lấy danh sách tài khoản nhân viên.
  * `POST /api/users`: Thêm mới tài khoản nhân viên (Mã hóa mật khẩu tự động).
  * `GET /api/users/{id}`: Chi tiết nhân viên.
  * `PUT /api/users/{id}`: Cập nhật thông tin nhân viên.
  * `DELETE /api/users/{id}`: Xóa nhân viên (Có kiểm tra bảo mật: Không cho phép tự xóa chính mình).
* **Vai trò (`/api/roles`)** *(Yêu cầu xác thực JWT)*:
  * `GET /api/roles`: Lấy danh sách các vai trò (Role).
  * `POST /api/roles`: Thêm mới vai trò.
  * `PUT /api/roles/{id}`: Cập nhật mô tả vai trò.
  * `DELETE /api/roles/{id}`: Xóa vai trò.
* **Tải tệp tin (`/api/uploads`)**:
  * `POST /api/uploads/image`: Tải ảnh lên hệ thống, lưu trữ vật lý tại thư mục tĩnh `src/main/resources/static/image` và trả về đường dẫn tĩnh `/image/{filename}` để lưu vào cơ sở dữ liệu.

---

## 🖥️ Phân Hệ Frontend: `backendUI`

Giao diện quản trị Admin được thiết kế theo phong cách vũ trụ (Vibrant Space Dark Theme) kết hợp hiệu ứng kính (Glassmorphism), đem lại trải nghiệm mượt mà với nhiều micro-animations.

### 🛠️ Công nghệ sử dụng
* **React 18** (định dạng JSX) & **Vite** làm công cụ đóng gói (bundler) siêu nhanh.
* **Tailwind CSS**: Thiết kế giao diện phản hồi (Responsive Layout) linh hoạt.
* **Lucide React**: Thư viện icon dạng vector sắc nét, hiện đại.
* **Recharts**: Vẽ biểu đồ thống kê trực quan (biểu đồ doanh thu dạng vùng, cơ cấu danh mục dạng tròn).
* **React Context (`AdminContext`)**: Quản lý tập trung toàn bộ trạng thái dữ liệu (State) của ứng dụng, bao gồm logic xử lý CRUD và đồng bộ hóa nghiệp vụ.

### 📊 Các trang tính năng chính trong Dashboard
1. **Dashboard (Bảng điều khiển)**:
   * Thống kê tổng số doanh thu, số đơn hàng, khách hàng hoạt động, sản phẩm tồn kho kèm chỉ số tăng trưởng.
   * Biểu đồ doanh thu tuyến tính trực quan theo thời gian.
   * Danh sách đơn hàng mới nhất và biểu đồ cơ cấu danh mục sản phẩm bán chạy.
2. **Products (Sản phẩm)**:
   * Hiển thị bảng sản phẩm chi tiết (Hình ảnh, Tên, Giá bán lẻ, Giá khuyến mãi, Tồn kho, Trạng thái hoạt động).
   * Bộ lọc tìm kiếm và phân loại theo Danh mục.
   * Form Thêm/Sửa sản phẩm với tính năng tải ảnh dạng Base64.
   * Ràng buộc bảo mật: Không được xóa sản phẩm nếu sản phẩm đó đang tồn tại trong đơn hàng.
3. **Categories (Danh mục)**:
   * Quản lý phân loại bao gồm Danh mục sản phẩm và Danh mục bài viết (Blogs).
   * Ràng buộc hệ thống: Không thể xóa danh mục nếu đang có sản phẩm/bài viết trực thuộc.
4. **Orders (Đơn hàng)**:
   * Danh sách đơn hàng toàn hệ thống với mã đơn, tên khách hàng, tổng tiền, phương thức thanh toán và trạng thái.
   * Xem chi tiết hóa đơn (Invoice Layout) gồm danh sách sản phẩm đã mua và địa chỉ giao hàng.
   * Cập nhật trạng thái đơn hàng (`Pending` -> `Processing` -> `Shipped` -> `Completed` -> `Cancelled`).
   * Tự động điều chỉnh kho hàng (Trừ kho khi tạo đơn/Khôi phục kho khi hủy đơn) và cập nhật số tiền chi tiêu của khách hàng.
5. **Customers (Khách hàng)**:
   * Danh sách khách hàng kèm số lượng đơn đã đặt, tổng chi tiêu.
   * Chức năng khóa/mở khóa tài khoản khách hàng (`Active`/`Inactive`).
6. **Blogs (Tin tức)**:
   * Trình quản lý bài viết tin tức quảng bá sản phẩm hoặc chia sẻ kiến thức công nghệ.
7. **Banners (Banner Quảng cáo)**:
   * Quản lý các banner hiển thị trên website chính (Vị trí, Tiêu đề, Liên kết, Trạng thái kích hoạt).
8. **Users & Roles (Nhân viên & Phân quyền)**:
   * Quản lý danh sách nhân viên console vận hành hệ thống.
   * Phân quyền chi tiết theo vai trò (`Administrator`, `Editor`, `Sales Agent`). Mỗi vai trò có giới hạn quyền truy cập menu khác nhau.
   * Cơ chế tự bảo vệ: Cấm tài khoản quản trị đang đăng nhập tự xóa hoặc tự hạ quyền của chính mình.

---

## ⚙️ Hướng Dẫn Cấu Hướng / Cấu Hình

### 1. Cấu hình Backend (`vuhoangchinh`)
Tệp tin cấu hình nằm tại: `vuhoangchinh/src/main/resources/application.properties`

```properties
spring.application.name=vuhoangchinh

# Cấu hình kết nối MySQL (Tự động tạo database nếu chưa tồn tại)
spring.datasource.url=jdbc:mysql://localhost:3306/vuhoangchinh_web2?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&useUnicode=true&characterEncoding=UTF-8
spring.datasource.username=root
spring.datasource.password=

# Cấu hình JPA / Hibernate
spring.jpa.show-sql=true
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# Cấu hình Port chạy ứng dụng
server.port=8080

# Cấu hình Swagger / OpenAPI
springdoc.swagger-ui.path=/swagger-ui.html
springdoc.api-docs.path=/api-docs
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

### Yêu cầu hệ thống:
* **Java JDK**: Phiên bản 17 hoặc cao hơn.
* **Node.js**: Phiên bản 18.x trở lên cùng công cụ quản lý gói `npm`.
* **Cơ sở dữ liệu**: MySQL Server đang chạy trên cổng `3306`.

---

### Bước 1: Khởi động Backend Spring Boot

1. Di chuyển vào thư mục dự án backend:
   ```bash
   cd vuhoangchinh
   ```
2. Thực hiện tải dependencies và chạy ứng dụng thông qua Maven Wrapper:
   * Trên hệ điều hành **Windows**:
     ```powershell
     .\mvnw.cmd spring-boot:run
     ```
   * Trên hệ điều hành **macOS / Linux**:
     ```bash
     chmod +x mvnw
     ./mvnw spring-boot:run
     ```
3. Khi khởi động thành công, backend sẽ lắng nghe tại cổng `8080`.
4. Truy cập giao diện tài liệu kiểm thử API Swagger UI:
   [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

---

### Bước 2: Khởi động Frontend React (Vite)

1. Di chuyển vào thư mục dự án frontend:
   ```bash
   cd backendUI
   ```
2. Thực hiện cài đặt các thư viện phụ thuộc (node_modules):
   ```bash
   npm install
   ```
3. Chạy ứng dụng ở chế độ phát triển (Development Mode):
   ```bash
   npm run dev
   ```
4. Mở trình duyệt và truy cập theo đường dẫn:
   [http://localhost:5173](http://localhost:5173)

---

### 🔑 Tài Khoản Đăng Nhập Mẫu (Mặc định trong hệ thống)

Dưới đây là danh sách tài khoản nhân viên được cài đặt sẵn để kiểm thử phân quyền trên giao diện quản trị:

| Tài Khoản | Mật Khẩu | Vai Trò (Role) | Phạm Vi Quyền Hạn |
| :--- | :--- | :--- | :--- |
| **admin_duong** | `admin123` hoặc `chinh123` | **Administrator** | Toàn quyền truy cập tất cả phân hệ quản lý và hệ thống |
| **editor_minh** | `admin123` hoặc `chinh123` | **Editor** | Quản lý Sản phẩm, Danh mục, Bài viết tin tức và Banner quảng cáo |
| **sales_lan** | `admin123` hoặc `chinh123` | **Sales Agent** | Chỉ xem Dashboard, Quản lý đơn đặt hàng và danh sách Khách hàng |

---

## 📁 Sơ Đồ Thư Mục Dự Án tiêu biểu

```
web2/
├── backendUI/                 # Phân hệ Frontend (React + Vite)
│   ├── src/
│   │   ├── components/        # Thành phần UI tái sử dụng (Navbar, Sidebar, GlassCard...)
│   │   ├── context/           # Quản lý State toàn cục (AdminContext.jsx)
│   │   ├── pages/             # Trang giao diện chính (Dashboard, Products, Users...)
│   │   ├── App.jsx            # Định tuyến chính
│   │   └── main.jsx           # Điểm khởi tạo dự án React
│   ├── package.json           # Danh sách dependencies của frontend
│   └── vite.config.js         # Cấu hình Vite
│
└── vuhoangchinh/              # Phân hệ Backend (Spring Boot)
    ├── src/main/java/com/example/vuhoangchinh/
    │   ├── Config/            # Cấu hình bảo mật Security & tài liệu OpenAPI/Swagger
    │   ├── Controllers/       # Nơi tiếp nhận requests HTTP (Auth, Customers, Users...)
    │   ├── Entities/          # Các thực thể ánh xạ JPA (User, Role, Customer)
    │   ├── Repositories/      # Giao tiếp cơ sở dữ liệu Spring Data JPA
    │   └── Security/          # Bộ lọc xác thực JWT Token
    ├── src/main/resources/
    │   └── application.properties # Tệp tin cấu hình ứng dụng
    └── pom.xml                # Quản lý thư viện Maven
```

package com.example.vuhoangchinh.Controllers;

// Import thực thể và repository phục vụ truy xuất vai trò quản trị
import com.example.vuhoangchinh.Entities.Role; // Thực thể lưu trữ vai trò người dùng (Admin, Employee, v.v.)
import com.example.vuhoangchinh.Repositories.RoleRepository; // Repository tương tác CSDL bảng roles

// Import các annotation của Spring Framework
import org.springframework.beans.factory.annotation.Autowired; // Tự động tiêm dependency bean vào class
import org.springframework.web.bind.annotation.*; // Các annotations định nghĩa API RESTful (@RestController, @GetMapping, v.v.)

// Import kiểu cấu trúc danh sách dữ liệu động chuẩn của Java
import java.util.List;

/**
 * @RestController: Khai báo lớp này là một REST Controller, trả về dữ liệu thô dạng JSON.
 * @RequestMapping("/api/roles"): Đặt tiền tố chung cho tất cả các API quản lý Role.
 * @CrossOrigin(origins = "*"): Cho phép mọi domain khác nhau gọi API vào đây (phục vụ Frontend kết nối CORS).
 */
@RestController
@RequestMapping("/api/roles")
@CrossOrigin(origins = "*")
public class RoleController {

    // Tiêm repository của Role để thực hiện các hành động CRUD
    @Autowired
    private RoleRepository roleRepository;

    /**
     * API Lấy danh sách tất cả các vai trò (Roles) trong hệ thống.
     * GET /api/roles
     */
    @GetMapping
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    /**
     * API Thêm mới một vai trò (Role) mới.
     * POST /api/roles
     */
    @PostMapping
    public Role createRole(@RequestBody Role role) {
        if (role.getName() != null && role.getName().equalsIgnoreCase("ROLE_ADMIN")) {
            throw new RuntimeException("Cannot create a new role with the protected name ROLE_ADMIN.");
        }
        return roleRepository.save(role);
    }

    /**
     * API Lấy thông tin chi tiết một vai trò cụ thể dựa trên ID.
     * GET /api/roles/{id}
     */
    @GetMapping("/{id}")
    public Role getRoleById(@PathVariable Long id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found with id " + id));
    }

    /**
     * API Cập nhật thông tin vai trò theo ID vai trò.
     * PUT /api/roles/{id}
     */
    @PutMapping("/{id}")
    public Role updateRole(@PathVariable Long id, @RequestBody Role roleDetails) {
        // Tìm kiếm Role cũ trong DB, báo lỗi nếu không tìm thấy
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found with id " + id));
        
        // Ngăn chặn sửa đổi vai trò quản trị tối cao ROLE_ADMIN
        if (role.getName().equalsIgnoreCase("ROLE_ADMIN")) {
            throw new RuntimeException("Cannot modify standard system admin role security configuration.");
        }
        
        // Cập nhật tên vai trò, mô tả chi tiết và danh sách quyền
        role.setName(roleDetails.getName());
        role.setDescription(roleDetails.getDescription());
        role.setPermissions(roleDetails.getPermissions());
        
        // Lưu và trả về thực thể vai trò đã được cập nhật
        return roleRepository.save(role);
    }

    /**
     * API Xóa vai trò theo mã ID.
     * DELETE /api/roles/{id}
     */
    @DeleteMapping("/{id}")
    public String deleteRole(@PathVariable Long id) {
        // Tìm vai trò cần xóa trong DB, báo lỗi nếu không tìm thấy
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found with id " + id));
        
        // Ngăn chặn xóa vai trò quản trị tối cao ROLE_ADMIN
        if (role.getName().equalsIgnoreCase("ROLE_ADMIN")) {
            throw new RuntimeException("Cannot delete standard system admin role.");
        }
        
        // Tiến hành xóa vai trò khỏi Database
        roleRepository.delete(role);
        return "Role with id " + id + " has been deleted.";
    }
}

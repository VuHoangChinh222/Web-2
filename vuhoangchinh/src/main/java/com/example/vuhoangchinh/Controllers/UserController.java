package com.example.vuhoangchinh.Controllers;

import com.example.vuhoangchinh.Entities.User;
import com.example.vuhoangchinh.Repositories.UserRepository;
import com.example.vuhoangchinh.Repositories.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        if (user.getRole() == null || user.getRole().getId() == null) {
            throw new RuntimeException("Role id is required");
        }
        var role = roleRepository.findById(user.getRole().getId())
                .orElseThrow(() -> new RuntimeException("Role not found"));
        user.setRole(role);
        
        // Mã hóa mật khẩu khi tạo mới
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        return userRepository.save(user);
    }

    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id " + id));
    }

    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id " + id));
        
        user.setUsername(userDetails.getUsername());
        
        // Chỉ mã hóa và cập nhật mật khẩu nếu có mật khẩu mới được truyền lên
        if (userDetails.getPassword() != null && !userDetails.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }
        
        user.setFullName(userDetails.getFullName());
        user.setEmail(userDetails.getEmail());
        user.setPhone(userDetails.getPhone());
        user.setImageUrl(userDetails.getImageUrl());
        user.setStatus(userDetails.getStatus());
        
        if (userDetails.getRole() != null && userDetails.getRole().getId() != null) {
            var role = roleRepository.findById(userDetails.getRole().getId())
                    .orElseThrow(() -> new RuntimeException("Role not found"));
            user.setRole(role);
        }
        
        return userRepository.save(user);
    }

    @DeleteMapping("/{id}")
    public String deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id " + id));
        userRepository.delete(user);
        return "User with id " + id + " has been deleted.";
    }
}

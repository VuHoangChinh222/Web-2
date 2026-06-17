package com.example.vuhoangchinh.Controllers;

import com.example.vuhoangchinh.Entities.Role;
import com.example.vuhoangchinh.Repositories.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
@CrossOrigin(origins = "*")
public class RoleController {

    @Autowired
    private RoleRepository roleRepository;

    @GetMapping
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    @PostMapping
    public Role createRole(@RequestBody Role role) {
        return roleRepository.save(role);
    }

    @GetMapping("/{id}")
    public Role getRoleById(@PathVariable Long id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found with id " + id));
    }

    @PutMapping("/{id}")
    public Role updateRole(@PathVariable Long id, @RequestBody Role roleDetails) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found with id " + id));
        role.setName(roleDetails.getName());
        role.setDescription(roleDetails.getDescription());
        return roleRepository.save(role);
    }

    @DeleteMapping("/{id}")
    public String deleteRole(@PathVariable Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found with id " + id));
        roleRepository.delete(role);
        return "Role with id " + id + " has been deleted.";
    }
}

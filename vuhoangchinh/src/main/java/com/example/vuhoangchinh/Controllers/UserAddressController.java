package com.example.vuhoangchinh.Controllers;

import com.example.vuhoangchinh.Entities.UserAddress;
import com.example.vuhoangchinh.Repositories.UserAddressRepository;
import com.example.vuhoangchinh.Repositories.CustomerRepository;
import lombok.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-addresses")
@CrossOrigin(origins = "*")
public class UserAddressController {

    @Autowired
    private UserAddressRepository userAddressRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserAddressRequest {
        private Long customerId;
        private String recipientName;
        private String recipientPhone;
        private String addressLine;
        private String ward;
        private String district;
        private String city;
        private Boolean isDefault;
    }

    @GetMapping
    public List<UserAddress> getAllAddresses() {
        return userAddressRepository.findAll();
    }

    @GetMapping("/customer/{customerId}")
    public List<UserAddress> getAddressesByCustomerId(@PathVariable Long customerId) {
        return userAddressRepository.findByCustomerId(customerId);
    }

    @PostMapping
    public ResponseEntity<?> createAddress(@RequestBody UserAddressRequest request) {
        if (request.getCustomerId() == null) {
            return ResponseEntity.badRequest().body("Customer id is required");
        }
        var customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found with id " + request.getCustomerId()));

        UserAddress userAddress = new UserAddress();
        userAddress.setCustomer(customer);
        userAddress.setRecipientName(request.getRecipientName());
        userAddress.setRecipientPhone(request.getRecipientPhone());
        userAddress.setAddressLine(request.getAddressLine());
        userAddress.setWard(request.getWard());
        userAddress.setDistrict(request.getDistrict());
        userAddress.setCity(request.getCity());
        userAddress.setIsDefault(request.getIsDefault() != null ? request.getIsDefault() : false);

        if (Boolean.TRUE.equals(userAddress.getIsDefault())) {
            resetDefaultAddresses(customer.getId());
        }

        UserAddress savedAddress = userAddressRepository.save(userAddress);
        return ResponseEntity.ok(savedAddress);
    }

    @GetMapping("/{id}")
    public UserAddress getAddressById(@PathVariable Long id) {
        return userAddressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Address not found with id " + id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAddress(@PathVariable Long id, @RequestBody UserAddressRequest request) {
        UserAddress userAddress = userAddressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Address not found with id " + id));

        userAddress.setRecipientName(request.getRecipientName());
        userAddress.setRecipientPhone(request.getRecipientPhone());
        userAddress.setAddressLine(request.getAddressLine());
        userAddress.setWard(request.getWard());
        userAddress.setDistrict(request.getDistrict());
        userAddress.setCity(request.getCity());
        userAddress.setIsDefault(request.getIsDefault() != null ? request.getIsDefault() : false);

        if (Boolean.TRUE.equals(userAddress.getIsDefault())) {
            resetDefaultAddresses(userAddress.getCustomer().getId());
        }

        UserAddress updatedAddress = userAddressRepository.save(userAddress);
        return ResponseEntity.ok(updatedAddress);
    }

    @DeleteMapping("/{id}")
    public String deleteAddress(@PathVariable Long id) {
        UserAddress userAddress = userAddressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Address not found with id " + id));
        userAddressRepository.delete(userAddress);
        return "Address with id " + id + " has been deleted.";
    }

    private void resetDefaultAddresses(Long customerId) {
        List<UserAddress> addresses = userAddressRepository.findByCustomerId(customerId);
        for (UserAddress addr : addresses) {
            if (Boolean.TRUE.equals(addr.getIsDefault())) {
                addr.setIsDefault(false);
                userAddressRepository.save(addr);
            }
        }
    }
}

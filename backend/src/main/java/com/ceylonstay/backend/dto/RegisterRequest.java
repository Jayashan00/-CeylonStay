package com.ceylonstay.backend.dto;

import com.ceylonstay.backend.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    private String fullName;

    @NotBlank @Email
    private String email;

    @NotBlank @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    private String phone;

    private Role role; // GUEST or HOTEL_OWNER (ADMIN cannot self-register)
}

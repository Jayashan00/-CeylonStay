package com.ceylonstay.backend.controller;

import com.ceylonstay.backend.dto.AuthResponse;
import com.ceylonstay.backend.dto.LoginRequest;
import com.ceylonstay.backend.dto.RegisterRequest;
import com.ceylonstay.backend.security.UserPrincipal;
import com.ceylonstay.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public Object me(@AuthenticationPrincipal UserPrincipal principal) {
        var user = principal.getUser();
        return new Object() {
            public final String id = user.getId();
            public final String fullName = user.getFullName();
            public final String email = user.getEmail();
            public final String role = user.getRole().name();
            public final String phone = user.getPhone();
        };
    }
}

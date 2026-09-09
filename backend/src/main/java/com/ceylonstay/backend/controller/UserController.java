package com.ceylonstay.backend.controller;

import com.ceylonstay.backend.model.User;
import com.ceylonstay.backend.security.UserPrincipal;
import com.ceylonstay.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class UserController {

    private final UserService userService;

    @PutMapping("/me")
    public User updateMe(@AuthenticationPrincipal UserPrincipal principal, @RequestBody Map<String, String> body) {
        return userService.updateProfile(principal.getId(), body.get("fullName"), body.get("phone"));
    }
}

package com.ceylonstay.backend.service;

import com.ceylonstay.backend.dto.AuthResponse;
import com.ceylonstay.backend.dto.LoginRequest;
import com.ceylonstay.backend.dto.RegisterRequest;
import com.ceylonstay.backend.exception.ApiException;
import com.ceylonstay.backend.model.Role;
import com.ceylonstay.backend.model.User;
import com.ceylonstay.backend.repository.UserRepository;
import com.ceylonstay.backend.security.JwtUtil;
import com.ceylonstay.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ApiException("An account with this email already exists", HttpStatus.CONFLICT);
        }

        Role role = request.getRole() == Role.ADMIN || request.getRole() == null ? Role.GUEST : request.getRole();

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(role)
                .active(true)
                .build();

        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole().name());
        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new ApiException("Invalid email or password", HttpStatus.UNAUTHORIZED));

        if (!user.isActive()) {
            throw new ApiException("This account has been deactivated. Contact support.", HttpStatus.FORBIDDEN);
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole().name());
        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    public User currentUser(UserPrincipal principal) {
        return principal.getUser();
    }
}

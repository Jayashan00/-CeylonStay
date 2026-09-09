package com.ceylonstay.backend.service;

import com.ceylonstay.backend.exception.ApiException;
import com.ceylonstay.backend.model.User;
import com.ceylonstay.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUser(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
    }

    public User setActive(String id, boolean active) {
        User user = getUser(id);
        user.setActive(active);
        return userRepository.save(user);
    }

    public User updateProfile(String id, String fullName, String phone) {
        User user = getUser(id);
        if (fullName != null) user.setFullName(fullName);
        if (phone != null) user.setPhone(phone);
        return userRepository.save(user);
    }
}

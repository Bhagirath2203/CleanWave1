package com.cleanwave.service;

import com.cleanwave.dto.AuthResponse;
import com.cleanwave.dto.LoginRequest;
import com.cleanwave.dto.SignupRequest;
import com.cleanwave.exception.BadRequestException;
import com.cleanwave.exception.UnauthorizedException;
import com.cleanwave.model.User;
import com.cleanwave.repository.UserRepository;
import com.cleanwave.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public void signup(SignupRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new BadRequestException("Email already registered");
        }

        Roles role;
        try {
            role = Roles.valueOf(request.getRole().toUpperCase());
        } catch (Exception e) {
            throw new BadRequestException("Invalid role: " + request.getRole());
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);

        userRepository.save(user);
    }
}

package com.cleanwave.service;

import com.cleanwave.dto.SignupRequest;
import com.cleanwave.exception.BadRequestException;
import com.cleanwave.exception.ResourceNotFoundException;
import com.cleanwave.model.User;
import com.cleanwave.repository.UserRepository;
import com.cleanwave.security.Roles;
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

    @Autowired
    private RoleRequestService roleRequestService;

    public User signup(SignupRequest request) {
        Roles requestedRole = Roles.valueOf(request.getRole().toUpperCase());

        if (requestedRole == Roles.ADMIN) {
            throw new BadRequestException("Admin signup is not allowed");
        }

        if (requestedRole == Roles.WORKER) {
            // Create a pending worker request instead of immediate account
            roleRequestService.createWorkerRequest(request);
            return null;
        }

        // Default: create active citizen account
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Roles.CITIZEN);

        return userRepository.save(user);
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public List<User> getAllWorkers() {
        return userRepository.findByRole(Roles.WORKER);
    }

    public void deleteWorker(String id) {
        User user = getUserById(id);
        if (user.getRole() != Roles.WORKER) {
            throw new BadRequestException("User is not a worker");
        }
        userRepository.deleteById(id);
    }
}

package com.cleanwave.service;

import com.cleanwave.dto.SignupRequest;
import com.cleanwave.exception.BadRequestException;
import com.cleanwave.model.RoleRequest;
import com.cleanwave.model.RoleRequest.Status;
import com.cleanwave.model.User;
import com.cleanwave.repository.RoleRequestRepository;
import com.cleanwave.repository.UserRepository;
import com.cleanwave.security.Roles;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RoleRequestService {

    @Autowired
    private RoleRequestRepository roleRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public void createWorkerRequest(SignupRequest request) {
        String email = request.getEmail();

        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email already registered");
        }

        if (roleRequestRepository.existsByEmailAndStatus(email, Status.PENDING)) {
            throw new BadRequestException("A pending request already exists for this email");
        }

        RoleRequest roleRequest = new RoleRequest();
        roleRequest.setUsername(request.getUsername());
        roleRequest.setEmail(email);
        roleRequest.setEncodedPassword(passwordEncoder.encode(request.getPassword()));
        roleRequest.setRequestedRole(Roles.WORKER);
        roleRequest.setStatus(Status.PENDING);
        roleRequest.setCreatedAt(LocalDateTime.now());

        roleRequestRepository.save(roleRequest);
    }

    public List<RoleRequest> getPendingWorkerRequests() {
        return roleRequestRepository.findByRequestedRoleAndStatus(Roles.WORKER, Status.PENDING);
    }

    public void approveWorkerRequest(String requestId) {
        RoleRequest roleRequest = roleRequestRepository.findById(requestId)
                .orElseThrow(() -> new BadRequestException("Request not found"));

        if (roleRequest.getStatus() != Status.PENDING) {
            throw new BadRequestException("Request is not pending");
        }

        if (userRepository.existsByEmail(roleRequest.getEmail())) {
            throw new BadRequestException("User already exists for this email");
        }

        User user = new User();
        user.setUsername(roleRequest.getUsername());
        user.setEmail(roleRequest.getEmail());
        user.setPassword(roleRequest.getEncodedPassword());
        user.setRole(Roles.WORKER);
        userRepository.save(user);

        roleRequest.setStatus(Status.APPROVED);
        roleRequest.setDecidedAt(LocalDateTime.now());
        roleRequestRepository.save(roleRequest);
    }

    public void rejectWorkerRequest(String requestId) {
        RoleRequest roleRequest = roleRequestRepository.findById(requestId)
                .orElseThrow(() -> new BadRequestException("Request not found"));

        if (roleRequest.getStatus() != Status.PENDING) {
            throw new BadRequestException("Request is not pending");
        }

        roleRequest.setStatus(Status.REJECTED);
        roleRequest.setDecidedAt(LocalDateTime.now());
        roleRequestRepository.save(roleRequest);
    }
}


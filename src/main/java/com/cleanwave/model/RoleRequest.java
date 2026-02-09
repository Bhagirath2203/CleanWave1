package com.cleanwave.model;

import com.cleanwave.security.Roles;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "role_requests")
public class RoleRequest {

    public enum Status {
        PENDING,
        APPROVED,
        REJECTED
    }

    @Id
    private String id;

    private String username;
    private String email;
    private String encodedPassword;
    private Roles requestedRole;
    private Status status;
    private LocalDateTime createdAt;
    private LocalDateTime decidedAt;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getEncodedPassword() { return encodedPassword; }
    public void setEncodedPassword(String encodedPassword) { this.encodedPassword = encodedPassword; }

    public Roles getRequestedRole() { return requestedRole; }
    public void setRequestedRole(Roles requestedRole) { this.requestedRole = requestedRole; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getDecidedAt() { return decidedAt; }
    public void setDecidedAt(LocalDateTime decidedAt) { this.decidedAt = decidedAt; }
}


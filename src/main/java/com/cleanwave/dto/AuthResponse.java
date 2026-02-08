package com.cleanwave.dto;

public class AuthResponse {

    private String token;
    private String email;
    private String username;
    private String role;

    public AuthResponse(String token, String email, String username, String role) {
        this.token = token;
        this.email = email;
        this.username = username;
        this.role = role;
    }

    public String getToken() { return token; }
    public String getEmail() { return email; }
    public String getUsername() { return username; }
    public String getRole() { return role; }
}

package com.cleanwave.controller;

import org.springframework.security.core.Authentication;
import com.cleanwave.dto.*;
import com.cleanwave.security.JwtUtil;
import com.cleanwave.service.UserService;
import org.springframework.security.core.Authentication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        userService.signup(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {

        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        String token = jwtUtil.generateToken(
                request.getEmail(),
                auth.getAuthorities().iterator().next().getAuthority()
        );

        String email = request.getEmail();
        String role = auth.getAuthorities().iterator().next().getAuthority();
        String username = email.split("@")[0]; // Extract username from email

        return ResponseEntity.ok(new AuthResponse(token, email, username, role));
    }
}

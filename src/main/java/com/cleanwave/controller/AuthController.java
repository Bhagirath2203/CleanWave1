package com.cleanwave.controller;

import com.cleanwave.dto.AuthResponse;
import com.cleanwave.dto.LoginRequest;
import com.cleanwave.dto.SignupRequest;
import com.cleanwave.exception.BadRequestException;
import com.cleanwave.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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
        return ResponseEntity.ok(Map.of("message", "User registered"));
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

        return ResponseEntity.ok(new AuthResponse(token));
    }
}

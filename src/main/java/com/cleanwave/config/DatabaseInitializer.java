package com.cleanwave.config;

import com.cleanwave.model.User;
import com.cleanwave.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer implements CommandLineRunner {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        // Create default admin if not exists
        if (!userRepository.existsByEmail("admin@cleanwave.com")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@cleanwave.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(User.UserRole.ADMIN);
            userRepository.save(admin);
            System.out.println("✓ Default admin user created: admin@cleanwave.com / admin123");
        }
        
        // Create default worker if not exists
        if (!userRepository.existsByEmail("worker@cleanwave.com")) {
            User worker = new User();
            worker.setUsername("worker");
            worker.setEmail("worker@cleanwave.com");
            worker.setPassword(passwordEncoder.encode("worker123"));
            worker.setRole(User.UserRole.WORKER);
            userRepository.save(worker);
            System.out.println("✓ Default worker user created: worker@cleanwave.com / worker123");
        }
    }
}

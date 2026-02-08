package com.cleanwave.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.awt.Desktop;
import java.net.URI;

@Component
public class BrowserLauncher implements CommandLineRunner {

    @Override
    public void run(String... args) throws Exception {
        // Check if Desktop is supported on this platform
        if (Desktop.isDesktopSupported()) {
            try {
                // Open the default browser to the application URL
                Desktop.getDesktop().browse(new URI("http://localhost:8080"));
                System.out.println("✓ Browser launched successfully!");
            } catch (Exception e) {
                System.out.println("⚠ Could not open browser automatically: " + e.getMessage());
                System.out.println("✓ Please manually visit: http://localhost:8080");
            }
        } else {
            System.out.println("⚠ Desktop is not supported on this system");
            System.out.println("✓ Please manually visit: http://localhost:8080");
        }
    }
}

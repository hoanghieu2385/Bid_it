package com.example.user.model;

import com.example.user.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminUserInitializer implements CommandLineRunner {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;

    public AdminUserInitializer(UserRepository userRepo, PasswordEncoder encoder) {
        this.userRepo = userRepo;
        this.encoder = encoder;
    }

    @Override
    public void run(String... args) {
        String adminEmail = "admin@example.com";
        if (userRepo.findByEmail(adminEmail).isEmpty()) {
            User u = new User();
            u.setEmail(adminEmail);
            u.setFirstName("System");
            u.setLastName("Admin");
            u.setPassword(encoder.encode("admin"));
            u.setPhoneNumber("0000000000");
            u.setEnable(true);
            u.setVerified(true);
            u.setVerifiedResponse("Email verified successfully");

            // thêm roles USER + ADMIN
            u.getRoles().add(Role.USER);
            u.getRoles().add(Role.ADMIN);

            userRepo.save(u);
            System.out.println(">> Seeded admin user");
        }
    }
}

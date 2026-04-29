package com.bullshift.bullshift_backend.controller;

import com.bullshift.bullshift_backend.model.LoginRequest;
import com.bullshift.bullshift_backend.model.LoginResponse;
import com.bullshift.bullshift_backend.model.User;
import com.bullshift.bullshift_backend.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class LoginController {

    private final UserRepository userRepository; 
    // JPA repo for looking up and creating users

    public LoginController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {

        // Try to find an existing user with the given username
        return userRepository.findByUsername(request.getUsername())
                .map(user -> 
                        // If found → return a successful login response
                        new LoginResponse(true, "Login successful", user.getUsername())
                )
                .orElseGet(() -> {
                    // If not found → auto-create a new user
                    User newUser = new User(request.getUsername());
                    userRepository.save(newUser);

                    // Return a response indicating the user was created + logged in
                    return new LoginResponse(true, "User created and logged in", newUser.getUsername());
                });
    }
}

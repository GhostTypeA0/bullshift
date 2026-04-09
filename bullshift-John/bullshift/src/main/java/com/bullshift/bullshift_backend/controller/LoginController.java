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

    public LoginController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {

        return userRepository.findByUsername(request.getUsername())
                .map(user ->
                        new LoginResponse(true, "Login successful", user.getUsername())
                )
                .orElseGet(() -> {
                    User newUser = new User(request.getUsername());
                    userRepository.save(newUser);
                    return new LoginResponse(true, "User created and logged in", newUser.getUsername());
                });
    }
}

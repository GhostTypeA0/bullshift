package com.bullshift.bullshift_backend.controller;

import com.bullshift.bullshift_backend.model.LoginRequest;
import com.bullshift.bullshift_backend.model.LoginResponse;
import com.bullshift.bullshift_backend.model.User;
import com.bullshift.bullshift_backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // GET ALL USERS
    @GetMapping
    public ResponseEntity<?> getUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    // GET USER BY USERNAME
    // (Fixed: no Optional.map() generics conflict)
    @GetMapping("/{username}")
    public ResponseEntity<?> getUser(@PathVariable String username) {

        Optional<User> userOpt = userRepository.findByUsername(username);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404)
                    .body(Map.of("error", "User not found"));
        }

        return ResponseEntity.ok(userOpt.get());
    }

    // REGISTER USER
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {

        if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Username is required"));
        }

        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Password is required"));
        }

        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Username already exists"));
        }

        User newUser = new User(
                user.getUsername(),
                user.getEmail(),
                user.getPassword()
        );

        return ResponseEntity.ok(userRepository.save(newUser));
    }

    // LOGIN USER
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404)
                    .body(new LoginResponse(false, "User not found", null));
        }

        User user = userOpt.get();

        if (user.getPassword() != null &&
            user.getPassword().equals(request.getPassword())) {

            return ResponseEntity.ok(
                    new LoginResponse(true, "Login successful", user.getUsername())
            );
        }

        return ResponseEntity.status(401)
                .body(new LoginResponse(false, "Invalid password", null));
    }

    // UPDATE USER
    @PutMapping("/{username}")
    public ResponseEntity<?> updateUser(
            @PathVariable String username,
            @RequestBody User updatedUser) {

        Optional<User> userOpt = userRepository.findByUsername(username);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404)
                    .body(Map.of("error", "User not found"));
        }

        User user = userOpt.get();

        if (updatedUser.getEmail() != null) {
            user.setEmail(updatedUser.getEmail());
        }

        if (updatedUser.getPassword() != null) {
            user.setPassword(updatedUser.getPassword());
        }

        return ResponseEntity.ok(userRepository.save(user));
    }

    // DELETE USER
    @DeleteMapping("/{username}")
    public ResponseEntity<?> deleteUser(@PathVariable String username) {

        Optional<User> userOpt = userRepository.findByUsername(username);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404)
                    .body(Map.of("error", "User not found"));
        }

        userRepository.delete(userOpt.get());
        return ResponseEntity.noContent().build();
    }
}

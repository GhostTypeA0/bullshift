package com.bullshift.bullshift_backend.controller;

import com.bullshift.bullshift_backend.model.LoginRequest;
import com.bullshift.bullshift_backend.model.LoginResponse;
import com.bullshift.bullshift_backend.model.User;
import com.bullshift.bullshift_backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository; 
    // JPA repo for CRUD operations on users

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<User> getUsers() {
        // return all users in the system
        return userRepository.findAll();
    }

    @GetMapping("/{username}")
    public ResponseEntity<User> getUser(@PathVariable String username) {
        // return user if found, otherwise 404
        return userRepository.findByUsername(username)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User user) {
        // basic "create user" endpoint without password validation
        Optional<User> existing = userRepository.findByUsername(user.getUsername());
        if (existing.isPresent()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Username already exists"));
        }

        // save new user and return it
        return ResponseEntity.ok(userRepository.save(user));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {

        // validate username
        if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Username is required"));
        }

        // validate password
        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Password is required"));
        }

        // check if username already exists
        Optional<User> existing = userRepository.findByUsername(user.getUsername());
        if (existing.isPresent()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Username already exists"));
        }

        // create new user with username + email + password
        User newUser = new User(user.getUsername(), user.getEmail(), user.getPassword());
        return ResponseEntity.ok(userRepository.save(newUser));
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {

        // try to find user by username
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
        
        if (userOpt.isEmpty()) {
            // username doesn't exist
            return new LoginResponse(false, "User not found", null);
        }

        User user = userOpt.get();

        // check password match (simple plaintext check for now)
        if (user.getPassword() != null && user.getPassword().equals(request.getPassword())) {
            return new LoginResponse(true, "Login successful", user.getUsername());
        }

        // wrong password
        return new LoginResponse(false, "Invalid password", null);
    }

    @PutMapping("/{username}")
    public ResponseEntity<User> updateUser(@PathVariable String username, @RequestBody User updatedUser) {

        // find user to update
        Optional<User> userOpt = userRepository.findByUsername(username);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();

        // update email if provided
        if (updatedUser.getEmail() != null) {
            user.setEmail(updatedUser.getEmail());
        }

        // update password if provided
        if (updatedUser.getPassword() != null) {
            user.setPassword(updatedUser.getPassword());
        }

        // save updated user
        return ResponseEntity.ok(userRepository.save(user));
    }

    @DeleteMapping("/{username}")
    public ResponseEntity<Void> deleteUser(@PathVariable String username) {

        // find user to delete
        Optional<User> userOpt = userRepository.findByUsername(username);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // delete user and return 204
        userRepository.delete(userOpt.get());
        return ResponseEntity.noContent().build();
    }
}

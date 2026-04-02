package com.bullshift.bullshift_backend.model;

// Basic request object the frontend sends when a user tries to log in.
// Holds the raw username + password coming from the login form.
public class LoginRequest {

    // Username the user typed into the login box.
    private String username;

    // Password they entered. (We just carry it — validation happens elsewhere.)
    private String password;

    // Empty constructor required by Spring/Jackson when it deserializes JSON.
    public LoginRequest() {}

    // Convenience constructor if we ever want to build one manually.
    public LoginRequest(String username, String password) {
        this.username = username;
        this.password = password;
    }

    // Getters — used by Spring/Jackson to read the fields.
    public String getUsername() { return username; }
    public String getPassword() { return password; }
}

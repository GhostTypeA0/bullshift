package com.bullshift.bullshift_backend.model;

// Simple data object we send back to the frontend after a login attempt.
// Nothing fancy — just a clean container for the result.
public class LoginResponse {

    // true = login worked
    // false = bad credentials, user not found, etc.
    private boolean success;

    // readable message the frontend can display.
    // Example: "Login successful" or "Invalid username/password".
    private String message;

    // The username tied to the login attempt.
    // Only populated when login succeeds.
    private String username;

    // Constructor used when building the response in the controller/service layer.
    public LoginResponse(boolean success, String message, String username) {
        this.success = success;
        this.message = message;
        this.username = username;
    }

    // Basic getters — Spring/Jackson uses these when converting to JSON.
    public boolean isSuccess() { return success; }
    public String getMessage() { return message; }
    public String getUsername() { return username; }
}

package com.bullshift.bullshift_backend.model;

// Simple data object we send back to the frontend after a login attempt.
public class LoginResponse {

    private boolean success;
    private String message;
    private String username;

    public LoginResponse(boolean success, String message, String username) {
        this.success = success;
        this.message = message;
        this.username = username;
    }

    public boolean isSuccess() { return success; }
    public String getMessage() { return message; }
    public String getUsername() { return username; }
}

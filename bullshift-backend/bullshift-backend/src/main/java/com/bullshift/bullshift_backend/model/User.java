package com.bullshift.bullshift_backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    // primary key for the users table (auto-incremented by the DB)

    @Column(unique = true, nullable = false)
    private String username;
    // username must be unique + cannot be null (used for login + identity)

    private String email;
    // optional email field (can be null if user never sets one)

    private String password;
    // plaintext password for now — fine for school project, not for production

    // required by JPA — it needs an empty constructor to build objects
    public User() {}

    // constructor used when auto-creating a user (simple login flow)
    public User(String username) {
        this.username = username;
    }

    // full constructor used during registration
    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }

    // getters + setters (standard JPA boilerplate)
    public Long getId() { return id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}

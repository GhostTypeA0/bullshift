package com.bullshift.bullshift_backend.repository;

import com.bullshift.bullshift_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // This interface is the data-access layer for User entities.
    // Spring Data JPA auto-generates all basic CRUD operations:
    // findAll(), findById(), save(), delete(), etc.

    Optional<User> findByUsername(String username);
    // Spring auto-generates the SQL for this method based on the name.
    // Equivalent SQL:
    // SELECT * FROM users WHERE username = ?;
    //
    // Optional<User> is used because the user may or may not exist.
}

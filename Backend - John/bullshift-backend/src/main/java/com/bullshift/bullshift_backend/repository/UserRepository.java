package com.bullshift.bullshift_backend.repository;

import com.bullshift.bullshift_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}

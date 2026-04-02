package com.bullshift.bullshift_backend.repository;

import com.bullshift.bullshift_backend.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    // This interface is the data-access layer for Post entities.
    // Spring Data JPA auto-generates most SQL based on method names.

    List<Post> findAllByOrderByCreatedAtDesc();
    // auto-generated query:
    // SELECT * FROM posts ORDER BY created_at DESC;

    List<Post> findByUsernameOrderByCreatedAtDesc(String username);
    // auto-generated query:
    // SELECT * FROM posts WHERE username = ? ORDER BY created_at DESC;

    @Modifying
    @Query("UPDATE Post p SET p.likeCount = p.likeCount + 1 WHERE p.id = :id")
    void incrementLikeCount(@Param("id") Long id);
    // custom JPQL update — increments likeCount directly in the DB
    // faster + atomic (no need to load the entity first)

    @Modifying
    @Query("UPDATE Post p SET p.likeCount = p.likeCount - 1 WHERE p.id = :id AND p.likeCount > 0")
    void decrementLikeCount(@Param("id") Long id);
    // custom JPQL update — decrements likeCount but never below 0
    // protects against negative like counts
}

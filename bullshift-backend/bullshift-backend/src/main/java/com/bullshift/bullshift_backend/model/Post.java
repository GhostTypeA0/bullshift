package com.bullshift.bullshift_backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
// these two imports are currently unused
//import java.util.ArrayList;
//import java.util.List;

@Entity
@Table(name = "posts")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // primary key

    @Column(nullable = false)
    private String username; // user who created the post

    @Column(columnDefinition = "TEXT")
    private String image; // base64 image string (frontend sends this)

    @Column(columnDefinition = "TEXT")
    private String caption; // post caption text

    private int likeCount = 0; // simple like counter (no user tracking yet)

    private LocalDateTime createdAt; // timestamp when post is created
    private LocalDateTime updatedAt; // timestamp when post is updated

    // default constructor required by JPA
    public Post() {}

    // main constructor used when creating a new post
    public Post(String username, String image, String caption) {
        this.username = username;
        this.image = image;
        this.caption = caption;
        this.likeCount = 0; // initialize likes
    }

    // auto-set timestamps before insert
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    // auto-update timestamp before update
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // getters + setters (standard JPA boilerplate)
    public Long getId() { return id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public String getCaption() { return caption; }
    public void setCaption(String caption) { this.caption = caption; }
    public int getLikeCount() { return likeCount; }
    public void setLikeCount(int likeCount) { this.likeCount = likeCount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}

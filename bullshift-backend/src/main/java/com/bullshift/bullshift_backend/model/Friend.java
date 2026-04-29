package com.bullshift.bullshift_backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "friends")
public class Friend {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String user1;

    @Column(nullable = false)
    private String user2;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}

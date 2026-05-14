package com.bullshift.bullshift_backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "groupchats")
public class GroupChats {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long groupChatId;

    @Column(nullable = false)
    private String member1;

    @Column(nullable = false)
    private String member2;

    @Column(nullable = false)
    private String member3;

    private String member4;

    private String member5;

    private String member6;

    private String member7;

    private String member8;
}
package com.bullshift.bullshift_backend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "groupchatmessages")
public class GroupChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long groupChatMessagesId;

    private String sender;

    private Long groupChatId;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(columnDefinition = "TEXT")
    private String image;

    private LocalDateTime timestamp;

    public GroupChatMessage() {}

    public GroupChatMessage(String sender,
                            Long groupChatId,
                            String content,
                            String image,
                            LocalDateTime timestamp) {

        this.sender = sender;
        this.groupChatId = groupChatId;
        this.content = content;
        this.image = image;
        this.timestamp = timestamp;
    }

    public Long getId() {
        return groupChatMessagesId;
    }

    public String getSender() {
        return sender;
    }

    public Long getGroupChatId() {
        return groupChatId;
    }

    public String getContent() {
        return content;
    }

    public String getImage() {
        return image;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setId(Long id) {
        this.groupChatMessagesId = id;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public void setGroupChatId(Long groupId) {
        this.groupChatId = groupId;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
package com.bullshift.bullshift_backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; 
    // Auto‑increment primary key. Nothing special — DB handles this.

    private String sender;   
    // Username of whoever sent the message.

    private String receiver; 
    // Username of whoever the message is for.

    private String content;  
    // Actual text of the message.

    private LocalDateTime timestamp;
    // When the message was created. Set automatically before saving.

    public Message() {}
    // Empty constructor required by JPA.

    public Message(String sender, String receiver, String content, LocalDateTime timestamp) {
    this.sender = sender;
    this.receiver = receiver;
    this.content = content;
    this.timestamp = timestamp;
}


    @PrePersist
    protected void onCreate() {
        // Ensures timestamp is always set before saving to DB.
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }

    // Getters — used by Spring/Jackson when converting to JSON.
    public Long getId() { return id; }
    public String getSender() { return sender; }
    public String getReceiver() { return receiver; }
    public String getContent() { return content; }
    public LocalDateTime getTimestamp() { return timestamp; }

    // Optional setter if you ever need to override timestamps (rare).
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}

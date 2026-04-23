package com.bullshift.bullshift_backend.model;

// Simple DTO used for WebSocket communication.
// Not a JPA entity — this is only for sending/receiving chat payloads.
public class ChatMessage {

    // Username of the sender
    private String sender;

    // Username of the receiver (private 1:1 chat)
    private String receiver;

    // Actual text content of the message
    private String content;
    private String image;

    // Empty constructor required for JSON deserialization
    public ChatMessage() {}

    // Convenience constructor for manual creation
    public ChatMessage(String sender, String receiver, String content) {
        this.sender = sender;
        this.receiver = receiver;
        this.content = content;
    }

    // Standard getters/setters — used by Spring + WebSocket mapping
    public String getSender() { return sender; }
    public void setSender(String sender) { this.sender = sender; }

    public String getReceiver() { return receiver; }
    public void setReceiver(String receiver) { this.receiver = receiver; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

}

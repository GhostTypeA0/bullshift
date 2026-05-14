package com.bullshift.bullshift_backend.model;

public class ChatMessage {

    private String sender;
    private String receiver;
    private Long groupChatId;
    private String content;
    private String image;
    private String timestamp;

    public ChatMessage() {}

    public ChatMessage(String sender, String receiver, Long groupChatId, String content, String image, String timestamp) {
        this.sender = sender;
        this.receiver = receiver;
        this.groupChatId = groupChatId;
        this.content = content;
        this.image = image;
        this.timestamp = timestamp;
    }

    public String getSender() {
        return sender;
    }

    public String getReceiver() {
        return receiver;
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

    public String getTimestamp() {
        return timestamp;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public void setReceiver(String receiver) {
        this.receiver = receiver;
    }

    public void setGroupChatId(Long groupChatId) {
        this.groupChatId = groupChatId;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }
}

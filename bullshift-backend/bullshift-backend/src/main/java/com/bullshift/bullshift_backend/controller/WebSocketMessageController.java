package com.bullshift.bullshift_backend.controller;

import com.bullshift.bullshift_backend.model.ChatMessage;
import com.bullshift.bullshift_backend.model.Message;
import com.bullshift.bullshift_backend.repository.MessageRepository;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Controller
public class WebSocketMessageController {

    private final MessageRepository messageRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketMessageController(MessageRepository messageRepository,
                                      SimpMessagingTemplate messagingTemplate) {
        this.messageRepository = messageRepository;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Handles incoming WebSocket messages from /app/chat.sendMessage.
     * Saves the message to the DB, then sends it to both sender + receiver.
     */
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(ChatMessage chatMessage) {

        // Build a Message entity for the database.
        Message msg = new Message(
                chatMessage.getSender(),
                chatMessage.getReceiver(),
                chatMessage.getContent(),
                LocalDateTime.now() // timestamp for DB
        );

        // Save to DB
        messageRepository.save(msg);

        // Push message to the receiver's private queue
        messagingTemplate.convertAndSendToUser(
                chatMessage.getReceiver(),
                "/queue/messages",
                chatMessage
        );

        // Also send back to the sender so their UI updates instantly
        messagingTemplate.convertAndSendToUser(
                chatMessage.getSender(),
                "/queue/messages",
                chatMessage
        );
    }
}

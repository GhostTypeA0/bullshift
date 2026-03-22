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

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(ChatMessage chatMessage) {

        // Persist with backend timestamp (fixes PostgreSQL timestamp parsing)
        Message msg = new Message(
                chatMessage.getSender(),
                chatMessage.getReceiver(),
                chatMessage.getContent(),
                LocalDateTime.now()
        );
        messageRepository.save(msg);

        // Echo to receiver
        messagingTemplate.convertAndSendToUser(
                chatMessage.getReceiver(),
                "/queue/messages",
                chatMessage
        );

        // Echo to sender so they see their own message instantly
        messagingTemplate.convertAndSendToUser(
                chatMessage.getSender(),
                "/queue/messages",
                chatMessage
        );
    }
}

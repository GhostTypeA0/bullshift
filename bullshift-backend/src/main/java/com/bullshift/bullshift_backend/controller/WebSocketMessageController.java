package com.bullshift.bullshift_backend.controller;

import com.bullshift.bullshift_backend.model.ChatMessage;
import com.bullshift.bullshift_backend.model.Message;
import com.bullshift.bullshift_backend.repository.MessageRepository;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.util.Optional;

@Controller
public class WebSocketMessageController {

    private final MessageRepository messageRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketMessageController(MessageRepository messageRepository,
                                      SimpMessagingTemplate messagingTemplate) {
        this.messageRepository = messageRepository;
        this.messagingTemplate = messagingTemplate;
    }

    // SEND MESSAGE (unchanged except for image fix)
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(ChatMessage chatMessage) {

        Message msg = new Message(
                chatMessage.getSender(),
                chatMessage.getReceiver(),
                chatMessage.getContent(),
                chatMessage.getImage(),
                LocalDateTime.now()
        );

        // Save to DB
        Message saved = messageRepository.save(msg);

        // Attach ID so frontend knows which message this is
        chatMessage.setImage(msg.getImage()); // ensure image is included

        // Include message ID in WebSocket payload
        messagingTemplate.convertAndSendToUser(
                chatMessage.getReceiver(),
                "/queue/messages",
                saved
        );

        messagingTemplate.convertAndSendToUser(
                chatMessage.getSender(),
                "/queue/messages",
                saved
        );
    }

    // UNSEND / DELETE MESSAGE
    @MessageMapping("/chat.deleteMessage")
    public void deleteMessage(Long messageId) {

        Optional<Message> msgOpt = messageRepository.findById(messageId);
        if (msgOpt.isEmpty()) return;

        Message msg = msgOpt.get();

        // Delete from DB
        messageRepository.deleteById(messageId);

        // Notify both sender and receiver
        messagingTemplate.convertAndSendToUser(
                msg.getSender(),
                "/queue/delete",
                messageId
        );

        messagingTemplate.convertAndSendToUser(
                msg.getReceiver(),
                "/queue/delete",
                messageId
        );
    }
}

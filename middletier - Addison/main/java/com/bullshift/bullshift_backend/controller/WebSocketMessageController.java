package com.bullshift.bullshift_backend.controller;

import com.bullshift.bullshift_backend.model.ChatMessage;
import com.bullshift.bullshift_backend.model.Message;
import com.bullshift.bullshift_backend.model.GroupChatMessage;

import com.bullshift.bullshift_backend.repository.MessageRepository;
import com.bullshift.bullshift_backend.repository.GroupMessagesRepository;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Controller
public class WebSocketMessageController {

    private final MessageRepository messageRepository;
    private final GroupMessagesRepository groupMessagesRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketMessageController(
            MessageRepository messageRepository,
            GroupMessagesRepository groupMessagesRepository,
            SimpMessagingTemplate messagingTemplate
    ) {

        this.messageRepository = messageRepository;
        this.groupMessagesRepository = groupMessagesRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/chat.sendMessage")

    public void sendMessage(ChatMessage chatMessage) {
//Fix saved image
        Message msg = new Message(
                chatMessage.getSender(),
                chatMessage.getReceiver(),
                chatMessage.getContent(),
                chatMessage.getImage(),
                LocalDateTime.now()
        );

        // Save to DB
        messageRepository.save(msg);

        // Push message to receiver
        messagingTemplate.convertAndSendToUser(
                chatMessage.getReceiver(),
                "/queue/messages",
                chatMessage
        );

        // Push message back to sender
        messagingTemplate.convertAndSendToUser(
                chatMessage.getSender(),
                "/queue/messages",
                chatMessage
        );
    }

    @MessageMapping("/group.sendMessage")
    public void sendGroupMessage(ChatMessage chatMessage) {

        GroupChatMessage msg = new GroupChatMessage(
                chatMessage.getSender(),
                chatMessage.getGroupChatId(),
                chatMessage.getContent(),
                chatMessage.getImage(),
                LocalDateTime.now()
        );

        groupMessagesRepository.save(msg);

        messagingTemplate.convertAndSend(
                "/topic/group",
                chatMessage
        );
    }
}
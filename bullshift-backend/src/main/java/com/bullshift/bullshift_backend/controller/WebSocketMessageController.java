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
import java.util.Optional;

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

    // ---------------------------------------------------------
    // PRIVATE CHAT
    // ---------------------------------------------------------
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(ChatMessage chatMessage) {

        Message saved = messageRepository.save(
                new Message(
                        chatMessage.getSender(),
                        chatMessage.getReceiver(),
                        chatMessage.getContent(),
                        chatMessage.getImage(),
                        LocalDateTime.now()
                )
        );

        // receiver gets the message
        messagingTemplate.convertAndSendToUser(
                saved.getReceiver(),
                "/queue/messages",
                saved
        );

        // sender gets the message (frontend ignores it)
        messagingTemplate.convertAndSendToUser(
                saved.getSender(),
                "/queue/messages",
                saved
        );
    }

    // ---------------------------------------------------------
    // GROUP CHAT
    // ---------------------------------------------------------
    @MessageMapping("/group.sendMessage")
    public void sendGroupMessage(ChatMessage chatMessage) {

        GroupChatMessage saved = groupMessagesRepository.save(
                new GroupChatMessage(
                        chatMessage.getSender(),
                        chatMessage.getGroupChatId(),
                        chatMessage.getContent(),
                        chatMessage.getImage(),
                        LocalDateTime.now()
                )
        );

        messagingTemplate.convertAndSend(
                "/topic/group",
                saved
        );
    }

    // ---------------------------------------------------------
    // UNSEND PRIVATE MESSAGE
    // ---------------------------------------------------------
    @MessageMapping("/chat.deleteMessage")
    public void deleteMessage(Long messageId) {

        Optional<Message> msgOpt = messageRepository.findById(messageId);
        if (msgOpt.isEmpty()) return;

        Message msg = msgOpt.get();
        messageRepository.deleteById(messageId);

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

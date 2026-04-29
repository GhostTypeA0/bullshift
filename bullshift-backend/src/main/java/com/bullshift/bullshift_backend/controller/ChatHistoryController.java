package com.bullshift.bullshift_backend.controller;

import com.bullshift.bullshift_backend.model.Message;
import com.bullshift.bullshift_backend.repository.MessageRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatHistoryController {

    private final MessageRepository messageRepository;

    public ChatHistoryController(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    @GetMapping("/{sender}/{receiver}")
    public List<Message> getChatHistory(@PathVariable String sender,
                                        @PathVariable String receiver) {

        return messageRepository.findChatHistory(sender, receiver);
    }
}

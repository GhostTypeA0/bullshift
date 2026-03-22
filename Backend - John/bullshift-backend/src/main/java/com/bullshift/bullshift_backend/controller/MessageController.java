package com.bullshift.bullshift_backend.controller;

import com.bullshift.bullshift_backend.model.Message;
import com.bullshift.bullshift_backend.repository.MessageRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin
public class MessageController {

    private final MessageRepository messageRepository;

    public MessageController(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    @GetMapping
    public List<Message> getMessages() {
        return messageRepository.findAll();
    }

    @PostMapping
    public Message sendMessage(@RequestBody Message message) {
        return messageRepository.save(message);
    }
}

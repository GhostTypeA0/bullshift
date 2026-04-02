package com.bullshift.bullshift_backend.controller;

import com.bullshift.bullshift_backend.model.Message;
import com.bullshift.bullshift_backend.repository.MessageRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageRepository messageRepository; 
    // JPA repo for saving + loading chat messages

    public MessageController(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    @GetMapping
    public List<Message> getMessages() {
        // return all messages in the database (mainly for debugging/testing)
        return messageRepository.findAll();
    }

    @PostMapping
    public Message sendMessage(@RequestBody Message message) {

        // frontend may or may not send a timestamp
        // if missing → set it here so messages always have a consistent timestamp
        if (message.getTimestamp() == null) {
            message.setTimestamp(LocalDateTime.now());
        }

        // save message to DB and return the saved entity
        return messageRepository.save(message);
    }
}

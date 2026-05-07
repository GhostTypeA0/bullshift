package com.bullshift.bullshift_backend.controller;

import com.bullshift.bullshift_backend.model.Message;
import com.bullshift.bullshift_backend.repository.MessageRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/messages")   // base path
public class MessageController {

    private final MessageRepository messageRepository;

    public MessageController(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    // get all messages (mostly for debugging)
    @GetMapping
    public List<Message> getMessages() {
        return messageRepository.findAll();
    }

    // save a message (not used by chat.js anymore, but kept for compatibility)
    @PostMapping
    public Message sendMessage(@RequestBody Message message) {

        if (message.getTimestamp() == null) {
            message.setTimestamp(LocalDateTime.now());
        }

        return messageRepository.save(message);
    }

    // delete message by ID (used for UNSEND)
    @DeleteMapping("/chat/message/{id}")
    public ResponseEntity<?> deleteMessage(@PathVariable Long id) {

        if (!messageRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Message not found");
        }

        messageRepository.deleteById(id);
        return ResponseEntity.ok("Message deleted");
    }
}

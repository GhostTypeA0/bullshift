package com.bullshift.bullshift_backend.controller;

import com.bullshift.bullshift_backend.model.GroupChatMessage;
import com.bullshift.bullshift_backend.repository.GroupMessagesRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groupmessages")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class GroupChatHistoryController {

    private final GroupMessagesRepository repository;

    @GetMapping("/{groupChatId}")
    public List<GroupChatMessage> getMessages(
            @PathVariable Long groupChatId
    ) {

        return repository.findByGroupChatIdOrderByTimestampAsc(groupChatId);
    }
}
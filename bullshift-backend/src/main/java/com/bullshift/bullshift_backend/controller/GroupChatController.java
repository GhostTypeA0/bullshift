package com.bullshift.bullshift_backend.controller;

import com.bullshift.bullshift_backend.model.GroupChats;
import com.bullshift.bullshift_backend.repository.GroupChatsRepository;

import lombok.Data;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groupchats")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class GroupChatController {

    private final GroupChatsRepository repository;

    @PostMapping("/create")
    public String createGroup(@RequestBody GroupChats group) {


        repository.save(group);

        return "Group chat created";

    }

    @GetMapping("/create")
    public List<GroupChats> getAllGroups() {
        return repository.findAll();
    }

    @GetMapping("/{username}")
    public List<GroupChats> getGroupsForUser(
            @PathVariable String username
    ) {

        return repository.findByMember1OrMember2OrMember3OrMember4OrMember5OrMember6OrMember7OrMember8(
                username,
                username,
                username,
                username,
                username,
                username,
                username,
                username
        );
    }

}
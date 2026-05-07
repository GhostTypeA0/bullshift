package com.bullshift.bullshift_backend.controller;

import com.bullshift.bullshift_backend.model.Friend;
import com.bullshift.bullshift_backend.model.FriendRequest;
import com.bullshift.bullshift_backend.service.FriendService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FriendController {

    private final FriendService friendService;

    @PostMapping("/request")
    public String sendRequest(@RequestBody FriendRequestDTO dto) {
        return friendService.sendRequest(dto.sender, dto.receiver);
    }

    @PostMapping("/accept/{id}")
    public String accept(@PathVariable Long id) {
        return friendService.acceptRequest(id);
    }

    @PostMapping("/decline/{id}")
    public String decline(@PathVariable Long id) {
        return friendService.declineRequest(id);
    }

    @GetMapping("/{username}")
    public List<Friend> getFriends(@PathVariable String username) {
        return friendService.getFriends(username);
    }

    @GetMapping("/requests/{username}")
    public List<FriendRequest> getRequests(@PathVariable String username) {
        return friendService.getPendingRequests(username);
    }

    @Data
    public static class FriendRequestDTO {
        public String sender;
        public String receiver;
    }
}

//Repo, Modal, Controller, Websockets, and Servicing Config 
//Authors: John Nottom, Addison S

package com.bullshift.bullshift_backend.service;

import com.bullshift.bullshift_backend.model.Friend;
import com.bullshift.bullshift_backend.model.FriendRequest;
import com.bullshift.bullshift_backend.repository.FriendRepository;
import com.bullshift.bullshift_backend.repository.FriendRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FriendService {

    private final FriendRepository friendRepository;
    private final FriendRequestRepository friendRequestRepository;

    // SEND FRIEND REQUEST
    public String sendRequest(String sender, String receiver) {

        if (sender.equals(receiver)) {
            return "You cannot add yourself.";
        }

        // Already friends?
        if (friendRepository.existsByUser1AndUser2(sender, receiver) ||
            friendRepository.existsByUser2AndUser1(sender, receiver)) {
            return "Already friends.";
        }

        // Request already sent?
        List<FriendRequest> existing =
                friendRequestRepository.findBySenderAndReceiver(sender, receiver);

        if (!existing.isEmpty()) {
            return "Friend request already sent.";
        }

        // Create new request
        FriendRequest req = new FriendRequest();
        req.setSender(sender);
        req.setReceiver(receiver);
        req.setStatus("PENDING");

        friendRequestRepository.save(req);
        return "Friend request sent.";
    }

    // ACCEPT REQUEST
    public String acceptRequest(Long requestId) {

        Optional<FriendRequest> reqOpt = friendRequestRepository.findById(requestId);

        if (reqOpt.isEmpty()) {
            return "Request not found.";
        }

        FriendRequest req = reqOpt.get();
        req.setStatus("ACCEPTED");
        friendRequestRepository.save(req);

        // Create friendship
        Friend f = new Friend();
        f.setUser1(req.getSender());
        f.setUser2(req.getReceiver());
        friendRepository.save(f);

        return "Friend request accepted.";
    }

    // DECLINE REQUEST
    public String declineRequest(Long requestId) {

        Optional<FriendRequest> reqOpt = friendRequestRepository.findById(requestId);

        if (reqOpt.isEmpty()) {
            return "Request not found.";
        }

        FriendRequest req = reqOpt.get();
        req.setStatus("DECLINED");
        friendRequestRepository.save(req);

        return "Friend request declined.";
    }

    // GET PENDING REQUESTS
    public List<FriendRequest> getPendingRequests(String username) {
        return friendRequestRepository.findByReceiverAndStatus(username, "PENDING");
    }

    // GET FRIEND LIST
    public List<Friend> getFriends(String username) {
        return friendRepository.findByUser1OrUser2(username, username);
    }
}

package com.bullshift.bullshift_backend.repository;

import com.bullshift.bullshift_backend.model.FriendRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FriendRequestRepository extends JpaRepository<FriendRequest, Long> {

    List<FriendRequest> findByReceiverAndStatus(String receiver, String status);

    List<FriendRequest> findBySenderAndReceiver(String sender, String receiver);

    List<FriendRequest> findBySenderOrReceiver(String sender, String receiver);
}

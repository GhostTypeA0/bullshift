package com.bullshift.bullshift_backend.repository;

import com.bullshift.bullshift_backend.model.Friend;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FriendRepository extends JpaRepository<Friend, Long> {

    List<Friend> findByUser1OrUser2(String user1, String user2);

    boolean existsByUser1AndUser2(String user1, String user2);

    boolean existsByUser2AndUser1(String user1, String user2);
}

package com.bullshift.bullshift_backend.repository;

import com.bullshift.bullshift_backend.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("""
        SELECT m FROM Message m
        WHERE (m.sender = :user1 AND m.receiver = :user2)
        OR    (m.sender = :user2 AND m.receiver = :user1)
        ORDER BY m.id ASC
    """)
    List<Message> findChatHistory(String user1, String user2);
}

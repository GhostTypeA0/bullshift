package com.bullshift.bullshift_backend.repository;

import com.bullshift.bullshift_backend.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findBySenderAndReceiverOrderByIdAsc(String sender, String receiver);

    // For bidirectional history if you want both directions:
    List<Message> findBySenderAndReceiverOrSenderAndReceiverOrderByIdAsc(
            String sender1, String receiver1,
            String sender2, String receiver2
    );
}

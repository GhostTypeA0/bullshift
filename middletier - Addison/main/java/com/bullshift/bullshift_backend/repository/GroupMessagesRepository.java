package com.bullshift.bullshift_backend.repository;

import com.bullshift.bullshift_backend.model.GroupChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupMessagesRepository
        extends JpaRepository<GroupChatMessage, Long> {

    List<GroupChatMessage> findByGroupChatIdOrderByTimestampAsc(Long groupChatId);
}

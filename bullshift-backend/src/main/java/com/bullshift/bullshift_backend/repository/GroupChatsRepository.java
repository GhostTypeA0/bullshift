package com.bullshift.bullshift_backend.repository;

import com.bullshift.bullshift_backend.model.GroupChats;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GroupChatsRepository extends JpaRepository<GroupChats, Long> {

    List<GroupChats> findByMember1(String member1);

    List<GroupChats> findByMember2(String member2);

    List<GroupChats> findByMember3(String member3);

    List<GroupChats> findByMember1OrMember2OrMember3(
            String member1,
            String member2,
            String member3
    );

    List<GroupChats> findByMember1OrMember2OrMember3OrMember4OrMember5OrMember6OrMember7OrMember8(
            String member1,
            String member2,
            String member3,
            String member4,
            String member5,
            String member6,
            String member7,
            String member8
    );
}
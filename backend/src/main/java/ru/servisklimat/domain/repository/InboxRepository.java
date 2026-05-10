package ru.servisklimat.domain.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.servisklimat.domain.model.InboxMessage;
import ru.servisklimat.domain.model.enums.Channel;

import java.util.UUID;

@Repository
public interface InboxRepository extends JpaRepository<InboxMessage, UUID> {

    Page<InboxMessage> findByIsReadFalse(Pageable pageable);

    Page<InboxMessage> findByClientId(UUID clientId, Pageable pageable);

    Page<InboxMessage> findByChannel(Channel channel, Pageable pageable);
}

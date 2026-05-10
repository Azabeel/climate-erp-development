package ru.servisklimat.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.servisklimat.domain.model.AiConversation;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AiConversationRepository extends JpaRepository<AiConversation, UUID> {

    List<AiConversation> findByWorkOrderId(UUID workOrderId);

    Optional<AiConversation> findFirstByWorkOrderIdOrderByCreatedAtDesc(UUID workOrderId);
}

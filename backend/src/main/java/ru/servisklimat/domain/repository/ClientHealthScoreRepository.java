package ru.servisklimat.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.servisklimat.domain.model.ClientHealthScore;

import java.util.Optional;
import java.util.UUID;

public interface ClientHealthScoreRepository extends JpaRepository<ClientHealthScore, UUID> {
    Optional<ClientHealthScore> findByClientId(UUID clientId);
}

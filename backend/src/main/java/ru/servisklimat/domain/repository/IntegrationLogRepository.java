package ru.servisklimat.domain.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.servisklimat.domain.model.IntegrationLog;

import java.util.UUID;

@Repository
public interface IntegrationLogRepository extends JpaRepository<IntegrationLog, UUID> {

    Page<IntegrationLog> findBySystem(String system, Pageable pageable);
}

package ru.servisklimat.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.servisklimat.domain.model.EngineerCertification;

import java.util.List;
import java.util.UUID;

@Repository
public interface EngineerCertificationRepository extends JpaRepository<EngineerCertification, UUID> {

    List<EngineerCertification> findByEngineerId(UUID engineerId);
}

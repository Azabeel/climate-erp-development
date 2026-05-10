package ru.servisklimat.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.servisklimat.domain.model.SLAConfig;

import java.util.List;
import java.util.UUID;

@Repository
public interface SLAConfigRepository extends JpaRepository<SLAConfig, UUID> {

    List<SLAConfig> findByLevelAndIsActiveTrue(String level);
}

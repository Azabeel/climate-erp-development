package ru.servisklimat.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.servisklimat.domain.model.SystemSettings;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SystemSettingsRepository extends JpaRepository<SystemSettings, UUID> {

    Optional<SystemSettings> findByKey(String key);
}

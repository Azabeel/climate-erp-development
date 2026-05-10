package ru.servisklimat.domain.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.servisklimat.domain.model.Engineer;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EngineerRepository extends JpaRepository<Engineer, UUID> {

    Page<Engineer> findByIsActiveTrue(Pageable pageable);

    Optional<Engineer> findByUserId(UUID userId);

    List<Engineer> findByIsActiveTrueAndUseInAutoSchedulerTrue();
}

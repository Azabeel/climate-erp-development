package ru.servisklimat.domain.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import ru.servisklimat.domain.model.Deal;
import ru.servisklimat.domain.model.enums.DealStage;

import java.util.List;
import java.util.UUID;

public interface DealRepository extends JpaRepository<Deal, UUID> {
    Page<Deal> findByClientId(UUID clientId, Pageable pageable);
    List<Deal> findByStageNotIn(List<DealStage> stages);
    Page<Deal> findByStage(DealStage stage, Pageable pageable);
}

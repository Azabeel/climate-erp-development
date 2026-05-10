package ru.servisklimat.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.servisklimat.domain.model.MaintenancePlan;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface MaintenancePlanRepository extends JpaRepository<MaintenancePlan, UUID> {

    List<MaintenancePlan> findByEquipmentId(UUID equipmentId);

    List<MaintenancePlan> findByNextDueDateBefore(LocalDate date);

    List<MaintenancePlan> findByEquipmentIdAndIsActiveTrue(UUID equipmentId);
}

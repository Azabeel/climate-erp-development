package ru.servisklimat.domain.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.servisklimat.domain.model.Equipment;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, UUID> {

    Page<Equipment> findByClientId(UUID clientId, Pageable pageable);

    List<Equipment> findByLocationId(UUID locationId);

    Page<Equipment> findByIsActiveTrue(Pageable pageable);

    @Query("SELECT e FROM Equipment e WHERE e.isActive = true " +
           "AND e.lastServiceDate IS NOT NULL " +
           "AND e.lastServiceDate <= :cutoffDate")
    List<Equipment> findDueForMaintenance(@Param("cutoffDate") LocalDate cutoffDate);
}

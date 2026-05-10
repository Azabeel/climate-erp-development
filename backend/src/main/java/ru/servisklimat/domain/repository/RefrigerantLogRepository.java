package ru.servisklimat.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.servisklimat.domain.model.RefrigerantLog;
import ru.servisklimat.domain.model.enums.RefrigerantOperation;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface RefrigerantLogRepository extends JpaRepository<RefrigerantLog, UUID> {

    List<RefrigerantLog> findByEquipmentId(UUID equipmentId);

    List<RefrigerantLog> findByWorkOrderId(UUID workOrderId);

    @Query("SELECT SUM(r.amountKg) FROM RefrigerantLog r " +
           "WHERE r.equipmentId = :equipmentId " +
           "AND r.operationType IN :types " +
           "AND r.createdAt BETWEEN :from AND :to")
    BigDecimal sumAmountByEquipmentAndTypesBetween(
            @Param("equipmentId") UUID equipmentId,
            @Param("types") List<RefrigerantOperation> types,
            @Param("from") ZonedDateTime from,
            @Param("to") ZonedDateTime to);
}

package ru.servisklimat.domain.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.servisklimat.domain.model.WorkOrder;
import ru.servisklimat.domain.model.enums.WorkOrderStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkOrderRepository extends JpaRepository<WorkOrder, UUID> {

    Page<WorkOrder> findByStatusIn(List<WorkOrderStatus> statuses, Pageable pageable);

    Page<WorkOrder> findByClientId(UUID clientId, Pageable pageable);

    Page<WorkOrder> findByEngineerId(UUID engineerId, Pageable pageable);

    List<WorkOrder> findByStatusInAndSlaViolatedFalse(List<WorkOrderStatus> statuses);

    Optional<WorkOrder> findByNumber(String number);

    List<WorkOrder> findByEquipmentId(UUID equipmentId);
}

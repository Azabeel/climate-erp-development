package ru.servisklimat.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.servisklimat.domain.model.WorkOrderStatusLog;

import java.util.List;
import java.util.UUID;

@Repository
public interface WorkOrderStatusLogRepository extends JpaRepository<WorkOrderStatusLog, UUID> {

    List<WorkOrderStatusLog> findByWorkOrderIdOrderByChangedAtAsc(UUID workOrderId);
}

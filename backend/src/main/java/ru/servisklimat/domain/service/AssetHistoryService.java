package ru.servisklimat.domain.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.servisklimat.domain.model.RefrigerantLog;
import ru.servisklimat.domain.model.WorkOrder;
import ru.servisklimat.domain.repository.MaintenancePlanRepository;
import ru.servisklimat.domain.repository.RefrigerantLogRepository;
import ru.servisklimat.domain.repository.WorkOrderRepository;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

/**
 * Aggregates the chronological event history for a single piece of equipment
 * from multiple data sources: work orders, refrigerant logs, and maintenance plans.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AssetHistoryService {

    private final WorkOrderRepository workOrderRepository;
    private final RefrigerantLogRepository refrigerantLogRepository;
    private final MaintenancePlanRepository maintenancePlanRepository;

    /**
     * Immutable event record representing a single historical entry.
     */
    public record AssetEvent(
            UUID id,
            String eventType,
            String description,
            ZonedDateTime occurredAt,
            UUID relatedEntityId
    ) {}

    /**
     * Returns all known events for the given equipment, sorted newest first.
     *
     * @param equipmentId UUID of the equipment
     * @return list of {@link AssetEvent} sorted by {@code occurredAt} descending
     */
    public List<AssetEvent> getHistory(UUID equipmentId) {
        List<AssetEvent> events = new ArrayList<>();

        // 1. Work orders linked to this equipment
        workOrderRepository.findByEquipmentId(equipmentId)
                .forEach(wo -> events.add(toWorkOrderEvent(wo)));

        // 2. Refrigerant log entries
        refrigerantLogRepository.findByEquipmentId(equipmentId)
                .forEach(log -> events.add(toRefrigerantEvent(log)));

        // 3. Maintenance plans (informational — the plan itself is an event)
        maintenancePlanRepository.findByEquipmentId(equipmentId)
                .forEach(plan -> {
                    if (plan.getLastDoneDate() != null) {
                        events.add(new AssetEvent(
                                plan.getId(),
                                "MAINTENANCE_DONE",
                                "Выполнено ТО: " + plan.getName(),
                                plan.getLastDoneDate().atStartOfDay(java.time.ZoneId.of("Europe/Moscow")),
                                plan.getId()
                        ));
                    }
                });

        events.sort(Comparator.comparing(AssetEvent::occurredAt).reversed());
        return events;
    }

    // ─── private helpers ──────────────────────────────────────────────────────

    private AssetEvent toWorkOrderEvent(WorkOrder wo) {
        ZonedDateTime occurred = wo.getActualEnd() != null ? wo.getActualEnd()
                : (wo.getCreatedAt() != null ? wo.getCreatedAt() : ZonedDateTime.now());
        return new AssetEvent(
                wo.getId(),
                "WORK_ORDER_" + wo.getStatus().name(),
                "Наряд " + wo.getNumber() + " — " + wo.getType().name(),
                occurred,
                wo.getId()
        );
    }

    private AssetEvent toRefrigerantEvent(RefrigerantLog log) {
        return new AssetEvent(
                log.getId(),
                "REFRIGERANT_" + log.getOperationType().name(),
                "Операция с хладагентом: " + log.getOperationType().name()
                        + ", " + log.getAmountKg() + " кг",
                log.getCreatedAt() != null ? log.getCreatedAt() : ZonedDateTime.now(),
                log.getWorkOrderId()
        );
    }
}

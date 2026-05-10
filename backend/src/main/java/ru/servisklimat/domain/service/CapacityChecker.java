package ru.servisklimat.domain.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ru.servisklimat.domain.model.enums.WorkOrderStatus;
import ru.servisklimat.domain.repository.WorkOrderRepository;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Checks whether an engineer has capacity (available slots) on a given date.
 * Counts WorkOrders assigned to the engineer with scheduledStart on that date,
 * excluding terminal statuses (COMPLETED, CLOSED, CANCELLED).
 */
@Component
@RequiredArgsConstructor
public class CapacityChecker {

    private static final ZoneId MOSCOW = ZoneId.of("Europe/Moscow");

    private static final Set<WorkOrderStatus> ACTIVE_STATUSES = EnumSet.of(
            WorkOrderStatus.NEW,
            WorkOrderStatus.ASSIGNED,
            WorkOrderStatus.EN_ROUTE,
            WorkOrderStatus.ON_SITE,
            WorkOrderStatus.IN_PROGRESS,
            WorkOrderStatus.AWAITING_PARTS,
            WorkOrderStatus.READY_TO_RESUME
    );

    private final WorkOrderRepository workOrderRepository;

    /**
     * Returns true if the engineer has fewer than maxCapacity active orders on the given date.
     *
     * @param engineerId  the engineer's UUID
     * @param date        the date to check
     * @param maxCapacity maximum allowed orders per day (default 5)
     * @return true if engineer has capacity
     */
    public boolean hasCapacity(UUID engineerId, LocalDate date, int maxCapacity) {
        return getCurrentLoad(engineerId, date) < maxCapacity;
    }

    /**
     * Returns the current number of active work orders for an engineer on a given date.
     *
     * @param engineerId engineer UUID
     * @param date       date to check
     * @return count of active orders scheduled on that date
     */
    public int getCurrentLoad(UUID engineerId, LocalDate date) {
        ZonedDateTime dayStart = date.atStartOfDay(MOSCOW);
        ZonedDateTime dayEnd   = dayStart.plusDays(1);

        // Load all orders for this engineer (from both engineer_id and second_engineer_id)
        // and filter by scheduled date and active status
        return (int) workOrderRepository.findByEngineerId(engineerId,
                        org.springframework.data.domain.Pageable.unpaged())
                .stream()
                .filter(wo -> ACTIVE_STATUSES.contains(wo.getStatus()))
                .filter(wo -> wo.getScheduledStart() != null)
                .filter(wo -> {
                    ZonedDateTime start = wo.getScheduledStart();
                    return !start.isBefore(dayStart) && start.isBefore(dayEnd);
                })
                .count();
    }
}

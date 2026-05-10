package ru.servisklimat.domain.service;

import org.springframework.stereotype.Component;
import ru.servisklimat.domain.model.WorkOrder;
import ru.servisklimat.domain.model.WorkOrderStatusLog;
import ru.servisklimat.domain.model.enums.WorkOrderStatus;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.EnumMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import static ru.servisklimat.domain.model.enums.WorkOrderStatus.*;

@Component
public class WorkOrderStateMachine {

    private static final ZoneId MOSCOW = ZoneId.of("Europe/Moscow");

    private static final Map<WorkOrderStatus, Set<WorkOrderStatus>> TRANSITIONS;

    static {
        TRANSITIONS = new EnumMap<>(WorkOrderStatus.class);
        TRANSITIONS.put(NEW,             Set.of(ASSIGNED));
        TRANSITIONS.put(ASSIGNED,        Set.of(EN_ROUTE, CANCELLED));
        TRANSITIONS.put(EN_ROUTE,        Set.of(ON_SITE, ASSIGNED));
        TRANSITIONS.put(ON_SITE,         Set.of(IN_PROGRESS, ASSIGNED));
        TRANSITIONS.put(IN_PROGRESS,     Set.of(AWAITING_PARTS, COMPLETED, ASSIGNED));
        TRANSITIONS.put(AWAITING_PARTS,  Set.of(READY_TO_RESUME, CANCELLED));
        TRANSITIONS.put(READY_TO_RESUME, Set.of(ASSIGNED, IN_PROGRESS));
        TRANSITIONS.put(COMPLETED,       Set.of(CLOSED));
        TRANSITIONS.put(CLOSED,          Set.of());
        TRANSITIONS.put(CANCELLED,       Set.of());
    }

    /**
     * Transitions the work order to a new status, applying side effects,
     * and appending a status log entry.
     *
     * @throws InvalidStateTransitionException if the transition is not permitted
     */
    public void transition(WorkOrder order, WorkOrderStatus newStatus, UUID changedBy, String comment) {
        WorkOrderStatus current = order.getStatus();
        if (!canTransition(current, newStatus)) {
            throw new InvalidStateTransitionException(current, newStatus);
        }

        ZonedDateTime now = ZonedDateTime.now(MOSCOW);

        // Side effects per target status
        switch (newStatus) {
            case EN_ROUTE -> {
                if (order.getActualStart() == null) {
                    order.setActualStart(now);
                }
                order.setSlaTtoActual(now);
            }
            case COMPLETED -> {
                order.setActualEnd(now);
                order.setSlaTtfActual(now);
                order.setClosedAt(now);
            }
            case CLOSED -> {
                if (order.getClosedAt() == null) {
                    order.setClosedAt(now);
                }
            }
            default -> { /* no special side effects */ }
        }

        // Append status log entry
        WorkOrderStatusLog logEntry = WorkOrderStatusLog.builder()
                .workOrder(order)
                .oldStatus(current)
                .newStatus(newStatus)
                .comment(comment)
                .changedBy(changedBy)
                .changedAt(now)
                .build();
        order.getStatusLogs().add(logEntry);

        order.setStatus(newStatus);
    }

    public boolean canTransition(WorkOrderStatus from, WorkOrderStatus to) {
        return TRANSITIONS.getOrDefault(from, Set.of()).contains(to);
    }
}

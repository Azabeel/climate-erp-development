package ru.servisklimat.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import ru.servisklimat.domain.model.WorkOrder;
import ru.servisklimat.domain.model.enums.SLAStatus;
import ru.servisklimat.domain.model.enums.WorkOrderStatus;
import ru.servisklimat.domain.repository.WorkOrderRepository;
import ru.servisklimat.domain.service.NotificationService;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;

/**
 * Runs every 5 minutes and monitors SLA compliance for all active work orders.
 *
 * <p>For each active work order the scheduler checks the TTF deadline:
 * <ul>
 *   <li>If remaining time <= 0 and RED not yet notified → set slaStatus=RED,
 *       slaViolated=true, slaNotifiedRed=true and send alert.</li>
 *   <li>If remaining time percentage <= warningPercent and YELLOW not yet notified
 *       → set slaStatus=YELLOW, slaNotifiedYellow=true and send warning.</li>
 * </ul>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SLAMonitoringScheduler {

    private static final ZoneId MOSCOW = ZoneId.of("Europe/Moscow");
    private static final int DEFAULT_WARNING_PERCENT = 20;

    /** Statuses that are still "active" (not yet terminal). */
    private static final List<WorkOrderStatus> ACTIVE_STATUSES = List.of(
            WorkOrderStatus.NEW,
            WorkOrderStatus.ASSIGNED,
            WorkOrderStatus.EN_ROUTE,
            WorkOrderStatus.ON_SITE,
            WorkOrderStatus.IN_PROGRESS,
            WorkOrderStatus.AWAITING_PARTS,
            WorkOrderStatus.READY_TO_RESUME
    );

    private final WorkOrderRepository workOrderRepository;
    private final NotificationService notificationService;

    @Scheduled(fixedRate = 300_000)
    @Transactional
    public void checkSLA() {
        ZonedDateTime now = ZonedDateTime.now(MOSCOW);
        List<WorkOrder> orders = workOrderRepository.findByStatusInAndSlaViolatedFalse(ACTIVE_STATUSES);

        log.debug("SLA monitoring: checking {} active work orders", orders.size());

        for (WorkOrder order : orders) {
            try {
                checkOrderSLA(order, now);
            } catch (Exception e) {
                log.error("Error checking SLA for work order {}: {}", order.getNumber(), e.getMessage());
            }
        }
    }

    private void checkOrderSLA(WorkOrder order, ZonedDateTime now) {
        ZonedDateTime ttfPlanned = order.getSlaTtfPlanned();
        if (ttfPlanned == null) {
            return; // SLA not set for this order
        }

        long totalDurationMillis = order.getCreatedAt() != null
                ? java.time.Duration.between(order.getCreatedAt(), ttfPlanned).toMillis()
                : -1;

        long remainingMillis = java.time.Duration.between(now, ttfPlanned).toMillis();

        // Calculate remaining percentage
        double remainingPercent = (totalDurationMillis > 0)
                ? (double) remainingMillis / totalDurationMillis * 100.0
                : (remainingMillis > 0 ? 100.0 : 0.0);

        int warningPercent = (order.getSlaConfig() != null
                && order.getSlaConfig().getWarningPercent() != null)
                ? order.getSlaConfig().getWarningPercent()
                : DEFAULT_WARNING_PERCENT;

        // RED: deadline passed
        if (remainingMillis <= 0 && !order.isSlaNotifiedRed()) {
            order.setSlaStatus(SLAStatus.RED);
            order.setSlaViolated(true);
            order.setSlaNotifiedRed(true);
            workOrderRepository.save(order);

            notificationService.sendNotification(
                    order.getId(),
                    "SLA_RED",
                    String.format("SLA НАРУШЕН! Наряд %s просрочен. Клиент: %s",
                            order.getNumber(),
                            order.getClient() != null ? order.getClient().getName() : ""),
                    null
            );
            log.warn("SLA RED: work order {} is overdue", order.getNumber());
            return;
        }

        // YELLOW: approaching deadline
        if (remainingPercent <= warningPercent && remainingMillis > 0 && !order.isSlaNotifiedYellow()) {
            order.setSlaStatus(SLAStatus.YELLOW);
            order.setSlaNotifiedYellow(true);
            workOrderRepository.save(order);

            notificationService.sendNotification(
                    order.getId(),
                    "SLA_YELLOW",
                    String.format("SLA предупреждение! Наряд %s — осталось %.1f%% времени. Клиент: %s",
                            order.getNumber(),
                            remainingPercent,
                            order.getClient() != null ? order.getClient().getName() : ""),
                    null
            );
            log.info("SLA YELLOW: work order {} approaching deadline ({} % remaining)",
                    order.getNumber(), String.format("%.1f", remainingPercent));
        }
    }
}

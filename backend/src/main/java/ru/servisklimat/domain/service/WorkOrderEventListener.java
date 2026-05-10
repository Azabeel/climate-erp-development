package ru.servisklimat.domain.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import ru.servisklimat.domain.model.WorkOrder;
import ru.servisklimat.domain.model.enums.WorkOrderStatus;

import java.time.format.DateTimeFormatter;

/**
 * Listens to {@link WorkOrderStatusChangedEvent} and sends client-facing
 * notifications for the relevant status transitions.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class WorkOrderEventListener {

    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm");

    private final NotificationService notificationService;

    @EventListener
    public void onStatusChanged(WorkOrderStatusChangedEvent event) {
        WorkOrder order = event.getWorkOrder();
        WorkOrderStatus newStatus = event.getNewStatus();

        switch (newStatus) {
            case ASSIGNED -> notifyAssigned(order);
            case EN_ROUTE -> notifyEnRoute(order);
            case COMPLETED -> notifyCompleted(order);
            default -> { /* no client notification for other transitions */ }
        }
    }

    private void notifyAssigned(WorkOrder order) {
        String engineerName = order.getEngineer() != null
                ? order.getEngineer().getFullName()
                : "Инженер";

        String scheduledTime = order.getScheduledStart() != null
                ? order.getScheduledStart().format(DATE_FMT)
                : "уточняется";

        String message = String.format(
                "Заявка принята. Инженер %s приедет %s", engineerName, scheduledTime);

        sendClientNotification(order, "CLIENT_ASSIGNED", message);
    }

    private void notifyEnRoute(WorkOrder order) {
        String engineerName = order.getEngineer() != null
                ? order.getEngineer().getFullName()
                : "Инженер";

        String message = String.format("Инженер %s выехал. Ожидайте.", engineerName);
        sendClientNotification(order, "CLIENT_EN_ROUTE", message);
    }

    private void notifyCompleted(WorkOrder order) {
        String message = "Работы выполнены. Оцените качество обслуживания.";
        sendClientNotification(order, "CLIENT_COMPLETED", message);
    }

    private void sendClientNotification(WorkOrder order, String type, String message) {
        log.debug("Sending client notification: workOrder={} type={} message={}",
                order.getNumber(), type, message);

        notificationService.sendNotification(
                order.getId(),
                type,
                message,
                order.getContactId()
        );
    }
}

package ru.servisklimat.domain.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import ru.servisklimat.config.RabbitMQConfig;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private static final ZoneId MOSCOW = ZoneId.of("Europe/Moscow");

    private final RabbitTemplate rabbitTemplate;

    /**
     * Sends a notification message via RabbitMQ.
     * Gracefully handles AmqpException (e.g. when RabbitMQ is unavailable in tests).
     */
    public void sendNotification(UUID workOrderId, String type, String message, UUID recipientId) {
        NotificationMessage notification = new NotificationMessage(
                workOrderId,
                type,
                message,
                recipientId,
                ZonedDateTime.now(MOSCOW)
        );

        try {
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.NOTIFICATIONS_EXCHANGE,
                    RabbitMQConfig.NOTIFICATIONS_ROUTING,
                    notification
            );
            log.debug("Notification sent: workOrder={} type={} recipient={}", workOrderId, type, recipientId);
        } catch (AmqpException ex) {
            log.warn("Failed to send notification via RabbitMQ for workOrder={} type={}: {}",
                    workOrderId, type, ex.getMessage());
        } catch (Exception ex) {
            log.warn("Unexpected error sending notification for workOrder={} type={}: {}",
                    workOrderId, type, ex.getMessage());
        }
    }
}

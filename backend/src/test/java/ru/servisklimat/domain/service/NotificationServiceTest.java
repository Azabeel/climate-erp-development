package ru.servisklimat.domain.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import ru.servisklimat.config.RabbitMQConfig;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatNoException;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link NotificationService}.
 */
@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private RabbitTemplate rabbitTemplate;

    private NotificationService notificationService;

    @BeforeEach
    void setUp() {
        notificationService = new NotificationService(rabbitTemplate);
    }

    @Test
    void sendNotification_callsRabbitTemplate() {
        UUID workOrderId = UUID.randomUUID();
        UUID recipientId = UUID.randomUUID();

        notificationService.sendNotification(workOrderId, "SLA_RED", "Test message", recipientId);

        verify(rabbitTemplate).convertAndSend(
                eq(RabbitMQConfig.NOTIFICATIONS_EXCHANGE),
                eq(RabbitMQConfig.NOTIFICATIONS_ROUTING),
                any(NotificationMessage.class)
        );
    }

    @Test
    void sendNotification_withNullRecipient_doesNotThrow() {
        UUID workOrderId = UUID.randomUUID();

        assertThatNoException().isThrownBy(() ->
                notificationService.sendNotification(workOrderId, "SLA_YELLOW", "Warning", null));

        verify(rabbitTemplate).convertAndSend(
                anyString(), anyString(), any(NotificationMessage.class));
    }

    @Test
    void sendNotification_amqpException_isCaughtGracefully() {
        doThrow(new AmqpException("RabbitMQ unavailable"))
                .when(rabbitTemplate).convertAndSend(anyString(), anyString(), any(Object.class));

        UUID workOrderId = UUID.randomUUID();

        // Must NOT throw
        assertThatNoException().isThrownBy(() ->
                notificationService.sendNotification(workOrderId, "SLA_RED", "Critical", null));
    }

    @Test
    void sendNotification_runtimeException_isCaughtGracefully() {
        doThrow(new RuntimeException("Connection refused"))
                .when(rabbitTemplate).convertAndSend(anyString(), anyString(), any(Object.class));

        assertThatNoException().isThrownBy(() ->
                notificationService.sendNotification(UUID.randomUUID(), "SLA_RED", "msg", null));
    }

    @Test
    void sendNotification_messageContainsCorrectFields() {
        UUID workOrderId = UUID.randomUUID();
        UUID recipientId = UUID.randomUUID();
        String type = "CLIENT_COMPLETED";
        String message = "Работы выполнены";

        notificationService.sendNotification(workOrderId, type, message, recipientId);

        verify(rabbitTemplate).convertAndSend(
                eq(RabbitMQConfig.NOTIFICATIONS_EXCHANGE),
                eq(RabbitMQConfig.NOTIFICATIONS_ROUTING),
                argThat((NotificationMessage msg) ->
                        msg.workOrderId().equals(workOrderId)
                                && msg.type().equals(type)
                                && msg.message().equals(message)
                                && msg.recipientId().equals(recipientId)
                                && msg.sentAt() != null
                )
        );
    }
}

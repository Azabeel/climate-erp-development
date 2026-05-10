package ru.servisklimat.domain.service;

import java.time.ZonedDateTime;
import java.util.UUID;

public record NotificationMessage(
        UUID workOrderId,
        String type,
        String message,
        UUID recipientId,
        ZonedDateTime sentAt
) {}

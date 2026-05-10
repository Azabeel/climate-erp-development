package ru.servisklimat.api.dto.inbox;

import ru.servisklimat.domain.model.enums.Channel;

import java.time.ZonedDateTime;
import java.util.UUID;

public record InboxMessageDto(
        UUID id,
        Channel channel,
        UUID clientId,
        String phone,
        String email,
        String subject,
        String body,
        boolean isRead,
        UUID workOrderId,
        ZonedDateTime receivedAt,
        ZonedDateTime processedAt
) {}

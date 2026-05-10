package ru.servisklimat.api.dto.contact;

import ru.servisklimat.domain.model.enums.Channel;

import java.time.ZonedDateTime;
import java.util.UUID;

public record ContactDto(
        UUID id,
        UUID clientId,
        String fullName,
        String position,
        String phone,
        String email,
        Channel preferredChannel,
        String telegramChatId,
        String whatsappNumber,
        Boolean isPrimary,
        Boolean isActive,
        ZonedDateTime createdAt
) {}

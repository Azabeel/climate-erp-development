package ru.servisklimat.api.dto.client;

import ru.servisklimat.domain.model.enums.Channel;
import ru.servisklimat.domain.model.enums.ClientType;

import java.time.ZonedDateTime;
import java.util.UUID;

public record ClientDto(
        UUID id,
        ClientType type,
        String name,
        String inn,
        String kpp,
        String legalAddress,
        String actualAddress,
        String phone,
        String email,
        Channel preferredChannel,
        String telegramChatId,
        String whatsappNumber,
        String maxUserId,
        Integer healthScore,
        String externalId,
        Boolean isActive,
        ZonedDateTime createdAt,
        ZonedDateTime updatedAt
) {}

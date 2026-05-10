package ru.servisklimat.api.dto.client;

import ru.servisklimat.domain.model.enums.Channel;
import ru.servisklimat.domain.model.enums.ClientType;

public record UpdateClientRequest(
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
        String externalId
) {}

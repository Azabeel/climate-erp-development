package ru.servisklimat.api.dto.client;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import ru.servisklimat.domain.model.enums.Channel;
import ru.servisklimat.domain.model.enums.ClientType;

public record CreateClientRequest(
        @NotNull ClientType type,
        @NotBlank String name,
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
        String externalId
) {}

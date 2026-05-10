package ru.servisklimat.api.dto.inbox;

import jakarta.validation.constraints.NotNull;
import ru.servisklimat.domain.model.enums.Channel;

public record CreateInboxMessageRequest(
        @NotNull Channel channel,
        String externalId,
        String phone,
        String body
) {}

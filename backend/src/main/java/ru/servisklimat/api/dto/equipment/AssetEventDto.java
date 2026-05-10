package ru.servisklimat.api.dto.equipment;

import java.time.ZonedDateTime;
import java.util.UUID;

public record AssetEventDto(
        UUID id,
        String eventType,
        String description,
        ZonedDateTime occurredAt,
        UUID relatedEntityId
) {}

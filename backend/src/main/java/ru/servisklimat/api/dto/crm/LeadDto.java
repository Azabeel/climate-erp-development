package ru.servisklimat.api.dto.crm;

import java.time.ZonedDateTime;
import java.util.UUID;

public record LeadDto(
        UUID id,
        UUID clientId,
        String name,
        String phone,
        String email,
        String source,
        String status,
        UUID assignedTo,
        ZonedDateTime createdAt
) {}

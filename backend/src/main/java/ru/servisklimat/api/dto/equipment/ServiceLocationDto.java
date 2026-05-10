package ru.servisklimat.api.dto.equipment;

import java.math.BigDecimal;
import java.util.UUID;

public record ServiceLocationDto(
        UUID id,
        UUID clientId,
        String name,
        String address,
        BigDecimal lat,
        BigDecimal lng,
        String timezone,
        String floor,
        String room,
        String accessNotes,
        Boolean isActive
) {}

package ru.servisklimat.api.dto.service;

import ru.servisklimat.domain.model.enums.ExecutionType;

import java.math.BigDecimal;
import java.util.UUID;

public record ServiceDto(
        UUID id,
        String name,
        String shortName,
        String description,
        int baseDurationMinutes,
        ExecutionType executionType,
        BigDecimal basePrice,
        boolean isActive
) {}

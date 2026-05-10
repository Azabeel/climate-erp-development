package ru.servisklimat.api.dto.brand;

import java.time.ZonedDateTime;
import java.util.UUID;

public record BrandDto(
        UUID id,
        String name,
        Boolean isActive,
        ZonedDateTime createdAt
) {}

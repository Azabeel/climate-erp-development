package ru.servisklimat.api.dto.supplier;

import java.time.ZonedDateTime;
import java.util.UUID;

public record SupplierDto(
        UUID id,
        String name,
        String phone,
        String email,
        String address,
        String contactPerson,
        String notes,
        Boolean isActive,
        ZonedDateTime createdAt
) {}

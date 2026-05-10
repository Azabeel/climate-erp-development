package ru.servisklimat.api.dto.equipment;

import java.util.UUID;

public record EquipmentTypeDto(
        UUID id,
        String name,
        String attributesSchema,
        Boolean isActive
) {}

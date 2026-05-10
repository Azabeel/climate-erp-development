package ru.servisklimat.api.dto.refrigerant;

import ru.servisklimat.domain.model.enums.StockLocationType;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

public record RefrigerantCylinderDto(
        UUID id,
        String serialNumber,
        UUID refrigerantTypeId,
        BigDecimal initialWeightKg,
        BigDecimal currentWeightKg,
        UUID engineerId,
        StockLocationType locationType,
        BigDecimal purchasePrice,
        Boolean isActive,
        ZonedDateTime createdAt
) {}

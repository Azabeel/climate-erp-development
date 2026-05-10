package ru.servisklimat.api.dto.stock;

import ru.servisklimat.domain.model.enums.MovementType;
import ru.servisklimat.domain.model.enums.StockLocationType;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

public record StockMovementDto(
        UUID id,
        UUID stockItemId,
        StockLocationType fromLocationType,
        UUID fromEngineerId,
        StockLocationType toLocationType,
        UUID toEngineerId,
        UUID workOrderId,
        BigDecimal qty,
        BigDecimal unitPrice,
        MovementType type,
        String notes,
        UUID createdBy,
        ZonedDateTime createdAt
) {}

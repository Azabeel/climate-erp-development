package ru.servisklimat.api.dto.stock;

import ru.servisklimat.domain.model.enums.StockLocationType;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

public record StockBalanceDto(
        UUID id,
        UUID stockItemId,
        StockLocationType locationType,
        UUID engineerId,
        BigDecimal qty,
        BigDecimal reservedQty,
        BigDecimal availableQty,
        ZonedDateTime updatedAt
) {}

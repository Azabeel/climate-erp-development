package ru.servisklimat.api.dto.stock;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

public record StockItemDto(
        UUID id,
        String name,
        String article,
        String unit,
        String category,
        UUID brandId,
        BigDecimal minStockLevel,
        BigDecimal purchasePrice,
        BigDecimal salePrice,
        String barcode,
        String externalId,
        Boolean isActive,
        ZonedDateTime createdAt
) {}

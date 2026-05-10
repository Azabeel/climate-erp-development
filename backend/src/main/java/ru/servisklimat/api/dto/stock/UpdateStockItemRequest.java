package ru.servisklimat.api.dto.stock;

import java.math.BigDecimal;
import java.util.UUID;

public record UpdateStockItemRequest(
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
        Boolean isActive
) {}

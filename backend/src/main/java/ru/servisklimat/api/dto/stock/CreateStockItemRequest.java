package ru.servisklimat.api.dto.stock;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record CreateStockItemRequest(
        @NotBlank String name,
        String article,
        String unit,
        String category,
        UUID brandId,
        @NotNull BigDecimal minStockLevel,
        @NotNull BigDecimal purchasePrice,
        @NotNull BigDecimal salePrice,
        String barcode,
        String externalId
) {}

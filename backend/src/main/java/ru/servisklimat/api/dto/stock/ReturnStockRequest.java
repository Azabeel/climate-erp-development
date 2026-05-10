package ru.servisklimat.api.dto.stock;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.UUID;

public record ReturnStockRequest(
        @NotNull UUID stockItemId,
        @NotNull UUID engineerId,
        @NotNull @Positive BigDecimal qty,
        BigDecimal unitPrice,
        String notes,
        UUID createdBy
) {}

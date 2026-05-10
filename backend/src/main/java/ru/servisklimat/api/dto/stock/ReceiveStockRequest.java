package ru.servisklimat.api.dto.stock;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.UUID;

public record ReceiveStockRequest(
        @NotNull UUID stockItemId,
        @NotNull @Positive BigDecimal qty,
        @NotNull BigDecimal unitPrice,
        String notes,
        UUID createdBy
) {}

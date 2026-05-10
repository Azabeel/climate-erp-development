package ru.servisklimat.api.dto.workorder;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record AddMaterialRequest(
        @NotNull UUID stockItemId,
        @NotNull BigDecimal qty,
        @NotNull BigDecimal unitPrice,
        BigDecimal salePrice
) {}

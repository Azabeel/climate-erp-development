package ru.servisklimat.api.dto.refrigerant;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import ru.servisklimat.domain.model.enums.StockLocationType;

import java.math.BigDecimal;
import java.util.UUID;

public record CreateCylinderRequest(
        @NotBlank String serialNumber,
        @NotNull UUID refrigerantTypeId,
        @NotNull @Positive BigDecimal initialWeightKg,
        @NotNull @Positive BigDecimal currentWeightKg,
        UUID engineerId,
        StockLocationType locationType,
        BigDecimal purchasePrice
) {}

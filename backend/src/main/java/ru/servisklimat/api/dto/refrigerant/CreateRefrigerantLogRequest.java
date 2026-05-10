package ru.servisklimat.api.dto.refrigerant;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import ru.servisklimat.domain.model.enums.RefrigerantOperation;

import java.math.BigDecimal;
import java.util.UUID;

public record CreateRefrigerantLogRequest(
        UUID workOrderId,
        UUID equipmentId,
        UUID engineerId,
        @NotNull UUID cylinderId,
        @NotNull UUID refrigerantTypeId,
        @NotNull RefrigerantOperation operationType,
        @NotNull @Positive BigDecimal amountKg,
        BigDecimal unitPrice,
        String notes,
        UUID createdBy
) {}

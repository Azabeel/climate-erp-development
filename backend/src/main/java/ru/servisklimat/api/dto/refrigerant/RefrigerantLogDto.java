package ru.servisklimat.api.dto.refrigerant;

import ru.servisklimat.domain.model.enums.RefrigerantOperation;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

public record RefrigerantLogDto(
        UUID id,
        UUID workOrderId,
        UUID equipmentId,
        UUID engineerId,
        UUID cylinderId,
        UUID refrigerantTypeId,
        RefrigerantOperation operationType,
        BigDecimal amountKg,
        BigDecimal unitPrice,
        String notes,
        UUID createdBy,
        ZonedDateTime createdAt
) {}

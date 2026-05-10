package ru.servisklimat.api.dto.workorder;

import ru.servisklimat.domain.model.enums.WorkOrderStatus;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

public record WorkOrderStatusLogDto(
        UUID id,
        UUID workOrderId,
        WorkOrderStatus oldStatus,
        WorkOrderStatus newStatus,
        String comment,
        BigDecimal lat,
        BigDecimal lng,
        UUID changedBy,
        ZonedDateTime changedAt
) {}

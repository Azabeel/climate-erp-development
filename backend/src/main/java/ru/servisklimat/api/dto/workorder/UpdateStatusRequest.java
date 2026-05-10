package ru.servisklimat.api.dto.workorder;

import jakarta.validation.constraints.NotNull;
import ru.servisklimat.domain.model.enums.WorkOrderStatus;

import java.math.BigDecimal;

public record UpdateStatusRequest(
        @NotNull WorkOrderStatus status,
        String comment,
        BigDecimal lat,
        BigDecimal lng
) {}

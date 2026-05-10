package ru.servisklimat.api.dto.workorder;

import ru.servisklimat.domain.model.enums.WorkOrderStatus;

import java.util.List;
import java.util.UUID;

public record WorkOrderFilterDto(
        List<WorkOrderStatus> statuses,
        UUID clientId,
        UUID engineerId
) {}

package ru.servisklimat.api.dto.workorder;

import jakarta.validation.constraints.NotNull;
import ru.servisklimat.domain.model.enums.Priority;
import ru.servisklimat.domain.model.enums.WorkOrderSource;
import ru.servisklimat.domain.model.enums.WorkOrderType;

import java.util.UUID;

public record CreateWorkOrderRequest(
        @NotNull UUID clientId,
        @NotNull WorkOrderType type,
        @NotNull Priority priority,
        @NotNull WorkOrderSource source,
        UUID contractId,
        UUID contactId,
        UUID locationId,
        UUID equipmentId,
        String description,
        String dispatcherComment
) {}

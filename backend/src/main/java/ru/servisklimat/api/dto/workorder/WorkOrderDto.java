package ru.servisklimat.api.dto.workorder;

import ru.servisklimat.domain.model.enums.*;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

public record WorkOrderDto(
        UUID id,
        String number,
        WorkOrderType type,
        WorkOrderStatus status,
        Priority priority,
        WorkOrderSource source,

        UUID clientId,
        String clientName,
        UUID contractId,
        UUID contactId,
        UUID locationId,
        UUID equipmentId,
        UUID slaConfigId,

        String description,
        String dispatcherComment,
        String engineerReport,

        Integer totalEstimatedDurationMinutes,
        boolean hasParallelTasks,
        boolean requiresTwoEngineers,

        ZonedDateTime scheduledStart,
        ZonedDateTime scheduledEnd,

        UUID engineerId,
        String engineerName,
        UUID secondEngineerId,
        String secondEngineerName,

        ZonedDateTime actualStart,
        ZonedDateTime actualEnd,

        ZonedDateTime slaTtrPlanned,
        ZonedDateTime slaTtrActual,
        ZonedDateTime slaTtoPlanned,
        ZonedDateTime slaTtoActual,
        ZonedDateTime slaTtfPlanned,
        ZonedDateTime slaTtfActual,

        SLAStatus slaStatus,
        boolean slaViolated,

        BigDecimal costPrice,
        BigDecimal revenue,
        BigDecimal margin,
        BigDecimal marginPercent,

        Integer clientRating,
        String clientComment,

        ZonedDateTime createdAt,
        ZonedDateTime updatedAt,
        ZonedDateTime closedAt
) {}

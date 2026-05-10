package ru.servisklimat.api.dto.crm;

import ru.servisklimat.domain.model.enums.DealStage;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.UUID;

public record DealDto(
        UUID id,
        UUID leadId,
        UUID clientId,
        String title,
        DealStage stage,
        BigDecimal amount,
        int probability,
        LocalDate plannedCloseDate,
        UUID assignedTo,
        ZonedDateTime createdAt
) {}

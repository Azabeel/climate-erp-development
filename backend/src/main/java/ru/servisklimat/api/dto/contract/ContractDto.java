package ru.servisklimat.api.dto.contract;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.UUID;

public record ContractDto(
        UUID id,
        UUID clientId,
        String number,
        LocalDate dateStart,
        LocalDate dateEnd,
        String status,
        UUID slaConfigId,
        Boolean penaltyEnabled,
        String penaltyType,
        BigDecimal penaltyValue,
        BigDecimal budgetLimit,
        String budgetPeriod,
        String notes,
        String fileUrl,
        String externalId,
        ZonedDateTime createdAt,
        ZonedDateTime updatedAt
) {}

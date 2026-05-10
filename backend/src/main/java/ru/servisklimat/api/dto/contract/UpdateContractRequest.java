package ru.servisklimat.api.dto.contract;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record UpdateContractRequest(
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
        String externalId
) {}

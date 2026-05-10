package ru.servisklimat.api.dto.contract;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CreateContractRequest(
        @NotNull UUID clientId,
        @NotBlank String number,
        @NotNull LocalDate dateStart,
        LocalDate dateEnd,
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

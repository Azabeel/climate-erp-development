package ru.servisklimat.api.dto.crm;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CreateDealRequest(
        UUID leadId,
        @NotNull UUID clientId,
        @NotBlank String title,
        BigDecimal amount,
        Integer probability,
        LocalDate plannedCloseDate,
        UUID assignedTo
) {}

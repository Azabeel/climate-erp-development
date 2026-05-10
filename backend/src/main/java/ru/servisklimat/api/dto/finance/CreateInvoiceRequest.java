package ru.servisklimat.api.dto.finance;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public record CreateInvoiceRequest(
        @NotNull UUID workOrderId,
        @NotNull UUID clientId,
        LocalDate dueDate
) {}

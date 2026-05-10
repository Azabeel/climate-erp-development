package ru.servisklimat.api.dto.purchase;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public record CreatePurchaseRequest(
        @NotNull UUID workOrderId,
        UUID engineerId,
        UUID responsibleUserId,
        LocalDate latestDeliveryDate,
        String notes
) {}

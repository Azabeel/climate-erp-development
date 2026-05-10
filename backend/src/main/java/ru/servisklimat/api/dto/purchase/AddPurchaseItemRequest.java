package ru.servisklimat.api.dto.purchase;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record AddPurchaseItemRequest(
        @NotBlank String name,
        String article,
        @Positive BigDecimal qty,
        String unit,
        UUID supplierId,
        BigDecimal purchasePrice,
        BigDecimal markupPercent,
        BigDecimal markupAmount,
        LocalDate plannedDeliveryDate,
        String engineerComment
) {}

package ru.servisklimat.api.dto.purchase;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.UUID;

public record PurchaseRequestItemDto(
        UUID id,
        String name,
        String article,
        BigDecimal qty,
        String unit,
        UUID supplierId,
        BigDecimal purchasePrice,
        String currency,
        BigDecimal markupPercent,
        BigDecimal markupAmount,
        BigDecimal salePrice,
        LocalDate plannedDeliveryDate,
        String carrierName,
        String trackingNumber,
        String invoiceUrl,
        String status,
        String engineerComment,
        ZonedDateTime createdAt
) {}
